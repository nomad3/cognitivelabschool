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

class Module(ModuleBase):
    id: int
    course_id: int

    class Config:
        orm_mode = True

# Course Schemas
class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    # instructor_id: Optional[int] = None # Handled by relationship or separate instructor schema

class CourseCreate(CourseBase):
    instructor_id: Optional[int] = None # Allow setting instructor on creation

class Course(CourseBase):
    id: int
    instructor_id: Optional[int] = None
    modules: List[Module] = [] # Include modules in the course response

    class Config:
        orm_mode = True

# User Schemas
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    # courses: List[Course] = [] # To show courses created by this user if they are an instructor
    # enrollments: List['Enrollment'] = [] # Forward reference for Enrollment

    class Config:
        orm_mode = True


# Enrollment Schemas
class EnrollmentBase(BaseModel):
    user_id: int
    course_id: int

class EnrollmentCreate(EnrollmentBase):
    pass

class Enrollment(EnrollmentBase):
    id: int
    enrolled_at: datetime # Changed from string to datetime for Pydantic validation
    user: User # Nested User schema
    course: Course # Nested Course schema

    class Config:
        orm_mode = True

# Update User schema to resolve forward reference if needed, or handle via separate endpoint
# User.update_forward_refs() # If Enrollment was a forward reference string

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
