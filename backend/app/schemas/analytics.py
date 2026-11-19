from typing import List, Dict, Any
from pydantic import BaseModel

class OverviewStats(BaseModel):
    total_complaints: int
    pending_complaints: int
    in_progress_complaints: int
    resolved_complaints: int
    rejected_complaints: int
    high_urgency_complaints: int
    resolution_rate_percent: float
    avg_resolution_hours: float
    student_satisfaction_avg: float

class KeyValueStat(BaseModel):
    name: str
    value: int
    percentage: float = 0.0

class MonthlyTrend(BaseModel):
    month: str
    total: int
    resolved: int
    pending: int

class AnalyticsDashboard(BaseModel):
    overview: OverviewStats
    by_category: List[KeyValueStat]
    by_status: List[KeyValueStat]
    by_priority: List[KeyValueStat]
    by_location: List[KeyValueStat]
    monthly_trends: List[MonthlyTrend]
