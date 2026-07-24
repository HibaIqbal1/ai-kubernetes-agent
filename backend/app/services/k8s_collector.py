def collect_cluster_evidence(context: str = None) -> dict:
    # Return different mock issues based on the selected cluster context
    if context == "minikube":
        return {
            "cluster_context": "minikube",
            "pods": ["pod/payment-service-7f (OOMKilled)"],
            "events": ["Memory limit exceeded: Container used 512Mi, limit was 256Mi"],
            "logs": "Fatal error: Out of memory"
        }
    elif context == "kind-local-cluster":
        return {
            "cluster_context": "kind-local-cluster",
            "pods": ["pod/ingress-nginx-controller (CrashLoopBackOff)"],
            "events": ["Liveness probe failed: HTTP probe failed with statuscode 500"],
            "logs": "Configuration syntax error on line 42"
        }
    else:
        # Default for docker-desktop
        return {
            "cluster_context": context or "docker-desktop",
            "pods": ["pod/backend-api-2 (ImagePullBackOff)"],
            "events": ["Failed to pull image 'myrepo/api:v999': repository does not exist"],
            "logs": "Error: image not found"
        }