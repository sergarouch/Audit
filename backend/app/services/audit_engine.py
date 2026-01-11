from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.models.audit_attribute import AuditAttribute, AttributeType, RuleType
from app.models.work_paper import WorkPaper


class AuditEngine:
    def __init__(self, db: Session):
        self.db = db
    
    def audit_work_paper(self, work_paper_id: int) -> Dict[str, Any]:
        """Audit a work paper against all active attributes"""
        work_paper = self.db.query(WorkPaper).filter(WorkPaper.id == work_paper_id).first()
        if not work_paper:
            raise ValueError(f"Work paper {work_paper_id} not found")
        
        attributes = self.db.query(AuditAttribute).all()
        results = {
            "work_paper_id": work_paper_id,
            "attributes_checked": len(attributes),
            "passed": 0,
            "failed": 0,
            "warnings": 0,
            "findings": []
        }
        
        for attribute in attributes:
            finding = self._evaluate_attribute(work_paper, attribute)
            results["findings"].append(finding)
            if finding["status"] == "pass":
                results["passed"] += 1
            elif finding["status"] == "fail":
                results["failed"] += 1
            else:
                results["warnings"] += 1
        
        return results
    
    def _evaluate_attribute(self, work_paper: WorkPaper, attribute: AuditAttribute) -> Dict[str, Any]:
        """Evaluate a single attribute against a work paper"""
        finding = {
            "attribute_id": attribute.id,
            "attribute_name": attribute.name,
            "status": "pass",
            "details": None,
            "recommendation": None
        }
        
        if attribute.attribute_type == AttributeType.VALIDATION_RULE:
            finding = self._evaluate_validation_rule(work_paper, attribute, finding)
        elif attribute.attribute_type == AttributeType.CHECKLIST_CRITERIA:
            finding = self._evaluate_checklist_criteria(work_paper, attribute, finding)
        
        return finding
    
    def _evaluate_validation_rule(self, work_paper: WorkPaper, attribute: AuditAttribute, finding: Dict) -> Dict:
        """Evaluate a validation rule"""
        if not attribute.rule_type or not attribute.rule_parameters:
            finding["status"] = "warning"
            finding["details"] = "Validation rule not properly configured"
            return finding
        
        form_data = work_paper.form_data or {}
        params = attribute.rule_parameters
        
        try:
            if attribute.rule_type == RuleType.THRESHOLD:
                field = params.get("field")
                operator = params.get("operator")
                value = params.get("value")
                
                if field not in form_data:
                    finding["status"] = "fail"
                    finding["details"] = f"Required field '{field}' not found in work paper"
                    finding["recommendation"] = f"Ensure field '{field}' is included in the work paper"
                    return finding
                
                field_value = form_data[field]
                if not isinstance(field_value, (int, float)):
                    try:
                        field_value = float(field_value)
                    except (ValueError, TypeError):
                        finding["status"] = "fail"
                        finding["details"] = f"Field '{field}' value '{field_value}' is not numeric"
                        finding["recommendation"] = f"Ensure field '{field}' contains a valid number"
                        return finding
                
                if operator == ">":
                    passed = field_value > value
                elif operator == ">=":
                    passed = field_value >= value
                elif operator == "<":
                    passed = field_value < value
                elif operator == "<=":
                    passed = field_value <= value
                elif operator == "==":
                    passed = field_value == value
                else:
                    passed = False
                
                if not passed:
                    finding["status"] = "fail"
                    finding["details"] = f"Field '{field}' value {field_value} does not meet requirement: {operator} {value}"
                    finding["recommendation"] = f"Review and correct the value for '{field}'"
            
            elif attribute.rule_type == RuleType.REQUIRED_FIELD:
                field = params.get("field")
                if field not in form_data or form_data[field] is None or form_data[field] == "":
                    finding["status"] = "fail"
                    finding["details"] = f"Required field '{field}' is missing or empty"
                    finding["recommendation"] = f"Ensure field '{field}' is provided with a value"
            
            elif attribute.rule_type == RuleType.DATE_RANGE:
                field = params.get("field")
                start_date = params.get("start_date")
                end_date = params.get("end_date")
                
                if field not in form_data:
                    finding["status"] = "fail"
                    finding["details"] = f"Date field '{field}' not found"
                    finding["recommendation"] = f"Ensure date field '{field}' is included"
                    return finding
                
                # Simple date validation - in production, use proper date parsing
                date_value = form_data[field]
                # For now, assume dates are strings in YYYY-MM-DD format
                if date_value < start_date or date_value > end_date:
                    finding["status"] = "fail"
                    finding["details"] = f"Date '{date_value}' is outside required range ({start_date} to {end_date})"
                    finding["recommendation"] = f"Ensure date is within the specified range"
        
        except Exception as e:
            finding["status"] = "warning"
            finding["details"] = f"Error evaluating rule: {str(e)}"
        
        return finding
    
    def _evaluate_checklist_criteria(self, work_paper: WorkPaper, attribute: AuditAttribute, finding: Dict) -> Dict:
        """Evaluate checklist criteria"""
        file_paths = work_paper.file_paths or []
        
        # Check if files are present (basic check)
        # In a more sophisticated implementation, you might check file content
        if attribute.is_required and len(file_paths) == 0:
            finding["status"] = "fail"
            finding["details"] = f"Required checklist item '{attribute.criteria_text}' not satisfied - no files uploaded"
            finding["recommendation"] = f"Upload supporting documentation for '{attribute.criteria_text}'"
        elif attribute.is_required and len(file_paths) > 0:
            finding["status"] = "pass"
            finding["details"] = f"Checklist item '{attribute.criteria_text}' satisfied - {len(file_paths)} file(s) uploaded"
        else:
            finding["status"] = "pass" if len(file_paths) > 0 else "warning"
            finding["details"] = f"Checklist item '{attribute.criteria_text}' - {len(file_paths)} file(s) uploaded"
        
        return finding
