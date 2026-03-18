# ai_router.py
# ------------
# The only file your frontend talks to.
# Exposes one endpoint: POST /ai/query
# Routes each request type to the right handler.
#
# To add a new AI capability: write a handle_X function, add it to HANDLERS.
import os
import json
from typing import Literal, Any
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

# Local imports
from grader import grade_trade
from models import TradeInput

# Load environment variables from .env
load_dotenv()

router = APIRouter(prefix="/ai")

# Using the free Llama-3 model on OpenRouter
MODEL = "meta-llama/llama-3.3-70b-instruct:free"

# Initialize OpenAI client pointed to OpenRouter
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ.get("OPENROUTER_API_KEY"),
)

# ── Single request envelope ────────────────────────────────────────────────────
class AIRequest(BaseModel):
    type: Literal[
        "grade_trade",
        "analyse_performance",
        "pre_trade_check",
        "coaching_chat",
        "journal_reflection",
        "explain_grade",
    ]
    payload: dict[str, Any]


# ── Handlers ───────────────────────────────────────────────────────────────────

def handle_grade_trade(payload: dict) -> dict:
    """
    Grades a single trade using the logic in grader.py.
    """
    try:
        trade = TradeInput(**payload["trade"])
        return grade_trade(trade).dict()
    except Exception as e:
        print(f"Error in grade_trade: {e}")
        raise HTTPException(status_code=400, detail=str(e))


def handle_analyse_performance(payload: dict) -> dict:
    """
    Analyses a batch of graded trades to find behavioral patterns.
    """
    trades = payload.get("trades", [])
    question = payload.get("question", "What is my biggest weakness?")

    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key or api_key == "your_key_here":
        # Professional mock response
        avg_score = sum(t["overall_score"] for t in trades) / len(trades) if trades else 0
        weakness = "Consistency in risk-to-reward ratios" if avg_score > 70 else "Over-leveraging on impulsive setups"
        return {
            "answer": f"Based on your last {len(trades)} trades, you're showing good discipline. Your execution is reliable, but exits could be optimized.",
            "top_weakness": weakness,
            "recommendations": [
                "Strictly adhere to 1:2 Minimum Risk/Reward",
                "Document emotional state BEFORE entry",
                "Reduce position size by 50% after a losing streak"
            ],
            "positive_patterns": ["Patient entry selection", "Good stop-loss placement"]
        }

    try:
        summary = [{"grade": t["letter_grade"], "score": t["overall_score"], "patterns": t["patterns"]} for t in trades]
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{
                "role": "user",
                "content": f"Analyze these trades for psychological patterns: {json.dumps(summary)}. Question: {question}. Respond in JSON."
            }]
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"AI Performance analysis error: {e}")
        return {"answer": "Analysis unavailable.", "top_weakness": "N/A", "recommendations": [], "positive_patterns": []}


def handle_pre_trade_check(payload: dict) -> dict:
    """
    Evaluates a trade setup before entry.
    """
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key or api_key == "your_key_here":
        return {
            "score": 85,
            "take_trade": True,
            "reasons_for": ["Strong trend alignment", "Clear support level"],
            "reasons_against": ["Low volume area"],
            "what_to_watch": "Watch for a 5-minute candle close above the entry box."
        }

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{
                "role": "user",
                "content": f"Score this trade setup (0-100): {payload.get('description', 'No description')}. Account: ${payload.get('account_size', 10000)}. Return JSON."
            }]
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"score": 50, "take_trade": False, "reasons_for": [], "reasons_against": ["AI check failed"], "what_to_watch": "N/A"}


def handle_coaching_chat(payload: dict) -> dict:
    """
    General AI coaching chat.
    """
    message = payload.get("message", "")
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key or api_key == "your_key_here":
        return {"reply": "I am in local mode. Please add an OpenRouter API key for deep personalized AI coaching!"}

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": message}]
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        return {"reply": f"Could not connect to AI: {str(e)}"}


def handle_journal_reflection(payload: dict) -> dict:
    """
    Analyzes a journal entry for lessons and mood.
    """
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key or api_key == "your_key_here":
        return {
            "mood_score": 7,
            "key_lesson": "Patience is key.",
            "mistakes": ["Impulsive entry"],
            "what_went_well": ["Followed stop loss"],
            "tomorrow_focus": "Wait for confirmation"
        }

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{
                "role": "user",
                "content": f"Extract lessons from this journal: {payload.get('entry', '')}. Return JSON."
            }]
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"mood_score": 5, "key_lesson": "N/A", "mistakes": [], "what_went_well": [], "tomorrow_focus": "N/A"}


def handle_explain_grade(payload: dict) -> dict:
    """
    Explains a specific trade grade in plain English.
    """
    g = payload.get("grade", {})
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key or api_key == "your_key_here":
        return {"explanation": f"You scored a {g.get('letter_grade', 'N/A')}. Focus on improving your thesis documentation."}

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": f"Explain this trade grade in 2 sentences: {json.dumps(g)}"}]
        )
        return {"explanation": response.choices[0].message.content}
    except Exception as e:
        return {"explanation": "Explanation failed."}


# ── Handler registry ───────────────────────────────────────────────────────────

HANDLERS = {
    "grade_trade":         handle_grade_trade,
    "analyse_performance": handle_analyse_performance,
    "pre_trade_check":     handle_pre_trade_check,
    "coaching_chat":       handle_coaching_chat,
    "journal_reflection":  handle_journal_reflection,
    "explain_grade":       handle_explain_grade,
}


# ── Route ──────────────────────────────────────────────────────────────────────

@router.post("/query")
async def ai_query(request: AIRequest):
    handler = HANDLERS.get(request.type)
    if not handler:
        raise HTTPException(status_code=400, detail=f"Unknown type: {request.type}")
    try:
        return handler(request.payload)
    except Exception as e:
        print(f"Server Error in {request.type}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── App configuration ──────────────────────────────────────────────────────────

app = FastAPI(title="Tradient AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
async def root():
    return {"status": "online", "service": "Tradient AI API"}
