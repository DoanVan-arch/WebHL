# Hướng dẫn sử dụng Dashboard và Thống kê

## Các trang đã được thêm:

### 1. Dashboard (`/dashboard`)
- **Mục đích**: Xem tổng quan nhanh về hệ thống
- **Nội dung**:
  - 6 thẻ thống kê: Tổng học liệu, người dùng, khoa, học liệu hôm nay/tuần/tháng
  - Biểu đồ học liệu theo khoa (cột)
  - Top 5 người đăng nhiều nhất (cột ngang)
  - Bảng 5 học liệu mới nhất

### 2. Thống kê (`/statistics`)
- **Mục đích**: Xem thống kê chi tiết
- **2 chế độ xem**:

#### Chế độ "Tổng quan hệ thống":
  - So sánh học liệu giữa 14 khoa
  - Xu hướng tăng trưởng 12 tháng
  - Phân loại theo loại file
  - Top 10 người đăng

#### Chế độ "Theo khoa":
  - Chọn khoa từ dropdown
  - Tổng số học liệu của khoa
  - Phân loại file theo loại
  - Xu hướng theo tháng (12 tháng)
  - Top 5 người đăng của khoa

## Cách truy cập:

1. Đăng nhập vào hệ thống
2. Nhìn vào sidebar bên trái, bạn sẽ thấy 3 mục:
   - 📚 Quản lý Học liệu (trang chính)
   - 📊 Dashboard (trang mới)
   - 📈 Thống kê (trang mới)

## Lỗi đã sửa:

✅ Giao diện sidebar đã được chuẩn hóa trên cả 3 trang
✅ Navigation menu hiển thị đồng nhất với icon và tên
✅ CSS responsive đã được cải thiện
✅ Charts tự động scale theo màn hình
✅ Bố cục grid đã được tối ưu (4 cột -> 2 cột -> 1 cột tùy kích thước màn hình)

## Kiểm tra:

Nếu vẫn gặp lỗi, vui lòng:
1. Xóa cache trình duyệt (Ctrl + F5)
2. Khởi động lại server: `python main.py`
3. Kiểm tra console trong DevTools (F12) để xem lỗi JavaScript
4. Kiểm tra terminal để xem lỗi Python

## API Endpoints mới:

- `GET /api/dashboard/stats` - Dữ liệu dashboard
- `GET /api/statistics/department/{dept_id}` - Thống kê theo khoa
- `GET /api/statistics/overall` - Thống kê tổng quan
