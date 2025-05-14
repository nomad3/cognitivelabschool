from sqlalchemy.orm import Session
import models # Changed to absolute import
import schemas # Changed to absolute import
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
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        is_admin=user.is_admin  # Added is_admin field
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_by_admin(db: Session, user_id: int, user_update: schemas.UserUpdateAdmin):
    db_user = get_user(db, user_id=user_id)
    if not db_user:
        return None

    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
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
    course_data = course.dict()
    # If instructor_id is explicitly passed to this function, it takes precedence.
    # Remove instructor_id from course_data if it exists to avoid duplicate keyword arg.
    if 'instructor_id' in course_data and instructor_id is not None:
        del course_data['instructor_id']
    
    # If instructor_id was not in course_data (e.g. schema didn't have it or it was None)
    # and instructor_id is passed to function, it will be used.
    # If instructor_id is in course_data and instructor_id func arg is None, schema value is used.
    
    db_course = models.Course(**course_data, instructor_id=instructor_id if instructor_id is not None else course_data.get('instructor_id'))
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

def update_course(db: Session, course_id: int, course_update: schemas.CourseUpdate):
    db_course = get_course(db, course_id=course_id)
    if not db_course:
        return None

    update_data = course_update.dict(exclude_unset=True) # Pydantic V2, or .dict(skip_defaults=True) in V1
    for key, value in update_data.items():
        setattr(db_course, key, value)
    
    db.add(db_course) # Not strictly necessary if already in session and modified, but good practice
    db.commit()
    db.refresh(db_course)
    return db_course

def delete_course(db: Session, course_id: int):
    db_course = get_course(db, course_id=course_id)
    if not db_course:
        return None # Or raise an exception
    
    db.delete(db_course)
    db.commit()
    return True # Indicate successful deletion


# Module CRUD
def create_module_for_course(db: Session, module: schemas.ModuleCreate, course_id: int):
    db_module = models.Module(**module.dict(), course_id=course_id)
    db.add(db_module)
    db.commit()
    db.refresh(db_module)
    return db_module

def get_modules_for_course(db: Session, course_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Module).filter(models.Module.course_id == course_id).order_by(models.Module.order).offset(skip).limit(limit).all()

def get_module(db: Session, module_id: int):
    return db.query(models.Module).filter(models.Module.id == module_id).first()

def update_module(db: Session, module_id: int, module_update: schemas.ModuleUpdate):
    db_module = get_module(db, module_id=module_id)
    if not db_module:
        return None

    update_data = module_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_module, key, value)
    
    db.add(db_module)
    db.commit()
    db.refresh(db_module)
    return db_module

def delete_module(db: Session, module_id: int):
    db_module = get_module(db, module_id=module_id)
    if not db_module:
        return None
    
    db.delete(db_module)
    db.commit()
    return True


# Lesson CRUD
def create_lesson_for_module(db: Session, lesson: schemas.LessonCreate, module_id: int):
    db_lesson = models.Lesson(**lesson.dict(), module_id=module_id)
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

def get_lessons_for_module(db: Session, module_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Lesson).filter(models.Lesson.module_id == module_id).order_by(models.Lesson.order).offset(skip).limit(limit).all()

def get_lesson(db: Session, lesson_id: int):
    return db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()

def update_lesson(db: Session, lesson_id: int, lesson_update: schemas.LessonUpdate):
    db_lesson = get_lesson(db, lesson_id=lesson_id)
    if not db_lesson:
        return None

    update_data = lesson_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_lesson, key, value)
    
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

def delete_lesson(db: Session, lesson_id: int):
    db_lesson = get_lesson(db, lesson_id=lesson_id)
    if not db_lesson:
        return None
        
    db.delete(db_lesson)
    db.commit()
    return True


# Enrollment CRUD
def create_enrollment(db: Session, enrollment: schemas.EnrollmentCreate):
    db_enrollment = models.Enrollment(user_id=enrollment.user_id, course_id=enrollment.course_id)
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment

# Skill CRUD
def create_skill(db: Session, skill: schemas.SkillCreate):
    db_skill = models.Skill(**skill.dict())
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

def get_skill(db: Session, skill_id: int):
    return db.query(models.Skill).filter(models.Skill.id == skill_id).first()

def get_skill_by_name(db: Session, name: str):
    return db.query(models.Skill).filter(models.Skill.name == name).first()

def get_skills(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Skill).offset(skip).limit(limit).all()

def update_skill(db: Session, skill_id: int, skill_update: schemas.SkillUpdate):
    db_skill = get_skill(db, skill_id=skill_id)
    if not db_skill:
        return None
    
    update_data = skill_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_skill, key, value)
        
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

def delete_skill(db: Session, skill_id: int):
    db_skill = get_skill(db, skill_id=skill_id)
    if not db_skill:
        return None
    
    db.delete(db_skill)
    db.commit()
    return True

# Course-Skill Association CRUD
def add_skill_to_course(db: Session, course_id: int, skill_id: int):
    db_course = get_course(db, course_id=course_id)
    db_skill = get_skill(db, skill_id=skill_id)
    if not db_course or not db_skill:
        return None # Or raise error
    if db_skill not in db_course.associated_skills:
        db_course.associated_skills.append(db_skill)
        db.commit()
        db.refresh(db_course)
    return db_course

def remove_skill_from_course(db: Session, course_id: int, skill_id: int):
    db_course = get_course(db, course_id=course_id)
    db_skill = get_skill(db, skill_id=skill_id)
    if not db_course or not db_skill:
        return None # Or raise error
    if db_skill in db_course.associated_skills:
        db_course.associated_skills.remove(db_skill)
        db.commit()
        db.refresh(db_course)
    return db_course

# Module-Skill Association CRUD
def add_skill_to_module(db: Session, module_id: int, skill_id: int):
    db_module = get_module(db, module_id=module_id)
    db_skill = get_skill(db, skill_id=skill_id)
    if not db_module or not db_skill:
        return None
    if db_skill not in db_module.associated_skills:
        db_module.associated_skills.append(db_skill)
        db.commit()
        db.refresh(db_module)
    return db_module

def remove_skill_from_module(db: Session, module_id: int, skill_id: int):
    db_module = get_module(db, module_id=module_id)
    db_skill = get_skill(db, skill_id=skill_id)
    if not db_module or not db_skill:
        return None
    if db_skill in db_module.associated_skills:
        db_module.associated_skills.remove(db_skill)
        db.commit()
        db.refresh(db_module)
    return db_module

# UserSkill CRUD (User Skill Proficiency)
def get_user_skill(db: Session, user_id: int, skill_id: int):
    return db.query(models.UserSkill).filter(
        models.UserSkill.user_id == user_id,
        models.UserSkill.skill_id == skill_id
    ).first()

def get_user_skills_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.UserSkill).filter(models.UserSkill.user_id == user_id).offset(skip).limit(limit).all()

def create_user_skill(db: Session, user_skill: schemas.UserSkillCreate):
    # last_assessed_at is handled by default/onupdate in the model
    db_user_skill = models.UserSkill(
        user_id=user_skill.user_id,
        skill_id=user_skill.skill_id,
        proficiency_score=user_skill.proficiency_score
    )
    db.add(db_user_skill)
    db.commit()
    db.refresh(db_user_skill)
    return db_user_skill

def update_user_skill_proficiency(db: Session, user_skill_id: int, proficiency_score: int):
    db_user_skill = db.query(models.UserSkill).filter(models.UserSkill.id == user_skill_id).first()
    if not db_user_skill:
        return None
    db_user_skill.proficiency_score = proficiency_score
    # last_assessed_at should auto-update due to onupdate in model
    db.commit()
    db.refresh(db_user_skill)
    return db_user_skill

def upsert_user_skill_proficiency(db: Session, user_id: int, skill_id: int, proficiency_score: int):
    db_user_skill = get_user_skill(db, user_id=user_id, skill_id=skill_id)
    if db_user_skill:
        db_user_skill.proficiency_score = proficiency_score
        # last_assessed_at will be updated by SQLAlchemy's onupdate
    else:
        db_user_skill = models.UserSkill(
            user_id=user_id,
            skill_id=skill_id,
            proficiency_score=proficiency_score
            # last_assessed_at will be set by default
        )
        db.add(db_user_skill)
    db.commit()
    db.refresh(db_user_skill)
    return db_user_skill

def get_enrollments_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Enrollment).filter(models.Enrollment.user_id == user_id).offset(skip).limit(limit).all()

def get_all_enrollments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Enrollment).offset(skip).limit(limit).all()

import json # For handling completed_lessons JSON string

def get_enrollment_by_user_and_course(db: Session, user_id: int, course_id: int):
    return db.query(models.Enrollment).filter(models.Enrollment.user_id == user_id, models.Enrollment.course_id == course_id).first()

def mark_lesson_complete(db: Session, enrollment_id: int, lesson_id: int):
    db_enrollment = db.query(models.Enrollment).filter(models.Enrollment.id == enrollment_id).first()
    if not db_enrollment:
        return None
    
    completed_lessons_list = json.loads(db_enrollment.completed_lessons)
    if lesson_id not in completed_lessons_list:
        completed_lessons_list.append(lesson_id)
        db_enrollment.completed_lessons = json.dumps(completed_lessons_list)
        db.commit()
        db.refresh(db_enrollment)
    return db_enrollment

def mark_lesson_incomplete(db: Session, enrollment_id: int, lesson_id: int):
    db_enrollment = db.query(models.Enrollment).filter(models.Enrollment.id == enrollment_id).first()
    if not db_enrollment:
        return None
        
    completed_lessons_list = json.loads(db_enrollment.completed_lessons)
    if lesson_id in completed_lessons_list:
        completed_lessons_list.remove(lesson_id)
        db_enrollment.completed_lessons = json.dumps(completed_lessons_list)
        db.commit()
        db.refresh(db_enrollment)
    return db_enrollment
