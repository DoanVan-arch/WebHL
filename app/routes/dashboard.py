from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.database.database import get_db
from app.models.models import Material, User, Department
from app.dependencies import get_current_user
from datetime import datetime, timedelta
import json

router = APIRouter()

@router.get("/api/dashboard/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics"""
    
    # Total materials
    total_materials = db.query(Material).count()
    
    # Total users
    total_users = db.query(User).count()
    
    # Total departments
    total_departments = db.query(Department).count()
    
    # Materials uploaded today
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    materials_today = db.query(Material).filter(
        Material.created_at >= today_start
    ).count()
    
    # Materials uploaded this week
    week_start = today_start - timedelta(days=today_start.weekday())
    materials_this_week = db.query(Material).filter(
        Material.created_at >= week_start
    ).count()
    
    # Materials uploaded this month
    month_start = today_start.replace(day=1)
    materials_this_month = db.query(Material).filter(
        Material.created_at >= month_start
    ).count()
    
    # Recent uploads (last 5)
    recent_materials = db.query(Material).order_by(
        Material.created_at.desc()
    ).limit(5).all()
    
    recent_uploads = []
    for material in recent_materials:
        uploader = db.query(User).filter(User.id == material.uploader_id).first()
        department = db.query(Department).filter(Department.id == material.department_id).first()
        
        recent_uploads.append({
            'id': material.id,
            'title': material.title,
            'subject': material.subject,
            'uploader': uploader.username if uploader else 'Unknown',
            'department': department.name if department else 'Unknown',
            'created_at': material.created_at.isoformat()
        })
    
    # Top uploaders (top 5)
    top_uploaders_data = db.query(
        User.username,
        func.count(Material.id).label('count')
    ).join(Material, Material.uploader_id == User.id).group_by(
        User.username
    ).order_by(func.count(Material.id).desc()).limit(5).all()
    
    top_uploaders = [{'username': username, 'count': count} for username, count in top_uploaders_data]
    
    # Materials by department
    materials_by_dept = db.query(
        Department.name,
        func.count(Material.id).label('count')
    ).join(Material, Material.department_id == Department.id).group_by(Department.name).all()
    
    departments_data = [{'department': dept, 'count': count} for dept, count in materials_by_dept]
    
    return {
        'total_materials': total_materials,
        'total_users': total_users,
        'total_departments': total_departments,
        'materials_today': materials_today,
        'materials_this_week': materials_this_week,
        'materials_this_month': materials_this_month,
        'recent_uploads': recent_uploads,
        'top_uploaders': top_uploaders,
        'departments_data': departments_data
    }

@router.get("/api/statistics/department/{dept_id}")
async def get_department_statistics(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get statistics for a specific department"""
    
    # Verify department exists
    department = db.query(Department).filter(Department.id == dept_id).first()
    if not department:
        return {"error": "Department not found"}
    
    # Total materials for department
    total_materials = db.query(Material).filter(
        Material.department_id == dept_id
    ).count()
    
    # Materials by file type (count files in files_json)
    materials = db.query(Material).filter(
        Material.department_id == dept_id
    ).all()
    
    file_type_counts = {
        'Tài liệu': 0,
        'Giảng nghĩa': 0,
        'Đề cương': 0,
        'Slide bài giảng': 0
    }
    
    for material in materials:
        files = json.loads(material.files_json)
        for file_info in files:
            category = file_info.get('category', 'Tài liệu')
            if category in file_type_counts:
                file_type_counts[category] += 1
    
    # Materials by month (last 12 months)
    twelve_months_ago = datetime.now() - timedelta(days=365)
    materials_by_month = db.query(
        extract('year', Material.created_at).label('year'),
        extract('month', Material.created_at).label('month'),
        func.count(Material.id).label('count')
    ).filter(
        Material.department_id == dept_id,
        Material.created_at >= twelve_months_ago
    ).group_by('year', 'month').order_by('year', 'month').all()
    
    # Format month data
    month_labels = []
    month_counts = []
    for year, month, count in materials_by_month:
        month_name = datetime(int(year), int(month), 1).strftime('%m/%Y')
        month_labels.append(month_name)
        month_counts.append(count)
    
    # Top uploaders in department
    top_uploaders = db.query(
        User.username,
        func.count(Material.id).label('count')
    ).join(Material, Material.uploader_id == User.id).filter(
        Material.department_id == dept_id
    ).group_by(User.username).order_by(func.count(Material.id).desc()).limit(5).all()
    
    uploaders_data = [{'username': username, 'count': count} for username, count in top_uploaders]
    
    return {
        'department_name': department.name,
        'department_code': department.code,
        'total_materials': total_materials,
        'file_type_counts': file_type_counts,
        'month_labels': month_labels,
        'month_counts': month_counts,
        'top_uploaders': uploaders_data
    }

@router.get("/api/statistics/overall")
async def get_overall_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get overall system statistics"""
    
    # Total materials
    total_materials = db.query(Material).count()
    
    # Materials by department (all departments)
    departments_data = db.query(
        Department.code,
        Department.name,
        func.count(Material.id).label('count')
    ).outerjoin(Material, Material.department_id == Department.id).group_by(
        Department.code, Department.name
    ).order_by(Department.code).all()
    
    dept_comparison = []
    for code, name, count in departments_data:
        dept_comparison.append({
            'code': code,
            'name': name,
            'count': count if count else 0
        })
    
    # Materials uploaded over time (last 12 months - all departments)
    twelve_months_ago = datetime.now() - timedelta(days=365)
    materials_by_month = db.query(
        extract('year', Material.created_at).label('year'),
        extract('month', Material.created_at).label('month'),
        func.count(Material.id).label('count')
    ).filter(
        Material.created_at >= twelve_months_ago
    ).group_by('year', 'month').order_by('year', 'month').all()
    
    # Format month data
    growth_labels = []
    growth_counts = []
    for year, month, count in materials_by_month:
        month_name = datetime(int(year), int(month), 1).strftime('%m/%Y')
        growth_labels.append(month_name)
        growth_counts.append(count)
    
    # Total file types across all departments
    all_materials = db.query(Material).all()
    
    overall_file_types = {
        'Tài liệu': 0,
        'Giảng nghĩa': 0,
        'Đề cương': 0,
        'Slide bài giảng': 0
    }
    
    for material in all_materials:
        files = json.loads(material.files_json)
        for file_info in files:
            category = file_info.get('category', 'Tài liệu')
            if category in overall_file_types:
                overall_file_types[category] += 1
    
    # Top uploaders (all departments)
    top_uploaders = db.query(
        User.username,
        func.count(Material.id).label('count')
    ).join(Material, Material.uploader_id == User.id).group_by(
        User.username
    ).order_by(func.count(Material.id).desc()).limit(10).all()
    
    uploaders_data = [{'username': username, 'count': count} for username, count in top_uploaders]
    
    return {
        'total_materials': total_materials,
        'dept_comparison': dept_comparison,
        'growth_labels': growth_labels,
        'growth_counts': growth_counts,
        'overall_file_types': overall_file_types,
        'top_uploaders': uploaders_data
    }

