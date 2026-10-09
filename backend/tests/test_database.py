from sqlalchemy import inspect

from app.database import engine


def test_users_table_exists():
    inspector = inspect(engine)

    assert "users" in inspector.get_table_names()


def test_complaints_table_exists():
    inspector = inspect(engine)

    assert "complaints" in inspector.get_table_names()
