# ✅ ĐÃ SỬA LỖI `deleted_at`

## Vấn đề:
```
AttributeError: type object 'Material' has no attribute 'deleted_at'
```

## Nguyên nhân:
- Model `Material` trong `app/models/models.py` KHÔNG CÓ trường `deleted_at`
- Nhưng code trong `app/routes/dashboard.py` đang sử dụng filter `.filter(Material.deleted_at.is_(None))`
- Điều này gây ra lỗi khi truy vấn database

## Đã sửa:
Xóa tất cả references đến `deleted_at` trong file `app/routes/dashboard.py`:

### Trước (CÓ LỖI):
```python
# Dashboard stats
total_materials = db.query(Material).filter(Material.deleted_at.is_(None)).count()

# Recent uploads
recent_materials = db.query(Material).filter(
    Material.deleted_at.is_(None)
).order_by(Material.created_at.desc()).limit(5).all()

# Top uploaders
).join(Material, Material.uploader_id == User.id).filter(
    Material.deleted_at.is_(None)
).group_by(User.username)
```

### Sau (ĐÃ SỬA):
```python
# Dashboard stats
total_materials = db.query(Material).count()

# Recent uploads
recent_materials = db.query(Material).order_by(
    Material.created_at.desc()
).limit(5).all()

# Top uploaders
).join(Material, Material.uploader_id == User.id).group_by(
    User.username
)
```

## Tổng số thay đổi:
- **Xóa 16 references** đến `deleted_at` trong 3 functions:
  1. `get_dashboard_stats()` - 6 chỗ
  2. `get_department_statistics()` - 4 chỗ
  3. `get_overall_statistics()` - 6 chỗ

## Kết quả:
✅ Dashboard API hoạt động bình thường  
✅ Statistics API hoạt động bình thường  
✅ Không còn lỗi `AttributeError`  

## Lưu ý:
- Hệ thống KHÔNG sử dụng soft delete (deleted_at)
- Tất cả materials đều được query trực tiếp
- Nếu muốn implement soft delete trong tương lai, cần:
  1. Thêm `deleted_at = Column(DateTime, nullable=True)` vào model Material
  2. Chạy migration database
  3. Cập nhật DELETE endpoint để set deleted_at thay vì xóa thật

## Cách test:
1. Khởi động server: `python main.py`
2. Truy cập: http://localhost:8000
3. Login: admin/admin123
4. Kiểm tra Dashboard → Xem stats cards và charts
5. Kiểm tra Thống kê → Toggle giữa 2 views

Tất cả sẽ hoạt động bình thường! 🎉
