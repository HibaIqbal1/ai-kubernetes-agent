"use client";

import { useState, useEffect } from "react";

type Diagnosis = {
  root_cause: string;
  explanation: string;
  fix: string;
  kubectl_command: string;
  prevention: string;
  confidence: number;
};

type HistoryItem = {
  id: number;
  timestamp: string;
  cluster: string;
  rootCause: string;
  confidence: number;
};

const progressSteps = [
  "Checking Pods",
  "Reading Logs",
  "Analyzing Events",
  "Inspecting Deployments",
  "Checking Networking",
  "AI Reasoning",
  "Root Cause Found",
];

export default function Dashboard() {
  const [clusters, setClusters] = useState<string[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string>("");
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // Initial history list
    setHistory([
      { id: 1, timestamp: "18:47:31", cluster: "docker-desktop", rootCause: "ImagePullBackOff", confidence: 99 },
      { id: 2, timestamp: "17:47:31", cluster: "minikube", rootCause: "OOMKilled", confidence: 95 }
    ]);

    fetch("http://localhost:8000/clusters")
      .then((res) => res.json())
      .then((data) => {
        if (data.clusters && data.clusters.length > 0) {
          setClusters(data.clusters);
          setSelectedCluster(data.current || data.clusters[0]);
        }
      })
      .catch(() => {
        setClusters(["docker-desktop", "minikube"]);
        setSelectedCluster("docker-desktop");
      });
  }, []);

  const handleInvestigate = async () => {
    setIsInvestigating(true);
    setDiagnosis(null);
    setError(null);
    setCurrentStep(0);

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < progressSteps.length - 2 ? prev + 1 : prev));
    }, 800);

    try {
      const response = await fetch("http://localhost:8000/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cluster_context: selectedCluster }),
      });

      if (!response.ok) throw new Error("Failed to connect to backend API");

      const data = await response.json();
      
      clearInterval(interval);
      setCurrentStep(progressSteps.length - 1);
      setDiagnosis(data.diagnosis);

      setHistory((prev) => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          cluster: selectedCluster || "default",
          rootCause: data.diagnosis.root_cause.substring(0, 30) + "...",
          confidence: data.diagnosis.confidence,
        },
        ...prev,
      ]);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || "An error occurred during investigation.");
      setCurrentStep(-1);
    } finally {
      setIsInvestigating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-6 md:p-12 font-sans" suppressHydrationWarning>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-6 border-b border-slate-300">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-mono text-xl font-bold shadow-sm">
              &gt;_
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">AI Kubernetes Agent</h1>
              <p className="text-xs text-slate-500 font-medium">Autonomous SRE Diagnostic System</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-300">
            Authenticated
          </span>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Action Area */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Cluster Selector Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Select Target Kubernetes Cluster
                </label>
                <select
                  value={selectedCluster}
                  onChange={(e) => setSelectedCluster(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all cursor-pointer"
                >
                  {clusters.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleInvestigate}
                disabled={isInvestigating}
                className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isInvestigating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Investigating {selectedCluster}...
                  </>
                ) : (
                  `Investigate ${selectedCluster || "Cluster"}`
                )}
              </button>
            </div>

            {/* Live Progress */}
            {currentStep >= 0 && !diagnosis && !error && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm">Live Investigation Progress</h3>
                <div className="space-y-2.5">
                  {progressSteps.map((step, index) => (
                    <div key={step} className="flex items-center gap-3 text-sm">
                      {index < currentStep ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">✓</span>
                      ) : index === currentStep ? (
                        <span className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border border-slate-300 bg-slate-50"></span>
                      )}
                      <span className={index === currentStep ? "text-blue-600 font-semibold" : index < currentStep ? "text-slate-700" : "text-slate-400"}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Connection Error */}
            {error && (
              <div className="bg-rose-50 p-6 rounded-2xl border border-rose-200 text-rose-800 space-y-1">
                <h3 className="font-semibold">Connection Error</h3>
                <p className="text-xs text-rose-600">{error}</p>
              </div>
            )}

            {/* Diagnosis Complete Card */}
            {diagnosis && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
                  <h3 className="font-semibold flex items-center gap-2 text-sm">
                    <span className="text-emerald-400">●</span> Diagnosis Complete
                  </h3>
                  <span className="bg-blue-600/30 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-medium">
                    Confidence: {diagnosis.confidence}%
                  </span>
                </div>
                
                <div className="p-6 space-y-5">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Root Cause</h4>
                    <p className="text-slate-900 font-bold text-lg">{diagnosis.root_cause}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Explanation</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{diagnosis.explanation}</p>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">Suggested Fix</h4>
                    <p className="text-amber-900 text-sm">{diagnosis.fix}</p>
                  </div>

                  {diagnosis.kubectl_command && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">kubectl Command</h4>
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto font-mono">
                        {diagnosis.kubectl_command}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: History */}
          <div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-8 space-y-4">
              <h3 className="font-semibold text-slate-900 text-sm">Recent History</h3>
              <div className="space-y-3 divide-y divide-slate-100">
                {history.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0" suppressHydrationWarning>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{item.cluster}</span>
                      <span className="text-blue-600 font-bold">{item.confidence}%</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 truncate">{item.rootCause}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5" suppressHydrationWarning>{item.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}