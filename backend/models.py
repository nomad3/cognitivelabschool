from sqlalchemy import Boolean, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    full_name = Column(String, index=True, nullable=True)
    # Add other fields like role, etc. as needed

    enrollments = relationship("Enrollment", back_populates="user")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Or a dedicated Instructor table

    instructor = relationship("User") # If using User as instructor
    modules = relationship("Module", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="course")


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    order = Column(Integer, nullable=False, default=0) # To maintain module order

    course = relationship("Course", back_populates="modules")
    # lessons = relationship("Lesson", back_populates="module", cascade="all, delete-orphan")


# Placeholder for Lesson model if needed later
# class Lesson(Base):
#     __tablename__ = "lessons"
#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String, index=True, nullable=False)
#     content = Column(Text, nullable=True) # Could be markdown, HTML, or JSON for structured content
#     module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
#     order = Column(Integer, nullable=False, default=0)
#
#     module = relationship("Module", back_populates="lessons")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    enrolled_at = Column(String, default=lambda: datetime.utcnow().isoformat()) # Using string for simplicity with SQLite
    # progress = Column(Integer, default=0) # Percentage or number of completed lessons

    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

# Need to import datetime for Enrollment model default
from datetime import datetime
