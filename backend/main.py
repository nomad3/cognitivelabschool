from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List # Ensure List is imported here as it's used later

import crud
import models
import schemas
from database import SessionLocal, engine, get_db # Changed to absolute import

models.Base.metadata.create_all(bind=engine)

# JWT Configuration
SECRET_KEY = "your-secret-key"  # In a real app, use a strong, environment-variable-based key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not crud.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(get_current_user)):
    return current_user

@app.get("/")
async def root():
    return {"message": "Hello World from CognitiveLabsSchool Backend!"}

# Course Endpoints
@app.post("/courses/", response_model=schemas.Course, status_code=status.HTTP_201_CREATED)
def create_new_course(course: schemas.CourseCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    # Assuming current_user is the instructor, or add specific role check
    return crud.create_course(db=db, course=course, instructor_id=current_user.id)

@app.get("/courses/", response_model=List[schemas.Course])
def read_courses(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    courses = crud.get_courses(db, skip=skip, limit=limit)
    return courses

@app.get("/courses/{course_id}", response_model=schemas.Course)
def read_course(course_id: int, db: Session = Depends(get_db)):
    db_course = crud.get_course(db, course_id=course_id)
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return db_course

# Module Endpoints
@app.post("/courses/{course_id}/modules/", response_model=schemas.Module, status_code=status.HTTP_201_CREATED)
def create_new_module_for_course(
    course_id: int, module: schemas.ModuleCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)
):
    db_course = crud.get_course(db, course_id=course_id)
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    if db_course.instructor_id is not None and db_course.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add modules to this course")
    return crud.create_module_for_course(db=db, module=module, course_id=course_id)

@app.get("/courses/{course_id}/modules/", response_model=List[schemas.Module])
def read_modules_for_course(course_id: int, skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    db_course = crud.get_course(db, course_id=course_id)
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    modules = crud.get_modules_for_course(db, course_id=course_id, skip=skip, limit=limit)
    return modules

# Lesson Endpoints
@app.post("/modules/{module_id}/lessons/", response_model=schemas.Lesson, status_code=status.HTTP_201_CREATED)
def create_new_lesson_for_module(
    module_id: int, lesson: schemas.LessonCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)
):
    db_module = crud.get_module(db, module_id=module_id)
    if db_module is None:
        raise HTTPException(status_code=404, detail="Module not found")
    db_course = crud.get_course(db, course_id=db_module.course_id)
    if db_course.instructor_id is not None and db_course.instructor_id != current_user.id: 
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add lessons to this module")
    return crud.create_lesson_for_module(db=db, lesson=lesson, module_id=module_id)

@app.get("/modules/{module_id}/lessons/", response_model=List[schemas.Lesson])
def read_lessons_for_module(module_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    db_module = crud.get_module(db, module_id=module_id)
    if db_module is None:
        raise HTTPException(status_code=404, detail="Module not found")
    lessons = crud.get_lessons_for_module(db, module_id=module_id, skip=skip, limit=limit)
    return lessons

@app.get("/lessons/{lesson_id}", response_model=schemas.Lesson)
def read_lesson(lesson_id: int, db: Session = Depends(get_db)):
    db_lesson = crud.get_lesson(db, lesson_id=lesson_id)
    if db_lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return db_lesson

# Enrollment Endpoints
@app.post("/enrollments/", response_model=schemas.Enrollment, status_code=status.HTTP_201_CREATED)
def enroll_in_course(enrollment: schemas.EnrollmentCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    if current_user.id != enrollment.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot enroll other users")
    db_course = crud.get_course(db, course_id=enrollment.course_id)
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    existing_enrollment = crud.get_enrollment_by_user_and_course(db, user_id=current_user.id, course_id=enrollment.course_id)
    if existing_enrollment:
        raise HTTPException(status_code=400, detail="User already enrolled in this course")
    return crud.create_enrollment(db=db, enrollment=enrollment)

@app.get("/users/me/enrollments/", response_model=List[schemas.Enrollment])
def read_my_enrollments(db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user), skip: int = 0, limit: int = 10):
    return crud.get_enrollments_by_user(db, user_id=current_user.id, skip=skip, limit=limit)

# Temp endpoint to seed data
@app.post("/seed_data/", status_code=status.HTTP_201_CREATED)
def seed_data(db: Session = Depends(get_db)):
    courses_exist = db.query(models.Course).first()
    if courses_exist:
        raise HTTPException(status_code=400, detail="Data already seeded")

    instructor_email = "instructor@example.com"
    instructor = crud.get_user_by_email(db, email=instructor_email)
    if not instructor:
        instructor_user_in = schemas.UserCreate(email=instructor_email, password="securepassword", full_name="Dr. Instructor")
        instructor = crud.create_user(db, instructor_user_in)

    course1_in = schemas.CourseCreate(title="Introduction to AI", description="Learn the fundamentals of Artificial Intelligence.", instructor_id=instructor.id)
    course1 = crud.create_course(db, course=course1_in, instructor_id=instructor.id)
    course2_in = schemas.CourseCreate(title="Advanced Python for AI", description="Deep dive into Python programming for AI applications.", instructor_id=instructor.id)
    course2 = crud.create_course(db, course=course2_in, instructor_id=instructor.id)
    course3_in = schemas.CourseCreate(title="Natural Language Processing", description="Understand and build NLP models.", instructor_id=instructor.id)
    course3 = crud.create_course(db, course=course3_in, instructor_id=instructor.id)

    # Seed Modules for Course 1
    module1_c1_schema = schemas.ModuleCreate(title="Module 1: What is AI?", description="History and basic concepts of AI.", order=1)
    module1_c1_db = crud.create_module_for_course(db, module=module1_c1_schema, course_id=course1.id)
    
    module2_c1_schema = schemas.ModuleCreate(title="Module 2: Machine Learning Basics", description="Introduction to ML algorithms.", order=2)
    module2_c1_db = crud.create_module_for_course(db, module=module2_c1_schema, course_id=course1.id)

    # Seed Modules for Course 2
    module1_c2_schema = schemas.ModuleCreate(title="Module 1: Advanced Data Structures", description="Using advanced data structures in Python.", order=1)
    module1_c2_db = crud.create_module_for_course(db, module=module1_c2_schema, course_id=course2.id)

    # Seed Lessons for Module 1 of Course 1
    lesson1_m1_c1 = schemas.LessonCreate(title="Lesson 1.1: Introduction to AI Concepts", content="This lesson covers the core ideas behind AI.", order=1, content_type="text")
    crud.create_lesson_for_module(db, lesson=lesson1_m1_c1, module_id=module1_c1_db.id)
    lesson2_m1_c1 = schemas.LessonCreate(title="Lesson 1.2: Types of AI", content="Exploring narrow, general, and super AI.", order=2, content_type="text")
    crud.create_lesson_for_module(db, lesson=lesson2_m1_c1, module_id=module1_c1_db.id)

    # Seed Lessons for Module 2 of Course 1
    lesson1_m2_c1 = schemas.LessonCreate(title="Lesson 2.1: Supervised Learning", content="Understanding supervised machine learning.", order=1, content_type="text")
    crud.create_lesson_for_module(db, lesson=lesson1_m2_c1, module_id=module2_c1_db.id)
    
    # Seed Lessons for Module 1 of Course 2
    lesson1_m1_c2 = schemas.LessonCreate(title="Lesson 1.1: Python Lists and Dictionaries", content="Deep dive into lists and dicts for performance.", order=1, content_type="text")
    crud.create_lesson_for_module(db, lesson=lesson1_m1_c2, module_id=module1_c2_db.id)

    return {"message": "Sample data seeded successfully with courses, modules, and lessons!"}
