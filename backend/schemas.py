from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime # Added for enrolled_at

# Module Schemas
class ModuleBase(BaseModel):
    title: str
    description: Optional[str] = None
    order: Optional[int] = 0

class ModuleCreate(ModuleBase):
    pass

class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None

class Module(ModuleBase):
    id: int
    course_id: int

    model_config = {"from_attributes": True}


# Lesson Schemas
class LessonBase(BaseModel):
    title: str
    content: Optional[str] = None
    content_type: Optional[str] = "text"
    order: Optional[int] = 0

class LessonCreate(LessonBase):
    pass

class Lesson(LessonBase):
    id: int
    module_id: int

    model_config = {"from_attributes": True}


# Update Module schema to include lessons
class Module(ModuleBase): # Re-declare to update
    id: int
    course_id: int
    lessons: List[Lesson] = []

    model_config = {"from_attributes": True}


# Course Schemas
class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None

class CourseCreate(CourseBase):
    instructor_id: Optional[int] = None # Allow setting instructor on creation

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    instructor_id: Optional[int] = None

class Course(CourseBase):
    id: int
    instructor_id: Optional[int] = None
    modules: List[Module] = [] # Include modules in the course response

    model_config = {"from_attributes": True}

# User Schemas
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    is_admin: bool | None = False

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    # courses: List[Course] = [] # To show courses created by this user if they are an instructor
    # enrollments: List['Enrollment'] = [] # Forward reference for Enrollment

    model_config = {"from_attributes": True}


# Enrollment Schemas
class EnrollmentBase(BaseModel):
    user_id: int
    course_id: int

class EnrollmentCreate(EnrollmentBase):
    pass

import json # For parsing completed_lessons

class Enrollment(EnrollmentBase):
    id: int
    enrolled_at: datetime 
    user: User 
    course: Course 
    completed_lessons: List[int] # Will be a list of lesson IDs

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm(cls, obj: any) -> "Enrollment":
        # Custom from_orm to parse completed_lessons from JSON string to list
        data = super().from_orm(obj).dict()
        if isinstance(obj.completed_lessons, str):
            try:
                data['completed_lessons'] = json.loads(obj.completed_lessons)
            except json.JSONDecodeError:
                data['completed_lessons'] = [] # Default to empty list on error
        elif isinstance(obj.completed_lessons, list): # Already a list (e.g. if directly set)
             data['completed_lessons'] = obj.completed_lessons
        else:
            data['completed_lessons'] = []
        return cls(**data)

# Update User schema to resolve forward reference if needed, or handle via separate endpoint
# User.update_forward_refs() # If Enrollment was a forward reference string

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    is_admin: bool # Added to inform frontend if user is admin

class TokenData(BaseModel):
    email: Optional[str] = None
