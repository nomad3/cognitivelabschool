from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext
from typing import List, Optional


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# User CRUD
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password, full_name=user.full_name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Course CRUD
def get_course(db: Session, course_id: int):
    return db.query(models.Course).filter(models.Course.id == course_id).first()

def get_courses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Course).offset(skip).limit(limit).all()

def create_course(db: Session, course: schemas.CourseCreate, instructor_id: Optional[int] = None):
    db_course = models.Course(**course.dict(), instructor_id=instructor_id)
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

# Module CRUD
def create_module_for_course(db: Session, module: schemas.ModuleCreate, course_id: int):
    db_module = models.Module(**module.dict(), course_id=course_id)
    db.add(db_module)
    db.commit()
    db.refresh(db_module)
    return db_module

def get_modules_for_course(db: Session, course_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Module).filter(models.Module.course_id == course_id).offset(skip).limit(limit).all()


# Enrollment CRUD
def create_enrollment(db: Session, enrollment: schemas.EnrollmentCreate):
    db_enrollment = models.Enrollment(user_id=enrollment.user_id, course_id=enrollment.course_id)
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment

def get_enrollments_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Enrollment).filter(models.Enrollment.user_id == user_id).offset(skip).limit(limit).all()

def get_enrollment_by_user_and_course(db: Session, user_id: int, course_id: int):
    return db.query(models.Enrollment).filter(models.Enrollment.user_id == user_id, models.Enrollment.course_id == course_id).first()
