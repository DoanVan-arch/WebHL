from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    SUPERUSER = "superuser"
    USER = "user"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    materials = relationship("Material", back_populates="uploader")

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)  # K1, K2, etc.
    name = Column(String, nullable=False)
    description = Column(String)
    
    materials = relationship("Material", back_populates="department")

class Material(Base):
    __tablename__ = "materials"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    subject = Column(String, nullable=False)  # Môn học
    topic = Column(String)  # Chủ đề
    
    # Lưu nhiều file dạng JSON: [{"type": "tailieu", "path": "...", "name": "..."}, ...]
    files_json = Column(Text, nullable=False)  # JSON string chứa thông tin các file
    
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    department = relationship("Department", back_populates="materials")
    uploader = relationship("User", back_populates="materials")
