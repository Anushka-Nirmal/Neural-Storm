import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.utils.seed_data import seed_database
from app.models.user import User

# In-memory SQLite for high-speed isolated tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_database(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def citizen_token(db_session):
    user = db_session.query(User).filter(User.email == "citizen@jansahayak.gov.in").first()
    return create_access_token(subject=user.id, role="citizen")


@pytest.fixture
def officer_token(db_session):
    user = db_session.query(User).filter(User.email == "officer.water@jansahayak.gov.in").first()
    dept_id = user.roles[0].department_id if user.roles else None
    return create_access_token(subject=user.id, role="department_officer", department_id=dept_id)


@pytest.fixture
def admin_token(db_session):
    user = db_session.query(User).filter(User.email == "admin@jansahayak.gov.in").first()
    return create_access_token(subject=user.id, role="system_admin")
