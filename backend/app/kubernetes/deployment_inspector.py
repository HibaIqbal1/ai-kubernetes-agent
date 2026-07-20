from typing import Dict, Any, List
from app.kubernetes.kubectl_executor import KubectlExecutor

class DeploymentInspector:
    @staticmethod
    def inspect_deployments() -> Dict[str, Any]:
        cmd = ["kubectl", "get", "deployments", "-A", "-o", "json"]
        res = KubectlExecutor.run_json_command(cmd)

        if not res["success"] or not res["data"]:
            return {"unhealthy_deployments": [], "error": res.get("error")}

        unhealthy_deployments: List[Dict[str, Any]] = []
        items = res["data"].get("items", [])

        for dep in items:
            metadata = dep.get("metadata", {})
            status = dep.get("status", {})
            spec = dep.get("spec", {})

            name = metadata.get("name")
            namespace = metadata.get("namespace")
            
            desired = spec.get("replicas", 0)
            available = status.get("availableReplicas", 0)
            ready = status.get("readyReplicas", 0)

            if available < desired or ready < desired:
                unhealthy_deployments.append({
                    "name": name,
                    "namespace": namespace,
                    "desired_replicas": desired,
                    "available_replicas": available,
                    "ready_replicas": ready,
                    "conditions": status.get("conditions", [])
                })

        return {
            "healthy": len(unhealthy_deployments) == 0,
            "unhealthy_deployments": unhealthy_deployments
        }