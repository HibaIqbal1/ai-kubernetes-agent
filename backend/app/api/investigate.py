import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.services.k8s_collector import collect_cluster_evidence
from app.services.ai_reasoner import analyze_evidence

try:
    import yaml
except ImportError:
    yaml = None

router = APIRouter()

class InvestigateRequest(BaseModel):
    cluster_context: Optional[str] = None

@router.get("/clusters")
def list_clusters():
    """List available Kubernetes clusters/contexts from kubeconfig."""
    kubeconfig_path = os.getenv("KUBECONFIG_PATH", os.path.expanduser("~/.kube/config"))
    
    if not os.path.exists(kubeconfig_path) or yaml is None:
        return {"clusters": ["docker-desktop", "minikube", "kind-local-cluster"]}

    try:
        with open(kubeconfig_path, "r") as f:
            config = yaml.safe_load(f)
            contexts = [ctx["name"] for ctx in config.get("contexts", [])]
            current = config.get("current-context", contexts[0] if contexts else "default")
            return {"clusters": contexts, "current": current}
    except Exception:
        return {"clusters": ["docker-desktop", "minikube", "default"]}

@router.post("/investigate")
def run_investigation(req: Optional[InvestigateRequest] = None):
    cluster_context = req.cluster_context if req else None
    
    evidence = collect_cluster_evidence(context=cluster_context)
    analysis = analyze_evidence(evidence)
    
    return {
        "status": "success",
        "cluster": cluster_context or "default",
        "diagnosis": analysis
    }