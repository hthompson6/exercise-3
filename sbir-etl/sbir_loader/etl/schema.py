from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import date, datetime

def parse_date(value) -> Optional[date]:
    if value is None:
        return None
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        return datetime.strptime(value.replace("/", "-"), "%Y-%m-%d").date()
    raise ValueError(f"Invalid date format: {value}")



class TopicSchema(BaseModel):
    topic_title: str
    branch: Optional[str] = None
    topic_number: str
    topic_open_date: Optional[date] = None
    topic_closed_date: Optional[date] = None
    topic_description: str
    sbir_topic_link: Optional[str] = None

    @field_validator("topic_open_date", "topic_closed_date", mode="plain")
    def validate_topic_dates(cls, v):
        return parse_date(v)
        
        
class SolicitationSchema(BaseModel):
    solicitation_id: int
    solicitation_title: str
    solicitation_number: Optional[str] = None
    program: str
    phase: str
    agency: str
    branch: Optional[str] = None
    solicitation_year: int
    release_date: Optional[str] = None
    open_date: Optional[str] = None
    close_date: Optional[str] = None
    application_due_date: Optional[List[date]]
    occurrence_number: Optional[int]
    solicitation_agency_url: str
    current_status: str
    solicitation_topics: Optional[List[TopicSchema]]


    @field_validator("release_date", "open_date", "close_date", mode="plain")
    def validate_dates(cls, v):
        return parse_date(v)

    @field_validator("application_due_date", mode="before")
    def validate_due_dates(cls, v):
        if isinstance(v, list):
            return [parse_date(d) for d in v]
        return v

    @field_validator("occurrence_number", mode="before")
    def fix_occurrence_number(cls, v):
        if v == "":
            return None
        return v