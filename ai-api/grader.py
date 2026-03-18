# grader.py
# ---------
# The AI brain. This is the only file that talks to Claude.
# Orchestrates the full grading pipeline:
#   TradeInput → metrics.py → Claude → GradeResult
#
# Called by ai_router.py for "grade_trade" requests.
# All other AI request types (coaching, analysis etc.) call Claude directly
# in ai_router.py without going through this file.

import os
from dotenv import load_dotenv
import json
from openai import OpenAI
from models import TradeInput, TradeMetrics, GradeResult, DimensionScore
from metrics import calculate_metrics, detect_patterns

# Load env vars
load_dotenv()

MODEL = "meta-llama/llama-3.3-70b-instruct:free"

# Initialize client safely
api_key = os.environ.get("OPENROUTER_API_KEY")
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key if api_key else "missing_key",
)

SYSTEM_PROMPT = """
You are an expert trading coach and performance analyst grading individual trades.

You receive:
- Raw trade data (entry, exit, stop, size, direction)
- Pre-calculated metrics (R:R, risk %, P&L) — trust these numbers exactly
- Rule-based pattern flags detected before you were called
- The trader's own notes explaining their reasoning

Return ONLY a JSON object with this exact structure, no markdown, no extra text:
{
  "entry_quality":   { "score": <0-25>, "feedback": "<specific feedback>" },
  "risk_management": { "score": <0-25>, "feedback": "<specific feedback>" },
  "trade_thesis":    { "score": <0-25>, "feedback": "<specific feedback>" },
  "exit_quality":    { "score": <0-25>, "feedback": "<specific feedback>" },
  "summary":         "<2-3 sentence overall narrative>"
}

Grading rules:
- Grade the PROCESS not the outcome. A losing trade with good process scores well.
- Be specific. "Good entry" is useless. Reference actual prices, levels, and reasoning.
- No trade notes = trade_thesis cannot exceed 10/25. A trade with no thesis is a gamble.
- Risk over 2% of account always reduces risk_management score significantly.
- No take profit set = exit_quality cannot exceed 15/25.
- Planned R:R below 1:1 = heavy penalty on entry_quality or risk_management.
- A losing trade that was well-executed should still score 60+. Say so explicitly.
"""


def build_prompt(trade: TradeInput, metrics: TradeMetrics, patterns: list[str]) -> str:
    return f"""
## Trade
Ticker: {trade.ticker} | Direction: {trade.direction.value.upper()}
Entry: {trade.entry_price} | Exit: {trade.exit_price}
Stop loss: {trade.stop_loss} | Take profit: {trade.take_profit or 'NOT SET'}
Session: {trade.session or 'Not specified'} | Strategy: {trade.strategy_tag or 'Not specified'}

## Pre-Calculated Metrics
Planned R:R: {metrics.risk_reward_ratio}:1
Actual R:R:  {metrics.actual_rr}:1
Risk %:      {metrics.risk_percent}%
Hit TP:      {metrics.hit_target}
Hit SL:      {metrics.hit_stop}
P&L:         ${metrics.pnl}

## Pattern Flags
{json.dumps(patterns) if patterns else 'None'}

## Trader Notes
{trade.trade_notes or 'No notes provided.'}

Grade this trade. Return only the JSON object.
"""


def score_to_letter(score: int) -> str:
    if score >= 90: return "A+"
    if score >= 80: return "A"
    if score >= 70: return "B"
    if score >= 60: return "C"
    if score >= 50: return "D"
    return "F"


def get_local_fallback_grade(trade: TradeInput, metrics: TradeMetrics, patterns: list[str]) -> GradeResult:
    """
    Generates a high-quality mock grade when no API key is present.
    Based on the deterministic rules defined in the prompt.
    """
    # 1. Entry Quality (Max 25)
    e_score = 20
    e_feedback = "Good entry based on technical setup."
    if metrics.risk_reward_ratio < 1.0:
        e_score -= 10
        e_feedback = "Poor planned Risk/Reward ratio for this entry."
    
    # 2. Risk Management (Max 25)
    r_score = 25
    r_feedback = "Professional risk management."
    if metrics.risk_percent > 2.0:
        r_score -= 10
        r_feedback = f"Risk per trade ({metrics.risk_percent}%) is too high. Aim for < 2%."
    if metrics.hit_stop and metrics.actual_rr < -1.1:
         r_score -= 5
         r_feedback = "Stop loss was hit and potentially slipped or moved."

    # 3. Trade Thesis (Max 25)
    t_score = 22
    t_feedback = "Strong reasoning and setup identification."
    if not trade.trade_notes or len(trade.trade_notes) < 20:
        t_score = 10
        t_feedback = "Insufficient trade notes. Process cannot be verified without a clear thesis."

    # 4. Exit Quality (Max 25)
    x_score = 20
    x_feedback = "Disciplined exit."
    if not trade.take_profit:
        x_score = 15
        x_feedback = "No take profit defined. Exit was likely discretionary."
    if "early_exit_winner" in patterns:
        x_score -= 5
        x_feedback = "Exited a winner too early before the target was reached."

    overall = e_score + r_score + t_score + x_score
    summary = f"Overall processed trade on {trade.ticker}. {'Good' if overall > 70 else 'Fair'} discipline shown. "
    if metrics.pnl > 0:
        summary += "Result was positive, but continue focusing on thesis documentation."
    else:
        summary += "Despite the loss, the risk parameters were adhered to."

    return GradeResult(
        overall_score   = overall,
        letter_grade    = score_to_letter(overall),
        metrics         = metrics,
        entry_quality   = DimensionScore(score=e_score, feedback=e_feedback),
        risk_management = DimensionScore(score=r_score, feedback=r_feedback),
        trade_thesis    = DimensionScore(score=t_score, feedback=t_feedback),
        exit_quality    = DimensionScore(score=x_score, feedback=x_feedback),
        summary         = summary,
        patterns        = patterns,
    )


def grade_trade(trade: TradeInput) -> GradeResult:
    """
    Full pipeline:
    1. Calculate deterministic metrics (metrics.py)
    2. Detect rule-based patterns (metrics.py)
    3. Send everything to Claude (this file)
    4. Parse Claude's JSON response
    5. Return a typed GradeResult
    """
    metrics  = calculate_metrics(trade)
    patterns = detect_patterns(trade, metrics)

    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key or api_key == "your_key_here":
        return get_local_fallback_grade(trade, metrics, patterns)

    try:
        response = client.chat.completions.create(
            model    = MODEL,
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": build_prompt(trade, metrics, patterns)}
            ]
        )

        raw = response.choices[0].message.content
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            parsed = json.loads(raw.strip().removeprefix("```json").removesuffix("```").strip())

        entry   = DimensionScore(**parsed["entry_quality"])
        risk    = DimensionScore(**parsed["risk_management"])
        thesis  = DimensionScore(**parsed["trade_thesis"])
        exit_q  = DimensionScore(**parsed["exit_quality"])
        overall = entry.score + risk.score + thesis.score + exit_q.score

        return GradeResult(
            overall_score   = overall,
            letter_grade    = score_to_letter(overall),
            metrics         = metrics,
            entry_quality   = entry,
            risk_management = risk,
            trade_thesis    = thesis,
            exit_quality    = exit_q,
            summary         = parsed["summary"],
            patterns        = patterns,
        )
    except Exception as e:
        print(f"AI Grading failed: {e}. Falling back to local rules.")
        return get_local_fallback_grade(trade, metrics, patterns)
