from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.models.audit_attribute import AuditAttribute


class ConclusionGenerator:
    def __init__(self, db: Session):
        self.db = db
    
    def generate_conclusion(self, work_paper_id: int, audit_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate CPA conclusion from audit results"""
        total = audit_results["attributes_checked"]
        passed = audit_results["passed"]
        failed = audit_results["failed"]
        warnings = audit_results["warnings"]
        
        # Calculate overall score
        if total == 0:
            overall_score = 0.0
        else:
            overall_score = (passed / total) * 100
        
        # Get attribute names for findings
        findings_with_names = []
        for finding in audit_results["findings"]:
            attribute = self.db.query(AuditAttribute).filter(
                AuditAttribute.id == finding["attribute_id"]
            ).first()
            finding_with_name = {
                "attribute_id": finding["attribute_id"],
                "attribute_name": attribute.name if attribute else "Unknown",
                "status": finding["status"],
                "details": finding["details"],
                "recommendation": finding["recommendation"]
            }
            findings_with_names.append(finding_with_name)
        
        # Compliance summary
        compliance_summary = {
            "total_attributes": total,
            "passed": passed,
            "failed": failed,
            "warnings": warnings,
            "compliance_percentage": overall_score
        }
        
        # Generate CPA conclusion text
        cpa_conclusion_text = self._generate_cpa_narrative(
            overall_score, passed, failed, warnings, total, findings_with_names
        )
        
        return {
            "overall_score": round(overall_score, 2),
            "compliance_summary": compliance_summary,
            "findings": findings_with_names,
            "cpa_conclusion_text": cpa_conclusion_text
        }
    
    def _generate_cpa_narrative(self, score: float, passed: int, failed: int, warnings: int, total: int, findings: List[Dict]) -> str:
        """Generate professional CPA conclusion narrative"""
        narrative = f"**AUDIT CONCLUSION REPORT**\n\n"
        narrative += f"**Overall Compliance Score: {score:.2f}%**\n\n"
        
        narrative += f"**Executive Summary:**\n"
        narrative += f"This audit evaluated {total} attributes against the submitted work papers. "
        narrative += f"Of the attributes evaluated, {passed} passed, {failed} failed, "
        narrative += f"and {warnings} generated warnings.\n\n"
        
        if score >= 90:
            narrative += "**Conclusion:** The work papers demonstrate a high level of compliance with established audit criteria. "
            narrative += "The documentation is substantially complete and accurate, with minimal exceptions noted.\n\n"
        elif score >= 70:
            narrative += "**Conclusion:** The work papers demonstrate moderate compliance with established audit criteria. "
            narrative += "While the majority of requirements are met, certain areas require attention to achieve full compliance.\n\n"
        elif score >= 50:
            narrative += "**Conclusion:** The work papers demonstrate partial compliance with established audit criteria. "
            narrative += "Significant deficiencies were identified that require remediation to ensure proper compliance.\n\n"
        else:
            narrative += "**Conclusion:** The work papers demonstrate limited compliance with established audit criteria. "
            narrative += "Substantial deficiencies were identified that require immediate and comprehensive remediation.\n\n"
        
        if failed > 0 or warnings > 0:
            narrative += "**Detailed Findings:**\n\n"
            for finding in findings:
                if finding["status"] != "pass":
                    status_emoji = "❌" if finding["status"] == "fail" else "⚠️"
                    narrative += f"{status_emoji} **{finding['attribute_name']}** ({finding['status'].upper()})\n"
                    narrative += f"   Details: {finding['details']}\n"
                    if finding.get("recommendation"):
                        narrative += f"   Recommendation: {finding['recommendation']}\n"
                    narrative += "\n"
        
        narrative += "**Recommendations:**\n"
        if failed > 0:
            narrative += "1. Address all failed attributes promptly to improve compliance.\n"
        if warnings > 0:
            narrative += "2. Review and resolve warning conditions to enhance documentation quality.\n"
        if score < 90:
            narrative += "3. Implement additional controls and validation procedures to prevent future non-compliance.\n"
        
        if score >= 90:
            narrative += "\n**Final Assessment:** The work papers are acceptable for audit purposes with minor recommendations for improvement."
        else:
            narrative += "\n**Final Assessment:** The work papers require revision and resubmission to meet audit standards."
        
        return narrative
