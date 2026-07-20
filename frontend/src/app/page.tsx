"use client";

import { useState } from "react";
import { Loader2, Terminal, CheckCircle2, History, ShieldAlert } from "lucide-react";

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
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: 1, timestamp: new Date().toLocaleTimeString(), rootCause: "ImagePullBackOff", confidence: 99 },
    { id: 2, timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(), rootCause: "OOMKilled", confidence: 95 }
  ]);

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
    <div className="min-h-screen bg-gray-50 text-slate-800 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Terminal className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">AI Kubernetes Agent</h1>
          </div>
          <div className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Authenticated
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Action Area */}
          <div className="md:col-span-2 space-y-6">
            
            {/* CTA Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <h2 className="text-lg font-semibold mb-4">Cluster Diagnostics</h2>
              <button
                onClick={handleInvestigate}
                disabled={isInvestigating}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
              >
                {isInvestigating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Investigating...</>
                ) : (
                  "Investigate Cluster"
                )}
              </button>
            </div>

            {/* Progress Steps UI */}
            {currentStep >= 0 && !diagnosis && !error && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold mb-4">Investigation Status</h3>
                <div className="space-y-3">
                  {progressSteps.map((step, index) => (
                    <div key={step} className={`flex items-center gap-3 text-sm ${index > currentStep ? 'text-gray-300' : index === currentStep ? 'text-blue-600 font-medium' : 'text-green-600'}`}>
                      {index < currentStep ? <CheckCircle2 className="w-4 h-4" /> : index === currentStep ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200" />}
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="text-red-800 font-semibold">Investigation Failed</h3>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Diagnosis Result Card */}
            {diagnosis && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Diagnosis Complete
                  </h3>
                  <div className="bg-blue-700 px-3 py-1 rounded-md text-sm font-medium">
                    Confidence: {diagnosis.confidence}%
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Root Cause</h4>
                    <p className="text-slate-900 font-medium text-lg">{diagnosis.root_cause}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Explanation</h4>
                    <p className="text-slate-700 leading-relaxed">{diagnosis.explanation}</p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <h4 className="text-sm font-semibold text-yellow-800 uppercase tracking-wider mb-2">Suggested Fix</h4>
                    <p className="text-yellow-900">{diagnosis.fix}</p>
                  </div>

                  {diagnosis.kubectl_command && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">kubectl Command</h4>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                        {diagnosis.kubectl_command}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Investigation History */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-8">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-gray-500" /> Recent History
              </h3>
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-gray-400">{item.timestamp}</span>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item.confidence}%</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 truncate">{item.rootCause}</p>
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