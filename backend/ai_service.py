from emergentintegrations.llm.chat import LlmChat, UserMessage
from typing import List, Dict, Any
import os
from datetime import datetime
import json
import logging
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.api_key = os.getenv("EMERGENT_LLM_KEY")
        if not self.api_key:
            logger.warning("EMERGENT_LLM_KEY not found in environment")
        else:
            logger.info("EMERGENT_LLM_KEY loaded successfully")
    
    async def predict_risks(self, project_data: Dict[str, Any], weather_data: Dict[str, Any]) -> Dict[str, Any]:
        """AI Risk Engine: Predict delays and issues"""
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"risk_{project_data.get('id', 'default')}",
                system_message="You are an AI construction risk analyst. Analyze project data and predict potential delays, cost overruns, and safety issues."
            ).with_model("openai", "gpt-5.2")
            
            prompt = f"""
            Analyze this construction project and predict risks:
            
            Project: {project_data.get('name')}
            Budget: ${project_data.get('budget'):,.2f}
            Actual Cost: ${project_data.get('actual_cost', 0):,.2f}
            Completion: {project_data.get('completion_percentage', 0)}%
            Start Date: {project_data.get('start_date')}
            End Date: {project_data.get('end_date')}
            Team Size: {len(project_data.get('team_members', []))}
            
            Weather Forecast: {json.dumps(weather_data)}
            
            Provide a risk analysis in JSON format:
            {{
                "risk_score": 0-100,
                "risk_factors": [
                    {{"factor": "Budget Overrun", "probability": 0-100, "impact": "high/medium/low", "description": "..."}},
                    ...
                ],
                "recommendations": ["actionable recommendation 1", "recommendation 2", ...]
            }}
            """
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            # Parse JSON from response
            try:
                # Extract JSON from response
                response_text = response.strip()
                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0]
                elif "```" in response_text:
                    response_text = response_text.split("```")[1].split("```")[0]
                
                result = json.loads(response_text.strip())
                return result
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    "risk_score": 50,
                    "risk_factors": [{
                        "factor": "Analysis Generated",
                        "probability": 50,
                        "impact": "medium",
                        "description": response[:500]
                    }],
                    "recommendations": ["Review the full AI analysis"]
                }
        except Exception as e:
            logger.error(f"Risk prediction error: {str(e)}")
            return {
                "risk_score": 0,
                "risk_factors": [],
                "recommendations": ["AI service temporarily unavailable"]
            }
    
    async def analyze_budget(self, budget_data: Dict[str, Any], project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Budget Guardian: Analyze budget and provide alerts"""
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"budget_{project_data.get('id', 'default')}",
                system_message="You are a construction budget analyst. Identify variances and provide cost-saving recommendations."
            ).with_model("openai", "gpt-5.2")
            
            prompt = f"""
            Analyze this construction budget:
            
            Project: {project_data.get('name')}
            Total Budget: ${project_data.get('budget'):,.2f}
            Actual Spent: ${project_data.get('actual_cost', 0):,.2f}
            Variance: {((project_data.get('actual_cost', 0) / project_data.get('budget', 1)) - 1) * 100:.1f}%
            
            Budget Items:
            {json.dumps(budget_data.get('items', []), indent=2)}
            
            Provide analysis in JSON:
            {{
                "alerts": [
                    {{"category": "...", "severity": "high/medium/low", "message": "...", "suggested_action": "..."}}
                ],
                "cost_savings": [
                    {{"opportunity": "...", "potential_savings": 0, "effort": "high/medium/low"}}
                ],
                "forecast": "predicted final cost and reasoning"
            }}
            """
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            try:
                response_text = response.strip()
                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0]
                result = json.loads(response_text.strip())
                return result
            except:
                return {
                    "alerts": [],
                    "cost_savings": [],
                    "forecast": response[:300]
                }
        except Exception as e:
            logger.error(f"Budget analysis error: {str(e)}")
            return {
                "alerts": [],
                "cost_savings": [],
                "forecast": "Analysis unavailable"
            }
    
    async def optimize_schedule(self, tasks: List[Dict[str, Any]], weather_data: Dict[str, Any]) -> Dict[str, Any]:
        """Schedule Optimizer: Optimize task scheduling"""
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id="schedule_optimizer",
                system_message="You are a construction scheduling expert. Optimize task sequences considering weather, dependencies, and critical path."
            ).with_model("openai", "gpt-5.2")
            
            prompt = f"""
            Optimize this construction schedule:
            
            Tasks:
            {json.dumps(tasks[:20], indent=2)}  # Limit to 20 tasks for token efficiency
            
            Weather Forecast: {json.dumps(weather_data)}
            
            Provide optimization in JSON:
            {{
                "critical_path": ["task_id_1", "task_id_2", ...],
                "bottlenecks": [{{"task_id": "...", "issue": "...", "solution": "..."}}],
                "weather_adjustments": [{{"task_id": "...", "reason": "...", "new_date": "..."}}],
                "resource_conflicts": [...]
            }}
            """
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            try:
                response_text = response.strip()
                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0]
                result = json.loads(response_text.strip())
                return result
            except:
                return {
                    "critical_path": [],
                    "bottlenecks": [],
                    "weather_adjustments": [],
                    "resource_conflicts": []
                }
        except Exception as e:
            logger.error(f"Schedule optimization error: {str(e)}")
            return {"error": str(e)}
    
    async def transcribe_voice(self, audio_base64: str) -> Dict[str, str]:
        """Transcribe voice notes"""
        # Note: For actual voice transcription, you'd use OpenAI Whisper API
        # For now, return a placeholder since emergentintegrations chat doesn't support audio
        try:
            # This is a placeholder - in production, integrate with Whisper API
            return {
                "text": "Voice transcription requires Whisper API integration",
                "confidence": 0.0
            }
        except Exception as e:
            logger.error(f"Transcription error: {str(e)}")
            return {"text": "Transcription failed", "confidence": 0.0}
    
    async def check_compliance(self, project_data: Dict[str, Any], documents: List[str]) -> Dict[str, Any]:
        """Compliance Bot: Check for compliance issues"""
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"compliance_{project_data.get('id', 'default')}",
                system_message="You are a construction compliance expert. Check for regulatory issues and missing documentation."
            ).with_model("openai", "gpt-5.2")
            
            prompt = f"""
            Review compliance for this construction project:
            
            Project: {project_data.get('name')}
            Location: {json.dumps(project_data.get('location', {}))}
            Budget: ${project_data.get('budget'):,.2f}
            
            Documents on file: {', '.join(documents) if documents else 'None'}
            
            Provide compliance check in JSON:
            {{
                "compliant": true/false,
                "missing_documents": ["...", "..."],
                "violations": [{{"type": "...", "severity": "...", "description": "..."}}],
                "recommendations": ["...", "..."]
            }}
            """
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            try:
                response_text = response.strip()
                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0]
                result = json.loads(response_text.strip())
                return result
            except:
                return {
                    "compliant": True,
                    "missing_documents": [],
                    "violations": [],
                    "recommendations": []
                }
        except Exception as e:
            logger.error(f"Compliance check error: {str(e)}")
            return {"error": str(e)}
    
    async def scout_vendors(self, requirements: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Vendor Scout: Provide vendor recommendations"""
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id="vendor_scout",
                system_message="You are a construction vendor sourcing expert. Recommend vendor types and evaluation criteria."
            ).with_model("openai", "gpt-5.2")
            
            prompt = f"""
            Recommend vendor types for these requirements:
            
            {json.dumps(requirements, indent=2)}
            
            Provide recommendations in JSON:
            {{
                "recommended_vendors": [
                    {{
                        "type": "...",
                        "why_needed": "...",
                        "evaluation_criteria": ["...", "..."],
                        "typical_cost_range": "..."
                    }}
                ]
            }}
            """
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            try:
                response_text = response.strip()
                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0]
                result = json.loads(response_text.strip())
                return result.get("recommended_vendors", [])
            except:
                return []
        except Exception as e:
            logger.error(f"Vendor scout error: {str(e)}")
            return []

# Singleton instance
ai_service = AIService()
