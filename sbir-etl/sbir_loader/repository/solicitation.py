from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from sbir_loader.db.models.solicitation import Solicitation
from sbir_loader.db.models.topic import Topic
from sbir_loader.etl.schema import SolicitationSchema


def calculate_topic_status(topic) -> tuple[bool, bool]:
    today = date.today()
    is_open = (
        topic.topic_open_date
        and topic.topic_closed_date
        and topic.topic_open_date <= today <= topic.topic_closed_date
    )
    is_closed = topic.topic_closed_date and today > topic.topic_closed_date
    return is_open, is_closed


def calculate_solicitation_status(record: SolicitationSchema) -> tuple[bool, bool]:
    today = date.today()

    sol_open = (
        record.open_date
        and record.close_date
        and record.open_date <= today <= record.close_date
    )
    sol_closed = record.close_date and today > record.close_date

    topic_statuses = [calculate_topic_status(t) for t in record.solicitation_topics]
    any_topic_open = any(is_open for is_open, _ in topic_statuses)
    all_topics_closed = all(is_closed for _, is_closed in topic_statuses)

    is_open = sol_open or any_topic_open
    is_closed = sol_closed and all_topics_closed

    return is_open, is_closed


def upsert_solicitations(session: Session, records: list[SolicitationSchema]):
    for record in records:
        existing = (
            session.query(Solicitation)
            .filter_by(solicitation_id=record.solicitation_id)
            .first()
        )

        # Compute topic open/closed flags
        topic_objs = []
        for t in record.solicitation_topics:
            topic_is_open, topic_is_closed = calculate_topic_status(t)
            topic_objs.append(
                Topic(
                    topic_title=t.topic_title,
                    branch=t.branch,
                    topic_number=t.topic_number,
                    topic_open_date=t.topic_open_date,
                    topic_closed_date=t.topic_closed_date,
                    topic_description=t.topic_description,
                    sbir_topic_link=t.sbir_topic_link,
                    topic_is_open=topic_is_open,
                    topic_is_closed=topic_is_closed,
                )
            )

        is_open, is_closed = calculate_solicitation_status(record)
        application_dates = ",".join(d.isoformat() for d in (record.application_due_date or []))

        if existing:
            for field in [
                "solicitation_title",
                "solicitation_number",
                "program",
                "phase",
                "agency",
                "branch",
                "solicitation_year",
                "release_date",
                "open_date",
                "close_date",
                "occurrence_number",
                "solicitation_agency_url",
                "current_status",
            ]:
                setattr(existing, field, getattr(record, field))

            existing.application_due_date = application_dates
            existing.is_open = is_open
            existing.is_closed = is_closed
            existing.solicitation_topics.clear()
            existing.solicitation_topics.extend(topic_objs)

        else:
            new = Solicitation(
                solicitation_id=record.solicitation_id,
                solicitation_title=record.solicitation_title,
                solicitation_number=record.solicitation_number,
                program=record.program,
                phase=record.phase,
                agency=record.agency,
                branch=record.branch,
                solicitation_year=record.solicitation_year,
                release_date=record.release_date,
                open_date=record.open_date,
                close_date=record.close_date,
                application_due_date=application_dates,
                occurrence_number=record.occurrence_number,
                solicitation_agency_url=record.solicitation_agency_url,
                current_status=record.current_status,
                is_open=is_open,
                is_closed=is_closed,
                solicitation_topics=topic_objs,
            )
            session.add(new)

    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise