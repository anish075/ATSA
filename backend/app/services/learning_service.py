from typing import Dict, Any, List, Optional
import json
import os
from pathlib import Path

class LearningService:
    """Service for managing educational content and quizzes"""
    
    def __init__(self):
        self.content_file = Path(__file__).parent.parent / "data" / "learning_content.json"
        self.user_progress = {}  # In production, this would be stored in a database
        
    def load_learning_content(self) -> Dict[str, Any]:
        """Load all learning modules"""
        try:
            with open(self.content_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return {"modules": []}
        except json.JSONDecodeError:
            return {"error": "Invalid content format"}
    
    def get_module_list(self) -> List[Dict[str, Any]]:
        """Get list of all available modules with metadata"""
        content = self.load_learning_content()
        modules = content.get("modules", [])
        
        return [{
            "id": module["id"],
            "title": module["title"], 
            "description": module["description"],
            "duration": module["duration"],
            "difficulty": module["difficulty"],
            "quiz_questions": len(module.get("quiz", {}).get("questions", []))
        } for module in modules]
    
    def get_module_content(self, module_id: str) -> Dict[str, Any]:
        """Get detailed content for a specific module"""
        content = self.load_learning_content()
        modules = content.get("modules", [])
        
        for module in modules:
            if module["id"] == module_id:
                return {
                    "success": True,
                    "module": {
                        "id": module["id"],
                        "title": module["title"],
                        "description": module["description"],
                        "duration": module["duration"],
                        "difficulty": module["difficulty"],
                        "content": module["content"]
                    }
                }
        
        return {"success": False, "error": "Module not found"}
    
    def get_quiz(self, module_id: str) -> Dict[str, Any]:
        """Get quiz questions for a module"""
        content = self.load_learning_content()
        modules = content.get("modules", [])
        
        for module in modules:
            if module["id"] == module_id:
                quiz = module.get("quiz", {})
                if not quiz:
                    return {"success": False, "error": "No quiz available for this module"}
                
                # Return questions without correct answers (for security)
                questions = []
                for q in quiz.get("questions", []):
                    question_data = {
                        "id": q["id"],
                        "type": q["type"], 
                        "question": q["question"]
                    }
                    
                    if "options" in q:
                        question_data["options"] = q["options"]
                    
                    questions.append(question_data)
                
                return {
                    "success": True,
                    "quiz": {
                        "module_id": module_id,
                        "questions": questions
                    }
                }
        
        return {"success": False, "error": "Module not found"}
    
    def submit_quiz(self, module_id: str, user_id: str, answers: Dict[str, Any]) -> Dict[str, Any]:
        """Submit quiz answers and get results"""
        content = self.load_learning_content()
        modules = content.get("modules", [])
        
        for module in modules:
            if module["id"] == module_id:
                quiz = module.get("quiz", {})
                if not quiz:
                    return {"success": False, "error": "No quiz available for this module"}
                
                questions = quiz.get("questions", [])
                results = []
                correct_count = 0
                
                for question in questions:
                    q_id = str(question["id"])
                    user_answer = answers.get(q_id)
                    correct_answer = question["correct_answer"]
                    
                    is_correct = False
                    if question["type"] == "multiple_choice":
                        is_correct = int(user_answer) == correct_answer
                    elif question["type"] == "true_false":
                        is_correct = bool(user_answer) == correct_answer
                    elif question["type"] == "coding":
                        # Simple string matching for coding questions
                        is_correct = str(user_answer).strip() == str(correct_answer).strip()
                    
                    if is_correct:
                        correct_count += 1
                    
                    results.append({
                        "question_id": q_id,
                        "correct": is_correct,
                        "user_answer": user_answer,
                        "correct_answer": correct_answer,
                        "explanation": question.get("explanation", "")
                    })
                
                score = (correct_count / len(questions)) * 100
                
                # Store user progress
                if user_id not in self.user_progress:
                    self.user_progress[user_id] = {}
                
                self.user_progress[user_id][module_id] = {
                    "completed": True,
                    "score": score,
                    "attempts": self.user_progress[user_id].get(module_id, {}).get("attempts", 0) + 1
                }
                
                return {
                    "success": True,
                    "results": {
                        "score": round(score, 1),
                        "correct_answers": correct_count,
                        "total_questions": len(questions),
                        "passed": score >= 70,
                        "detailed_results": results
                    }
                }
        
        return {"success": False, "error": "Module not found"}
    
    def get_user_progress(self, user_id: str) -> Dict[str, Any]:
        """Get user's learning progress"""
        user_data = self.user_progress.get(user_id, {})
        modules = self.get_module_list()
        
        progress_data = []
        for module in modules:
            module_id = module["id"]
            module_progress = user_data.get(module_id, {})
            
            progress_data.append({
                "module_id": module_id,
                "title": module["title"],
                "completed": module_progress.get("completed", False),
                "score": module_progress.get("score"),
                "attempts": module_progress.get("attempts", 0)
            })
        
        # Calculate overall progress
        completed_modules = sum(1 for p in progress_data if p["completed"])
        total_modules = len(modules)
        overall_progress = (completed_modules / total_modules) * 100 if total_modules > 0 else 0
        
        return {
            "user_id": user_id,
            "overall_progress": round(overall_progress, 1),
            "completed_modules": completed_modules,
            "total_modules": total_modules,
            "module_progress": progress_data
        }
    
    def get_learning_path_recommendations(self, user_id: str) -> Dict[str, Any]:
        """Recommend learning path based on user progress"""
        user_data = self.user_progress.get(user_id, {})
        modules = self.get_module_list()
        
        # Define learning path order
        learning_path = [
            "time-series-fundamentals",
            "arima-models", 
            "sarima-models",
            "holt-winters",
            "prophet-models",
            "lstm-deep-learning"
        ]
        
        recommendations = []
        
        for i, module_id in enumerate(learning_path):
            module_info = next((m for m in modules if m["id"] == module_id), None)
            if not module_info:
                continue
            
            user_module_data = user_data.get(module_id, {})
            completed = user_module_data.get("completed", False)
            score = user_module_data.get("score", 0)
            
            # Determine recommendation status
            if not completed:
                if i == 0 or learning_path[i-1] in user_data:
                    status = "recommended"
                else:
                    status = "locked"
            elif score < 70:
                status = "needs_improvement"
            else:
                status = "completed"
            
            recommendations.append({
                "module_id": module_id,
                "title": module_info["title"],
                "difficulty": module_info["difficulty"],
                "duration": module_info["duration"],
                "status": status,
                "score": score if completed else None,
                "order": i + 1
            })
        
        return {
            "learning_path": recommendations,
            "next_recommended": next((r for r in recommendations if r["status"] == "recommended"), None)
        }
    
    def search_content(self, query: str, module_id: Optional[str] = None) -> Dict[str, Any]:
        """Search through learning content"""
        content = self.load_learning_content()
        modules = content.get("modules", [])
        
        if module_id:
            modules = [m for m in modules if m["id"] == module_id]
        
        results = []
        query_lower = query.lower()
        
        for module in modules:
            # Search in module title and description
            if query_lower in module["title"].lower() or query_lower in module["description"].lower():
                results.append({
                    "type": "module",
                    "module_id": module["id"],
                    "title": module["title"],
                    "description": module["description"],
                    "match_type": "title_description"
                })
            
            # Search in content sections
            for section in module.get("content", []):
                if query_lower in section.get("title", "").lower() or query_lower in section.get("content", "").lower():
                    results.append({
                        "type": "content",
                        "module_id": module["id"],
                        "module_title": module["title"],
                        "section_title": section.get("title", ""),
                        "section_type": section.get("type", ""),
                        "match_type": "content"
                    })
        
        return {
            "query": query,
            "total_results": len(results),
            "results": results
        }
    
    def get_module_prerequisites(self, module_id: str) -> Dict[str, Any]:
        """Get prerequisites for a specific module"""
        prerequisites_map = {
            "time-series-fundamentals": [],
            "arima-models": ["time-series-fundamentals"],
            "sarima-models": ["time-series-fundamentals", "arima-models"],
            "holt-winters": ["time-series-fundamentals"],
            "prophet-models": ["time-series-fundamentals", "arima-models"],
            "lstm-deep-learning": ["time-series-fundamentals", "arima-models"]
        }
        
        prerequisites = prerequisites_map.get(module_id, [])
        modules = self.get_module_list()
        
        prerequisite_details = []
        for prereq_id in prerequisites:
            prereq_module = next((m for m in modules if m["id"] == prereq_id), None)
            if prereq_module:
                prerequisite_details.append({
                    "id": prereq_id,
                    "title": prereq_module["title"],
                    "difficulty": prereq_module["difficulty"]
                })
        
        return {
            "module_id": module_id,
            "prerequisites": prerequisite_details,
            "has_prerequisites": len(prerequisite_details) > 0
        }
    
    def export_progress_report(self, user_id: str) -> Dict[str, Any]:
        """Export detailed progress report for a user"""
        progress = self.get_user_progress(user_id)
        content = self.load_learning_content()
        
        detailed_report = {
            "user_id": user_id,
            "report_date": "2024-01-01",  # In production, use actual date
            "summary": {
                "overall_progress": progress["overall_progress"],
                "completed_modules": progress["completed_modules"],
                "total_modules": progress["total_modules"],
                "average_score": 0
            },
            "module_details": []
        }
        
        total_score = 0
        scored_modules = 0
        
        for module_progress in progress["module_progress"]:
            module_detail = {
                "module_id": module_progress["module_id"],
                "title": module_progress["title"],
                "completed": module_progress["completed"],
                "score": module_progress["score"],
                "attempts": module_progress["attempts"],
                "status": "Completed" if module_progress["completed"] else "Not Started"
            }
            
            if module_progress["score"] is not None:
                total_score += module_progress["score"]
                scored_modules += 1
                
                if module_progress["score"] >= 80:
                    module_detail["performance"] = "Excellent"
                elif module_progress["score"] >= 70:
                    module_detail["performance"] = "Good"
                else:
                    module_detail["performance"] = "Needs Improvement"
            
            detailed_report["module_details"].append(module_detail)
        
        if scored_modules > 0:
            detailed_report["summary"]["average_score"] = round(total_score / scored_modules, 1)
        
        return detailed_report