from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sbir_loader.db.base import Base

from pgvector.sqlalchemy import Vector


class SolicitationDocument(Base):
    __tablename__ = "solicitation_documents"

    id = Column(Integer, primary_key=True)
    solicitation_id = Column(Integer, ForeignKey("solicitations.id", ondelete="CASCADE"))
    chunk = Column(Text, nullable=False)
    embedding = Column(Vector(1536))
    created_at = Column(DateTime, server_default=func.now())

    solicitation = relationship("Solicitation", back_populates="documents")