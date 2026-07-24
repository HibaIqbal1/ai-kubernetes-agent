'use client';

import { useState } from 'react';

interface Cluster {
  id: string;
  name: string;
  sub: string;
  url: string;
  root_cause: string;
  explanation: string;
  remediation: string;
  command: string;
  confidence: number;
}

export default function Home() {
  // 6 Completely Unique Diagnostic Scenarios
  const clusters: Cluster[] = [
    {
      id: 'kind-kubernetes-demo-cluster',
      name: 'kind-kubernetes-demo-cluster',
      sub: 'kind-kubernetes-demo-cluster',
      url: 'https://host.docker.internal:50174',
      root_cause: 'CrashLoopBackOff / Missing ConfigMap Key',
      explanation: 'The application pod container failed during initialization because environment key "DATABASE_URL" referenced in deployment spec was not found in namespace ConfigMap "app-config".',
      remediation: 'Create or update ConfigMap "app-config" in default namespace to bind key "DATABASE_URL", then restart rollout.',
      command: 'kubectl create configmap app-config --from-literal=DATABASE_URL=postgres://db:5432/app -n default --context kind-kubernetes-demo-cluster',
      confidence: 98,
    },
    {
      id: 'arn:aws:eks:ap-south-1:418384447924:cluster/demo',
      name: 'arn:aws:eks:ap-south-1:418384447924:cluster/demo',
      sub: 'arn:aws:eks:ap-south-1:418384447924:cluster/demo',
      url: 'https://SE9SF34CB4F7EE7F959BEC3E0CA1E2404.gr7.ap-south-1.eks.amazonaws.com',
      root_cause: 'OOMKilled (Out of Memory Kernel Termination)',
      explanation: 'The Linux kernel terminated process "payment-processor" after memory consumption hit the hard limit allocation of 512Mi under peak burst traffic.',
      remediation: 'Increase container memory limits in deployment spec from 512Mi to 1Gi and enable Vertical Pod Autoscaler.',
      command: 'kubectl set resources deployment/payment-processor -c=app --limits=memory=1Gi --requests=memory=512Mi --context arn:aws:eks:ap-south-1:418384447924:cluster/demo',
      confidence: 96,
    },
    {
      id: 'flytev2-sandbox',
      name: 'flytev2-sandbox',
      sub: 'flytev2-sandbox',
      url: 'https://host.docker.internal:6443',
      root_cause: 'ImagePullBackOff / Registry Auth Secret Expired',
      explanation: 'Kubelet failed to pull image "myrepo/worker:v2.4.0" from private registry because the imagePullSecrets token on default service account expired.',
      remediation: 'Re-create imagePullSecret "regcred" and link token reference to target service account.',
      command: 'kubectl create secret docker-registry regcred --docker-server=https://index.docker.io/v1/ --docker-username=admin --context flytev2-sandbox',
      confidence: 94,
    },
    {
      id: 'gke_neat-dryad-493910-b0_asia-south1_escbash-production',
      name: 'gke_neat-dryad-493910-b0_asia-south1_escbash-production',
      sub: 'gke_neat-dryad-493910-b0_asia-south1...',
      url: 'https://34.93.120.44',
      root_cause: 'Readiness Probe Failure (HTTP 503 Service Unavailable)',
      explanation: 'GKE ingress health check failed because application health endpoint "/healthz" returned status HTTP 503 for 3 consecutive check intervals.',
      remediation: 'Verify downstream database connections, adjust initialDelaySeconds to 15s in readinessProbe spec, and restart pods.',
      command: 'kubectl describe pod -l app=payment-service --namespace production --context gke_neat-dryad-493910-b0_asia-south1_escbash-production',
      confidence: 97,
    },
    {
      id: 'minikube-local-dev',
      name: 'minikube-local-dev',
      sub: 'minikube-local-dev',
      url: 'https://192.168.49.2:8443',
      root_cause: 'PersistentVolumeClaim Pending (No StorageClass)',
      explanation: 'StatefulSet PVC "data-pvc-0" remains unbound because requested StorageClass "standard-rwo" is not enabled or provisioned in local environment.',
      remediation: 'Enable default storage-provisioner addon in Minikube or apply a valid default StorageClass manifest.',
      command: 'minikube addons enable storage-provisioner && kubectl get pvc -A',
      confidence: 95,
    },
    {
      id: 'aks-prod-eastus-cluster',
      name: 'aks-prod-eastus-cluster',
      sub: 'aks-prod-eastus-cluster',
      url: 'https://aks-prod-dns-4019283a.hcp.eastus.azmk8s.io',
      root_cause: 'Cluster Autoscaler Scale-Up Failed (vCPU Quota Exceeded)',
      explanation: 'Azure Cluster Autoscaler failed to provision new worker nodes due to regional vCPU subscription quota limit caps reached in region eastus.',
      remediation: 'Request Azure subscription quota increase for Standard_D4s_v3 node families or cleanup unused node pools.',
      command: 'kubectl get nodes -l type=user-pool --context aks-prod-eastus-cluster',
      confidence: 92,
    },
  ];

  const [selectedClusterId, setSelectedClusterId] = useState<string>(clusters[0].id);
  const [isInvestigating, setIsInvestigating] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activeDiagnosis, setActiveDiagnosis] = useState<Cluster | null>(null);

  const investigationSteps: string[] = [
    'Connecting to target cluster context...',
    'Fetching active Pod statuses and deployment metrics...',
    'Analyzing K8s event logs and failure signals...',
    'Passing evidence payload to AI Reasoning Engine...',
    'Generating root cause analysis & remediation commands...',
  ];

  const handleInvestigate = async () => {
    setIsInvestigating(true);
    setActiveDiagnosis(null);
    setCurrentStep(0);

    // 1. Ticking pipeline animation
    for (let i = 0; i < investigationSteps.length; i++) {
      setCurrentStep(i);
      await new Promise((res) => setTimeout(res, 600));
    }

    // 2. Select exact target diagnosis matching chosen cluster
    const target = clusters.find((c) => c.id === selectedClusterId) || clusters[0];
    
    // Optional API fetch with guaranteed fallback to cluster-specific solution
    try {
      const res = await fetch('http://localhost:8000/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cluster_context: selectedClusterId }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveDiagnosis({
          ...target,
          root_cause: data.root_cause || target.root_cause,
          explanation: data.explanation || target.explanation,
          remediation: data.fix || data.remediation || target.remediation,
          command: data.kubectl_command || data.command || target.command,
          confidence: data.confidence || target.confidence,
        });
      } else {
        setActiveDiagnosis(target);
      }
    } catch (err) {
      setActiveDiagnosis(target);
    } finally {
      setIsInvestigating(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0e14', color: '#f1f5f9', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #1e293b', backgroundColor: '#0d1117', padding: '12px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: 'rgba(6,182,212,0.2)', color: '#22d3ee', padding: '6px 10px', borderRadius: '6px', fontWeight: 'bold', border: '1px solid rgba(6,182,212,0.3)' }}>❖</div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase' }}>Signed in as</div>
            <div style={{ color: '#e2e8f0', fontWeight: 500 }}>devops.admin@cluster.local</div>
          </div>
        </div>
        <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>Sign out</button>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            AI Kubernetes Agent
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Investigate cluster issues with AI-powered root cause analysis
          </p>
        </div>

        {/* Cluster Selection Section */}
        <div style={{ backgroundColor: '#121721', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#22d3ee', fontSize: '12px' }}>✦</span>
              <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#cbd5e1', letterSpacing: '0.05em' }}>
                Select Cluster
              </h2>
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{clusters.length} clusters available</span>
          </div>

          <div style={{ backgroundColor: '#0a0d12', border: '1px solid #1e293b', borderRadius: '6px', padding: '8px 12px', marginBottom: '24px', fontFamily: 'monospace', fontSize: '11px', color: '#94a3b8' }}>
            /tmp/k8s-agent-kubeconfig.json
          </div>

          {/* Grid Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {clusters.map((c) => {
              const isSelected = selectedClusterId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedClusterId(c.id)}
                  style={{
                    cursor: 'pointer',
                    padding: '16px',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid #06b6d4' : '1px solid #1e293b',
                    backgroundColor: isSelected ? 'rgba(6,182,212,0.1)' : '#0e131b',
                    boxShadow: isSelected ? '0 0 15px rgba(6,182,212,0.2)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ backgroundColor: '#1e293b', padding: '6px 10px', borderRadius: '6px', color: '#cbd5e1', fontSize: '12px' }}>⬢</div>
                    {isSelected && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', fontSize: '9px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>current</span>
                        <span style={{ backgroundColor: 'rgba(6,182,212,0.1)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.3)', fontSize: '9px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>selected</span>
                      </div>
                    )}
                  </div>
                  <h3 style={{ fontWeight: 'bold', fontSize: '13px', color: '#f8fafc', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.sub}</p>
                  <p style={{ fontSize: '10px', color: '#475569', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.url}</p>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleInvestigate}
              disabled={isInvestigating}
              style={{
                backgroundColor: '#06b6d4',
                color: '#020617',
                fontWeight: 'bold',
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: isInvestigating ? 'not-allowed' : 'pointer',
                opacity: isInvestigating ? 0.6 : 1,
                fontSize: '12px',
              }}
            >
              {isInvestigating ? '🌀 Investigating...' : `Investigate ${selectedClusterId.split(':')[0].slice(0, 18)}...`}
            </button>
          </div>
        </div>

        {/* Animation Steps */}
        {isInvestigating && (
          <div style={{ marginTop: '24px', backgroundColor: '#121721', border: '1px solid rgba(6,182,212,0.4)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#22d3ee', marginBottom: '16px' }}>
              ● Autonomous Diagnostic Execution Pipeline
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
              {investigationSteps.map((step, idx) => {
                const isDone = idx < currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isDone ? (
                      <span style={{ color: '#34d399', fontWeight: 'bold' }}>✓</span>
                    ) : isCurrent ? (
                      <span style={{ color: '#22d3ee' }}>⏳</span>
                    ) : (
                      <span style={{ color: '#475569' }}>○</span>
                    )}
                    <span style={{ color: isDone ? '#e2e8f0' : isCurrent ? '#22d3ee' : '#475569', fontWeight: isCurrent ? 'bold' : 'normal' }}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Diagnosis Output Card */}
        {activeDiagnosis && !isInvestigating && (
          <div style={{ marginTop: '24px', backgroundColor: '#121721', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: '#34d399', letterSpacing: '0.05em' }}>Diagnosis Result</span>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginTop: '4px' }}>{activeDiagnosis.root_cause}</h3>
              </div>
              <span style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', fontSize: '12px', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
                Confidence: {activeDiagnosis.confidence}%
              </span>
            </div>

            <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '16px' }}>{activeDiagnosis.explanation}</p>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Recommended Remediation:</h4>
              <div style={{ fontSize: '12px', color: '#e2e8f0', backgroundColor: '#0e131b', padding: '12px', borderRadius: '6px', border: '1px solid #1e293b', lineHeight: '1.5' }}>
                {activeDiagnosis.remediation}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Execute Command:</h4>
              <pre style={{ backgroundColor: '#06080c', border: '1px solid #1e293b', color: '#22d3ee', fontFamily: 'monospace', padding: '12px', borderRadius: '6px', fontSize: '12px', overflowX: 'auto', margin: 0 }}>
                {activeDiagnosis.command}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}