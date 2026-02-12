# HƯỚNG DẪN NHANH

## Khởi động hệ thống

1. Cài đặt Python dependencies:
```bash
pip install -r requirements.txt
```

2. Chạy ứng dụng:
```bash
python main.py
```

3. Truy cập: http://localhost:8000

## Đăng nhập lần đầu

- **Tên đăng nhập**: admin
- **Mật khẩu**: admin123

## Tính năng chính

### 1. Upload học liệu (Superuser/Admin)
- Click "Đăng học liệu mới"
- Nhập thông tin: Tiêu đề, Môn học, Chủ đề, Khoa
- **Upload nhiều file cùng lúc**:
  - File Tài liệu (PDF, DOC, DOCX, XLS, XLSX, ZIP, RAR)
  - File Bài giảng (PDF, DOC, DOCX, PPT, PPTX)
  - File Đề cương (PDF, DOC, DOCX)
  - File Trình chiếu (PPT, PPTX, PDF)
- Click "Đăng tải"

### 2. Tìm kiếm
- Thanh tìm kiếm chung: Tìm theo môn học, chủ đề, tiêu đề
- Chọn khoa từ menu bên trái để lọc

### 3. Quản lý người dùng (Admin)
- Click "Quản lý người dùng"
- Thêm người dùng mới
- Thay đổi quyền: User → Superuser → Admin
- Xóa người dùng

## Phân quyền

- **Admin**: Toàn quyền, quản lý người dùng, xóa mọi học liệu
- **Superuser**: Đăng tải và xóa học liệu của mình
- **User**: Chỉ xem và tải xuống

## Thông tin liên hệ

**Đơn vị**: 
- Bộ môn KHTN - Khoa Văn hóa Ngoại ngữ
- Ban CNTT - Phòng Tham mưu Hành chính
- Trường Sĩ quan Chính trị

**Người phát triển**: Ngô Hồng Quân

**Zalo**: 0972424294

**Phiên bản**: 2.0.0
