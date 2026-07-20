'use client';

export default function Home() {
  return (
    <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>AI Kubernetes Agent</h1>
      <p>Troubleshoot Kubernetes with AI</p>
      <button style={{ padding: '10px 20px', cursor: 'pointer' }}>
        Investigate Cluster
      </button>
      <p style={{ marginTop: '20px' }}>System Status: <strong>Ready</strong></p>
    </main>
  );
}