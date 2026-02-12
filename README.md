# Hệ thống Quản lý Học liệu - Trường Sĩ quan Chính trị

Hệ thống quản lý học liệu hiện đại được xây dựng bằng FastAPI, hỗ trợ 3 cấp quyền người dùng và quản lý học liệu theo 14 khoa.

## Tính năng chính

### 1. Hệ thống phân quyền 3 cấp
- **Admin**: Toàn quyền quản lý hệ thống, quản lý người dùng, xóa mọi học liệu
- **Superuser**: Có quyền đăng tải và xóa học liệu của mình
- **User**: Chỉ có quyền xem và tải xuống học liệu

### 2. Upload nhiều file cùng lúc
- Trong một lần đăng học liệu, có thể upload nhiều file theo các loại:
  - **File Tài liệu**: PDF, DOC, DOCX, XLS, XLSX, ZIP, RAR
  - **File Bài giảng**: PDF, DOC, DOCX, PPT, PPTX
  - **File Đề cương**: PDF, DOC, DOCX
  - **File Trình chiếu**: PPT, PPTX, PDF
- Không cần phân loại thủ công, chỉ cần chọn đúng mục để upload
- Mỗi file sẽ tự động được đánh dấu loại

### 2. Upload nhiều file cùng lúc
- Trong một lần đăng học liệu, có thể upload nhiều file theo các loại:
  - **File Tài liệu**: PDF, DOC, DOCX, XLS, XLSX, ZIP, RAR
  - **File Bài giảng**: PDF, DOC, DOCX, PPT, PPTX
  - **File Đề cương**: PDF, DOC, DOCX
  - **File Trình chiếu**: PPT, PPTX, PDF
- Không cần phân loại thủ công, chỉ cần chọn đúng mục để upload
- Mỗi file sẽ tự động được đánh dấu loại

### 3. Quản lý 14 khoa
- K1: Khoa Triết học Mác - Lênin
- K2: Khoa Lịch sử Đảng Cộng sản Việt Nam
- K3: Khoa Công tác Đảng, Công tác Chính trị
- K4: Khoa Chiến thuật
- K5: Khoa Văn hóa - Ngoại ngữ
- K6: Khoa Kinh tế chính trị Mác - Lênin
- K7: Khoa Chủ nghĩa xã hội khoa học
- K8: Khoa Tâm lý học quân sự
- K9: Khoa Bắn súng
- K10: Khoa Quân sự chung
- K11: Khoa Giáo dục thể chất
- K12: Khoa Sư phạm quân sự
- K13: Khoa Tư tưởng Hồ Chí Minh
- K14: Khoa Nhà nước & Pháp luật

### 4. Quản lý học liệu
- **Thông tin học liệu**:
  - Tiêu đề
  - Môn học
  - Chủ đề
  - Nhiều file đính kèm (Tài liệu, Bài giảng, Đề cương, Trình chiếu)
  - Người đăng
  - Thời gian đăng

- **Chức năng**:
  - Upload nhiều file cùng lúc
  - Tìm kiếm chung theo môn học, chủ đề, tiêu đề
  - Tải xuống từng file riêng lẻ
  - Xóa học liệu (với quyền phù hợp)

### 5. Quản lý người dùng (Admin)
- Xem danh sách tất cả người dùng
- Thêm người dùng mới
- Thay đổi quyền người dùng
- Xóa người dùng

### 6. Giao diện hiện đại
- Thiết kế responsive, thân thiện với người dùng
- Menu sidebar với danh sách 14 khoa
- Hiển thị học liệu dạng card với đầy đủ thông tin
- Modal upload học liệu tiện lợi với nhiều file
- Hệ thống màu sắc phân biệt loại file
- Footer thông tin người phát triển

## Thông tin phát triển

**Đơn vị**: 
- Bộ môn KHTN - Khoa Văn hóa Ngoại ngữ
- Ban CNTT - Phòng Tham mưu Hành chính
- Trường Sĩ quan Chính trị

**Người phát triển**: Ngô Hồng Quân

**Liên hệ**: Zalo 0972424294

**Phiên bản**: 2.0.0

**Năm**: 2026

## Cài đặt

### Yêu cầu
- Python 3.8+
- pip

### Các bước cài đặt

1. **Clone hoặc tải dự án về**

2. **Tạo môi trường ảo (khuyến nghị)**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Cài đặt dependencies**
```bash
pip install -r requirements.txt
```

4. **Tạo file .env**
```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Sau đó chỉnh sửa file `.env` với thông tin của bạn:
```
SECRET_KEY=your-secret-key-here-change-in-production
DATABASE_URL=sqlite:///./hoclieu.db
UPLOAD_DIR=app/static/uploads
```

5. **Chạy ứng dụng**
```bash
python main.py
```

Ứng dụng sẽ chạy tại: http://localhost:8000

## Tài khoản mặc định

Khi chạy lần đầu tiên, hệ thống sẽ tự động tạo:
- **Username**: admin
- **Password**: admin123
- **Role**: Admin

**Lưu ý**: Hãy đổi mật khẩu admin ngay sau khi đăng nhập lần đầu!

## Cấu trúc dự án

```
WebHL/
├── app/
│   ├── database/
│   │   └── database.py          # Cấu hình database
│   ├── models/
│   │   └── models.py            # Models: User, Department, Material
│   ├── routes/
│   │   ├── auth.py              # API authentication
│   │   ├── materials.py         # API quản lý học liệu
│   │   └── users.py             # API quản lý người dùng
│   ├── static/
│   │   ├── css/
│   │   │   ├── style.css        # CSS trang chính
│   │   │   └── login.css        # CSS trang login
│   │   ├── js/
│   │   │   └── main.js          # JavaScript chính
│   │   └── uploads/             # Thư mục lưu file upload
│   ├── templates/
│   │   ├── index.html           # Trang chính
│   │   ├── login.html           # Trang đăng nhập
│   │   └── register.html        # Trang đăng ký
│   ├── auth.py                  # Helper functions authentication
│   └── dependencies.py          # Dependencies cho FastAPI
├── main.py                      # File chính chạy ứng dụng
├── requirements.txt             # Python dependencies
├── .env.example                 # File cấu hình mẫu
└── README.md                    # File này
```

## Sử dụng

### Đăng ký tài khoản mới
1. Truy cập http://localhost:8000/register
2. Điền thông tin: username, email, họ tên, mật khẩu
3. Tài khoản mới sẽ có quyền **User** (chỉ xem)
4. Liên hệ Admin để nâng cấp lên **Superuser** (đăng học liệu)

### Đăng tải học liệu (Superuser/Admin)
1. Đăng nhập với tài khoản Superuser hoặc Admin
2. Click nút "Đăng học liệu mới"
3. Điền đầy đủ thông tin:
   - Tiêu đề
   - Môn học
   - Chủ đề (tùy chọn)
   - Khoa
4. Upload file (có thể upload nhiều file):
   - File Tài liệu: chọn nhiều file PDF, DOC, DOCX, XLS, XLSX, ZIP, RAR
   - File Bài giảng: chọn nhiều file PDF, DOC, DOCX, PPT, PPTX
   - File Đề cương: chọn nhiều file PDF, DOC, DOCX
   - File Trình chiếu: chọn nhiều file PPT, PPTX, PDF
5. Click "Đăng tải"

### Tìm kiếm học liệu
1. Chọn khoa từ menu bên trái (hoặc chọn "Tất cả các khoa")
2. Sử dụng thanh tìm kiếm để tìm theo môn học, chủ đề hoặc tiêu đề
3. Kết quả sẽ tự động cập nhật khi bạn nhập

### Tải xuống học liệu
1. Tìm học liệu cần tải
2. Click nút "Tải xuống" trên từng file riêng lẻ trong card học liệu

### Quản lý người dùng (Admin)
1. Đăng nhập với tài khoản Admin
2. Click nút "Quản lý người dùng"
3. Xem danh sách người dùng
4. Thay đổi quyền: chọn quyền mới trong dropdown và xác nhận
5. Xóa người dùng: click nút "Xóa" (không thể xóa chính mình)
6. Thêm người dùng: click "Thêm người dùng" và điền thông tin

### Xóa học liệu
- **Superuser**: Có thể xóa học liệu do mình đăng
- **Admin**: Có thể xóa mọi học liệu

## API Endpoints

### Authentication
- `POST /api/login` - Đăng nhập
- `POST /api/logout` - Đăng xuất
- `POST /api/register` - Đăng ký tài khoản

### Materials
- `GET /api/materials` - Lấy danh sách học liệu (có filter theo department_id, search)
- `POST /api/materials` - Đăng học liệu mới với nhiều file (Superuser/Admin)
- `DELETE /api/materials/{id}` - Xóa học liệu

### Departments
- `GET /api/departments` - Lấy danh sách các khoa

### Users (Admin only)
- `GET /api/users` - Lấy danh sách người dùng
- `POST /api/users` - Tạo người dùng mới
- `PUT /api/users/{id}/role` - Thay đổi quyền người dùng
- `DELETE /api/users/{id}` - Xóa người dùng

## Công nghệ sử dụng

### Backend
- **FastAPI**: Web framework hiện đại, nhanh chóng
- **SQLAlchemy**: ORM cho Python
- **SQLite**: Database (có thể chuyển sang PostgreSQL/MySQL)
- **Python-Jose**: JWT authentication
- **Passlib**: Hash password
- **Python-multipart**: Upload file

### Frontend
- **HTML5/CSS3**: Giao diện
- **JavaScript (Vanilla)**: Logic frontend
- **Jinja2**: Template engine

## Bảo mật

- Mật khẩu được hash bằng bcrypt
- JWT token cho authentication
- Cookie httpOnly để lưu token
- CORS protection
- File upload validation
- Role-based access control (RBAC)

## Tùy chỉnh

### Thay đổi cổng
Mở file `main.py` và sửa dòng cuối:
```python
uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

### Thêm định dạng file upload
Mở file `app/templates/index.html` và sửa thuộc tính `accept`:
```html
<input type="file" id="file" name="file" required 
       accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.mp4,.avi">
```

### Thay đổi database
Mở file `.env` và sửa `DATABASE_URL`:
```
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost/dbname

# MySQL
DATABASE_URL=mysql://user:password@localhost/dbname
```

## Khắc phục sự cố

### Lỗi "Module not found"
```bash
pip install -r requirements.txt
```

### Lỗi không tạo được thư mục uploads
```bash
mkdir -p app/static/uploads
```

### Lỗi database
Xóa file `hoclieu.db` và chạy lại ứng dụng để tạo database mới:
```bash
rm hoclieu.db  # Linux/Mac
del hoclieu.db  # Windows
python main.py
```

### Lỗi port đã được sử dụng
Thay đổi port trong `main.py` hoặc dừng process đang sử dụng port 8000.

## Hỗ trợ

Nếu có vấn đề gì trong quá trình sử dụng, vui lòng:
1. Kiểm tra console/terminal để xem log lỗi
2. Đảm bảo đã cài đặt đầy đủ dependencies
3. Kiểm tra file `.env` có đúng cấu hình không

## License

MIT License - Tự do sử dụng cho mục đích giáo dục và thương mại.

---

**Đơn vị phát triển**:
- Bộ môn KHTN - Khoa Văn hóa Ngoại ngữ
- Ban CNTT - Phòng Tham mưu Hành chính
- Trường Sĩ quan Chính trị

**Phát triển bởi**: Ngô Hồng Quân

**Liên hệ**: Zalo 0972424294

**Phiên bản**: 2.0.0

**Năm**: 2026
