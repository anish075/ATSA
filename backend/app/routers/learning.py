from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional
from ..services.learning_service import LearningService

router = APIRouter()
learning_service = LearningService()

@router.get("/modules")
async def get_learning_modules():
    """Get list of all available learning modules"""
    try:
        modules = learning_service.get_module_list()
        return {
            "success": True,
            "modules": modules,
            "total": len(modules)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch modules: {str(e)}")

@router.get("/modules/{module_id}")
async def get_module_content(module_id: str):
    """Get detailed content for a specific module"""
    try:
        result = learning_service.get_module_content(module_id)
        if not result.get("success", False):
            raise HTTPException(status_code=404, detail=result.get("error", "Module not found"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch module content: {str(e)}")

@router.get("/modules/{module_id}/quiz")
async def get_module_quiz(module_id: str):
    """Get quiz questions for a module"""
    try:
        result = learning_service.get_quiz(module_id)
        if not result.get("success", False):
            raise HTTPException(status_code=404, detail=result.get("error", "Quiz not found"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch quiz: {str(e)}")

@router.post("/modules/{module_id}/quiz/submit")
async def submit_quiz(module_id: str, submission: Dict[str, Any]):
    """Submit quiz answers and get results"""
    try:
        user_id = submission.get("user_id", "anonymous")
        answers = submission.get("answers", {})
        
        if not answers:
            raise HTTPException(status_code=400, detail="No answers provided")
        
        result = learning_service.submit_quiz(module_id, user_id, answers)
        if not result.get("success", False):
            raise HTTPException(status_code=400, detail=result.get("error", "Quiz submission failed"))
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit quiz: {str(e)}")

@router.get("/progress/{user_id}")
async def get_user_progress(user_id: str):
    """Get user's learning progress"""
    try:
        progress = learning_service.get_user_progress(user_id)
        return {
            "success": True,
            "progress": progress
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch progress: {str(e)}")

@router.get("/recommendations/{user_id}")
async def get_learning_recommendations(user_id: str):
    """Get personalized learning path recommendations"""
    try:
        recommendations = learning_service.get_learning_path_recommendations(user_id)
        return {
            "success": True,
            "recommendations": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch recommendations: {str(e)}")

@router.get("/search")
async def search_content(
    query: str = Query(..., description="Search query"),
    module_id: Optional[str] = Query(None, description="Limit search to specific module")
):
    """Search through learning content"""
    try:
        results = learning_service.search_content(query, module_id)
        return {
            "success": True,
            "search": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/modules/{module_id}/prerequisites")
async def get_module_prerequisites(module_id: str):
    """Get prerequisites for a specific module"""
    try:
        prerequisites = learning_service.get_module_prerequisites(module_id)
        return {
            "success": True,
            "prerequisites": prerequisites
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch prerequisites: {str(e)}")

@router.get("/report/{user_id}")
async def export_progress_report(user_id: str):
    """Export detailed progress report"""
    try:
        report = learning_service.export_progress_report(user_id)
        return {
            "success": True,
            "report": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@router.post("/reset-progress/{user_id}")
async def reset_user_progress(user_id: str):
    """Reset user's learning progress (for testing/demo purposes)"""
    try:
        # Clear user progress
        if hasattr(learning_service, 'user_progress') and user_id in learning_service.user_progress:
            del learning_service.user_progress[user_id]
        
        return {
            "success": True,
            "message": f"Progress reset for user {user_id}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset progress: {str(e)}")

@router.get("/stats")
async def get_learning_stats():
    """Get overall learning platform statistics"""
    try:
        modules = learning_service.get_module_list()
        
        total_questions = sum(module.get("quiz_questions", 0) for module in modules)
        
        difficulty_count = {}
        for module in modules:
            diff = module.get("difficulty", "Unknown")
            difficulty_count[diff] = difficulty_count.get(diff, 0) + 1
        
        # Calculate total estimated time
        total_duration = 0
        for module in modules:
            duration_str = module.get("duration", "0 minutes")
            # Extract number from duration string (e.g., "45 minutes" -> 45)
            try:
                duration_num = int(''.join(filter(str.isdigit, duration_str)))
                total_duration += duration_num
            except:
                continue
        
        return {
            "success": True,
            "stats": {
                "total_modules": len(modules),
                "total_quiz_questions": total_questions,
                "difficulty_distribution": difficulty_count,
                "total_estimated_hours": round(total_duration / 60, 1),
                "available_topics": [
                    "Time Series Fundamentals",
                    "ARIMA Modeling",
                    "Seasonal ARIMA (SARIMA)",
                    "Exponential Smoothing",
                    "Facebook Prophet",
                    "Deep Learning (LSTM)"
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")