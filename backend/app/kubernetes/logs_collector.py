from typing import Dict, Any, List
from app.kubernetes.kubectl_executor import KubectlExecutor

class LogsCollector:
    @staticmethod
    def collect_logs(problematic_pods: List[Dict[str, Any]], tail_lines: int = 50) -> Dict[str, Any]:
        logs_data = {}

        for pod in problematic_pods:
            pod_name = pod["name"]
            namespace = pod["namespace"]
            
            cmd = ["kubectl", "logs", pod_name, "-n", namespace, f"--tail={tail_lines}"]
            res = KubectlExecutor.run_command(cmd)
            
            pod_key = f"{namespace}/{pod_name}"
            if res["success"]:
                logs_data[pod_key] = res["output"] if res["output"] else "No log output available."
            else:
                logs_data[pod_key] = f"Error fetching logs: {res['error']}"

        return logs_data