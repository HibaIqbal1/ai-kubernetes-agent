from typing import Dict, Any
from app.kubernetes.pod_inspector import PodInspector
from app.kubernetes.logs_collector import LogsCollector
from app.kubernetes.events_analyzer import EventsAnalyzer
from app.kubernetes.deployment_inspector import DeploymentInspector
from app.kubernetes.network_inspector import NetworkInspector

class InvestigationService:
    @staticmethod
    def run_investigation() -> Dict[str, Any]:
        # Step 1: Check Pods
        pod_report = PodInspector.inspect_pods()
        problematic_pods = pod_report.get("problematic_pods", [])

        # Step 2: Collect Logs for Problematic Pods
        logs_report = LogsCollector.collect_logs(problematic_pods)

        # Step 3: Analyze Warning Events
        events_report = EventsAnalyzer.analyze_events()

        # Step 4: Inspect Deployments
        deployments_report = DeploymentInspector.inspect_deployments()

        # Step 5: Check Networking & Services
        network_report = NetworkInspector.inspect_network()

        return {
            "pods": pod_report,
            "logs": logs_report,
            "events": events_report,
            "deployments": deployments_report,
            "network": network_report
        }