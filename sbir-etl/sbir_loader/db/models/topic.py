from sqlalchemy import Column, Integer, String, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sbir_loader.db.base import Base

class Topic(Base):
    __tablename__ = "solicitation_topics"

    id = Column(Integer, primary_key=True)
    topic_title = Column(String)
    branch = Column(String)
    topic_number = Column(String)
    topic_open_date = Column(Date)
    topic_closed_date = Column(Date)
    topic_is_open = Column(Boolean, default=False)
    topic_is_closed = Column(Boolean, default=False)
    topic_description = Column(String)
    sbir_topic_link = Column(String, nullable=True)
    solicitation_id = Column(Integer, ForeignKey("solicitations.id"))

    solicitation = relationship("Solicitation", back_populates="solicitation_topics")