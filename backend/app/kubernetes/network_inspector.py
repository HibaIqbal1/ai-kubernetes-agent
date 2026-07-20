from typing import Dict, Any, List
from app.kubernetes.kubectl_executor import KubectlExecutor

class NetworkInspector:
    @staticmethod
    def inspect_network() -> Dict[str, Any]:
        cmd_svc = ["kubectl", "get", "svc", "-A", "-o", "json"]
        cmd_ep = ["kubectl", "get", "endpoints", "-A", "-o", "json"]

        svc_res = KubectlExecutor.run_json_command(cmd_svc)
        ep_res = KubectlExecutor.run_json_command(cmd_ep)

        problematic_services: List[Dict[str, Any]] = []

        if svc_res["success"] and svc_res["data"]:
            endpoints_map = {}
            if ep_res["success"] and ep_res["data"]:
                for ep in ep_res["data"].get("items", []):
                    key = f"{ep.get('metadata', {}).get('namespace')}/{ep.get('metadata', {}).get('name')}"
                    subsets = ep.get("subsets", [])
                    endpoints_map[key] = len(subsets) > 0

            for svc in svc_res["data"].get("items", []):
                meta = svc.get("metadata", {})
                spec = svc.get("spec", {})
                
                name = meta.get("name")
                namespace = meta.get("namespace")
                selector = spec.get("selector", {})
                
                key = f"{namespace}/{name}"
                has_endpoints = endpoints_map.get(key, False)

                # Flag service if it defines selectors but has no endpoints
                if selector and not has_endpoints:
                    problematic_services.append({
                        "name": name,
                        "namespace": namespace,
                        "issue": "MissingEndpoints",
                        "details": "Service selector does not match any target pods."
                    })

        return {
            "healthy": len(problematic_services) == 0,
            "problematic_services": problematic_services
        }