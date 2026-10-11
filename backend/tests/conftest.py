import os
import shutil
import tempfile
from pathlib import Path

import pytest


TEST_ROOT = Path(tempfile.mkdtemp(prefix="campuscare-tests-"))
TEST_DATABASE = TEST_ROOT / "campuscare-test.db"
TEST_UPLOADS = TEST_ROOT / "uploads"

# This module is loaded by pytest before test modules import app.*.
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DATABASE.as_posix()}"
os.environ["UPLOADS_DIR"] = str(TEST_UPLOADS)
os.environ["JWT_SECRET_KEY"] = "test-only-secret-not-for-production"


@pytest.fixture(autouse=True)
def isolated_database():
    from app import models  # noqa: F401 - registers every model with Base metadata
    from app.database import Base, engine

    assert engine.url.get_backend_name() == "sqlite"
    assert Path(engine.url.database).resolve() == TEST_DATABASE.resolve()

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def pytest_sessionfinish(session, exitstatus):
    from app.database import engine

    engine.dispose()
    shutil.rmtree(TEST_ROOT, ignore_errors=True)
