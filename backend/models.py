from sqlalchemy import Boolean, Column, Integer, String, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from database import Base # Changed to absolute import
from datetime import datetime

# Association table for Course and Skill (Many-to-Many)
course_skill_association_table = Table('course_skill_association', Base.metadata,
    Column('course_id', Integer, ForeignKey('courses.id'), primary_key=True),
    Column('skill_id', Integer, ForeignKey('skills.id'), primary_key=True)
)

# Association table for Module and Skill (Many-to-Many)
module_skill_association_table = Table('module_skill_association', Base.metadata,
    Column('module_id', Integer, ForeignKey('modules.id'), primary_key=True),
    Column('skill_id', Integer, ForeignKey('skills.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    full_name = Column(String, index=True, nullable=True)
    is_admin = Column(Boolean, default=False) # Added for admin functionality
    # Add other fields like role, etc. as needed

    enrollments = relationship("Enrollment", back_populates="user")
    skill_proficiencies = relationship("UserSkill", back_populates="user_profile")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Or a dedicated Instructor table

    instructor = relationship("User") # If using User as instructor
    modules = relationship("Module", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="course")
    associated_skills = relationship(
        "Skill",
        secondary=course_skill_association_table,
        back_populates="courses"
    )


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    order = Column(Integer, nullable=False, default=0) # To maintain module order

    course = relationship("Course", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module", cascade="all, delete-orphan")
    associated_skills = relationship(
        "Skill",
        secondary=module_skill_association_table,
        back_populates="modules"
    )


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    content = Column(Text, nullable=True) # Could be markdown, HTML, video_url, quiz_id etc.
    content_type = Column(String, default="text") # To interpret content: 'text', 'markdown', 'video_url', 'quiz'
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    order = Column(Integer, nullable=False, default=0) # To maintain lesson order within a module

    module = relationship("Module", back_populates="lessons")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    enrolled_at = Column(String, default=lambda: datetime.utcnow().isoformat()) # Using string for simplicity with SQLite
    completed_lessons = Column(Text, default="[]") # Store as JSON string list of lesson IDs

    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    user_proficiencies = relationship("UserSkill", back_populates="skill_definition")
    courses = relationship(
        "Course",
        secondary=course_skill_association_table,
        back_populates="associated_skills"
    )
    modules = relationship(
        "Module",
        secondary=module_skill_association_table,
        back_populates="associated_skills"
    )


class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    proficiency_score = Column(Integer, nullable=False, default=0) # e.g., 0-100
    last_assessed_at = Column(String, default=lambda: datetime.utcnow().isoformat(), onupdate=lambda: datetime.utcnow().isoformat())

    user_profile = relationship("User", back_populates="skill_proficiencies")
    skill_definition = relationship("Skill", back_populates="user_proficiencies")
