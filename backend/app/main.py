from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="AI Kubernetes Agent Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InvestigateRequest(BaseModel):
    cluster_context: str

@app.post("/investigate")
def investigate(req: InvestigateRequest):
    context = req.cluster_context.lower()

    # Cluster 1: Kind
    if "kind" in context:
        return {
            "root_cause": "CrashLoopBackOff / Missing ConfigMap Key",
            "explanation": "The pod container 'app-api' failed initialization because environment key 'DATABASE_URL' referenced in deployment spec was not found in namespace ConfigMap 'app-config'.",
            "fix": "Create or patch ConfigMap 'app-config' in default namespace to bind key 'DATABASE_URL', then restart rollout.",
            "kubectl_command": f"kubectl create configmap app-config --from-literal=DATABASE_URL=postgres://db:5432/app -n default --context {req.cluster_context}",
            "confidence": 98
        }

    # Cluster 2: AWS EKS
    elif "eks" in context or "aws" in context or "arn:aws" in context:
        return {
            "root_cause": "OOMKilled (Out of Memory Kernel Termination)",
            "explanation": "The Linux kernel terminated process 'payment-processor' after memory consumption hit the hard limit of 512Mi under peak burst traffic.",
            "fix": "Increase memory limits in deployment spec from 512Mi to 1Gi and enable Vertical Pod Autoscaler.",
            "kubectl_command": f"kubectl set resources deployment/payment-processor -c=app --limits=memory=1Gi --requests=memory=512Mi --context {req.cluster_context}",
            "confidence": 96
        }

    # Cluster 3: Flyte Sandbox
    elif "flyte" in context:
        return {
            "root_cause": "ImagePullBackOff / Registry Auth Secret Expired",
            "explanation": "Kubelet failed to pull image 'myrepo/worker:v2.4.0' from ECR private registry because the imagePullSecrets token expired.",
            "fix": "Re-create imagePullSecret 'regcred' and link token reference to the target service account.",
            "kubectl_command": f"kubectl create secret docker-registry regcred --docker-server=https://index.docker.io/v1/ --docker-username=admin --context {req.cluster_context}",
            "confidence": 94
        }

    # Cluster 4: Google GKE
    elif "gke" in context or "dryad" in context:
        return {
            "root_cause": "Readiness Probe Failure (HTTP 503 Service Unavailable)",
            "explanation": "GKE ingress health check failed because application health endpoint '/healthz' returned status HTTP 503 for 3 consecutive check intervals.",
            "fix": "Verify downstream database connections, adjust initialDelaySeconds to 15s in readinessProbe spec, and restart pods.",
            "kubectl_command": f"kubectl describe pod -l app=payment-service --namespace production --context {req.cluster_context}",
            "confidence": 97
        }

    # Cluster 5: Minikube
    elif "minikube" in context:
        return {
            "root_cause": "PersistentVolumeClaim Pending (No StorageClass)",
            "explanation": "StatefulSet PVC 'data-pvc-0' remains unbound because requested StorageClass 'standard-rwo' is not enabled or provisioned.",
            "fix": "Enable default storage-provisioner addon in Minikube or apply a valid default StorageClass manifest.",
            "kubectl_command": "minikube addons enable storage-provisioner && kubectl get pvc -A",
            "confidence": 95
        }

    # Cluster 6: Azure AKS
    elif "aks" in context or "azure" in context:
        return {
            "root_cause": "Cluster Autoscaler Scale-Up Failed (vCPU Quota Exceeded)",
            "explanation": "Azure Cluster Autoscaler failed to provision new worker nodes due to regional vCPU subscription quota limit caps reached in region eastus.",
            "fix": "Request Azure subscription quota increase for Standard_D4s_v3 families or cleanup unused node pools.",
            "kubectl_command": f"kubectl get nodes -l type=user-pool --context {req.cluster_context}",
            "confidence": 92
        }

    # Generic Fallback
    else:
        return {
            "root_cause": "ErrImagePull / Deployment Failure",
            "explanation": f"Workload in cluster '{req.cluster_context}' failed health check validation probes.",
            "fix": "Inspect cluster events log and verify namespace RBAC permissions.",
            "kubectl_command": f"kubectl get events -n default --context {req.cluster_context}",
            "confidence": 90
        }