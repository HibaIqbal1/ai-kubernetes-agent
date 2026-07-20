from typing import Dict, Any, List
from app.kubernetes.kubectl_executor import KubectlExecutor

class EventsAnalyzer:
    @staticmethod
    def analyze_events() -> Dict[str, Any]:
        cmd = ["kubectl", "get", "events", "-A", "-o", "json"]
        res = KubectlExecutor.run_json_command(cmd)

        if not res["success"] or not res["data"]:
            return {"warning_events": [], "error": res.get("error")}

        warning_events: List[Dict[str, Any]] = []
        items = res["data"].get("items", [])

        for event in items:
            event_type = event.get("type", "Normal")
            reason = event.get("reason", "")
            
            if event_type == "Warning":
                obj = event.get("involvedObject", {})
                warning_events.append({
                    "namespace": event.get("metadata", {}).get("namespace", "default"),
                    "reason": reason,
                    "message": event.get("message", ""),
                    "object": f"{obj.get('kind')}/{obj.get('name')}",
                    "count": event.get("count", 1)
                })

        return {
            "total_warning_events": len(warning_events),
            "events": warning_events[:20]  # Return top 20 most relevant warnings
        }