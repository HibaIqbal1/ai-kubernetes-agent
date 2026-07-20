import subprocess
import json
from loguru import logger
from typing import Dict, Any, Optional

class KubectlExecutor:
    @staticmethod
    def run_command(command: list[str]) -> Dict[str, Any]:
        """
        Executes a kubectl command safely using subprocess.
        Returns a dict with 'success', 'output', and 'error'.
        """
        try:
            logger.info(f"Executing command: {' '.join(command)}")
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=15
            )
            if result.returncode == 0:
                return {
                    "success": True,
                    "output": result.stdout.strip(),
                    "error": None
                }
            else:
                logger.warning(f"Kubectl error: {result.stderr.strip()}")
                return {
                    "success": False,
                    "output": result.stdout.strip(),
                    "error": result.stderr.strip()
                }
        except Exception as e:
            logger.error(f"Execution failed: {str(e)}")
            return {
                "success": False,
                "output": "",
                "error": str(e)
            }

    @staticmethod
    def run_json_command(command: list[str]) -> Dict[str, Any]:
        """Executes kubectl command with -o json output and parses it."""
        if "-o" not in command and "-o=json" not in command:
            command.extend(["-o", "json"])
        
        res = KubectlExecutor.run_command(command)
        if res["success"] and res["output"]:
            try:
                res["data"] = json.loads(res["output"])
            except json.JSONDecodeError:
                res["data"] = None
                res["error"] = "Failed to parse JSON output"
                res["success"] = False
        else:
            res["data"] = None
        return res