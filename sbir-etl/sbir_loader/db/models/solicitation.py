from sqlalchemy import Column, Integer, String, Date, Boolean
from sqlalchemy.orm import relationship
from sbir_loader.db.base import Base

class Solicitation(Base):
    __tablename__ = "solicitations"

    id = Column(Integer, primary_key=True)
    solicitation_id = Column(Integer, unique=True, nullable=False)
    solicitation_title = Column(String)
    solicitation_number = Column(String)
    program = Column(String)
    phase = Column(String)
    agency = Column(String)
    branch = Column(String)
    solicitation_year = Column(Integer)
    release_date = Column(Date)
    open_date = Column(Date)
    close_date = Column(Date)
    is_open = Column(Boolean, default=False)
    is_closed = Column(Boolean, default=False)
    application_due_date = Column(String)
    occurrence_number = Column(Integer, nullable=True)
    solicitation_agency_url = Column(String)
    current_status = Column(String)

    solicitation_topics = relationship("Topic", back_populates="solicitation", cascade="all, delete-orphan")
    documents = relationship("SolicitationDocument", back_populates="solicitation", cascade="all, delete-orphan")