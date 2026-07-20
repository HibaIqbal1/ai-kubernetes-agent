from typing import Dict, Any, List
from app.kubernetes.kubectl_executor import KubectlExecutor

UNHEALTHY_STATUSES = {
    "CrashLoopBackOff", "ImagePullBackOff", "ErrImagePull", 
    "Pending", "Error", "OOMKilled", "ContainerCreating", "Terminating"
}

class PodInspector:
    @staticmethod
    def inspect_pods() -> Dict[str, Any]:
        cmd = ["kubectl", "get", "pods", "-A", "-o", "json"]
        res = KubectlExecutor.run_json_command(cmd)
        
        if not res["success"] or not res["data"]:
            return {
                "healthy": False,
                "error": res["error"] or "Unable to fetch pod data",
                "problematic_pods": []
            }

        problematic_pods: List[Dict[str, Any]] = []
        items = res["data"].get("items", [])

        for pod in items:
            metadata = pod.get("metadata", {})
            status_info = pod.get("status", {})
            
            name = metadata.get("name")
            namespace = metadata.get("namespace")
            phase = status_info.get("phase", "Unknown")
            
            # Check container statuses
            container_statuses = status_info.get("containerStatuses", [])
            reason = phase

            for cs in container_statuses:
                state = cs.get("state", {})
                waiting = state.get("waiting", {})
                terminated = state.get("terminated", {})
                
                if waiting and waiting.get("reason"):
                    reason = waiting.get("reason")
                elif terminated and terminated.get("reason"):
                    reason = terminated.get("reason")

            if reason in UNHEALTHY_STATUSES or phase not in ["Running", "Succeeded"]:
                problematic_pods.append({
                    "name": name,
                    "namespace": namespace,
                    "phase": phase,
                    "status": reason,
                    "restarts": container_statuses[0].get("restartCount", 0) if container_statuses else 0
                })

        return {
            "healthy": len(problematic_pods) == 0,
            "total_pods_checked": len(items),
            "problematic_pods": problematic_pods
        }