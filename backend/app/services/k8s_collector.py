import subprocess
import json

def run_kubectl(command: list, context: str = None):
    try:
        base_cmd = ["kubectl"]
        if context:
            base_cmd.extend(["--context", context])
        
        result = subprocess.run(
            base_cmd + command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=10
        )
        if result.returncode != 0:
            return f"Error: {result.stderr.strip()}"
        return result.stdout.strip()
    except Exception as e:
        return f"Execution failed: {str(e)}"

def collect_cluster_evidence(context: str = None) -> dict:
    evidence = {
        "pods": run_kubectl(["get", "pods", "-A", "-o", "json"], context),
        "events": run_kubectl(["get", "events", "-A", "--sort-by=.metadata.creationTimestamp"], context),
        "deployments": run_kubectl(["get", "deployments", "-A", "-o", "json"], context)
    }
    
    # If kubectl execution threw errors across the board
    if "Execution failed" in evidence["pods"] or "Error:" in evidence["pods"]:
        evidence["status"] = "unreachable"
        
    return evidence