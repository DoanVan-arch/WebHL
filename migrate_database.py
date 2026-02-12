"""
Script migration để cập nhật database từ phiên bản cũ sang mới
Chạy script này khi server đang DỪNG
"""

import sqlite3
import json
import os

DB_PATH = "hoclieu.db"

def migrate_database():
    if not os.path.exists(DB_PATH):
        print("❌ Không tìm thấy database. Vui lòng chạy server để tạo database mới.")
        return
    
    print("🔄 Bắt đầu migration database...")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Kiểm tra xem bảng materials có cột files_json chưa
        cursor.execute("PRAGMA table_info(materials)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'files_json' in columns:
            print("✅ Database đã được cập nhật. Không cần migration.")
            conn.close()
            return
        
        print("📊 Đang sao lưu dữ liệu cũ...")
        
        # Lấy tất cả dữ liệu từ bảng materials cũ
        cursor.execute("""
            SELECT id, title, subject, topic, material_type, file_path, file_name, 
                   department_id, uploader_id, created_at, updated_at
            FROM materials
        """)
        old_materials = cursor.fetchall()
        
        # Tạo bảng mới
        print("🔨 Tạo bảng materials mới...")
        cursor.execute("DROP TABLE IF EXISTS materials_new")
        cursor.execute("""
            CREATE TABLE materials_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR NOT NULL,
                subject VARCHAR NOT NULL,
                topic VARCHAR,
                files_json TEXT NOT NULL,
                department_id INTEGER NOT NULL,
                uploader_id INTEGER NOT NULL,
                created_at DATETIME,
                updated_at DATETIME,
                FOREIGN KEY(department_id) REFERENCES departments(id),
                FOREIGN KEY(uploader_id) REFERENCES users(id)
            )
        """)
        
        # Chuyển đổi dữ liệu
        print(f"📝 Đang chuyển đổi {len(old_materials)} học liệu...")
        for material in old_materials:
            (mid, title, subject, topic, material_type, file_path, file_name, 
             dept_id, uploader_id, created_at, updated_at) = material
            
            # Chuyển đổi từ 1 file sang format JSON
            files_json = json.dumps([{
                "type": material_type or "Tài liệu",
                "path": file_path,
                "name": file_name
            }], ensure_ascii=False)
            
            cursor.execute("""
                INSERT INTO materials_new 
                (id, title, subject, topic, files_json, department_id, uploader_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (mid, title, subject, topic, files_json, dept_id, uploader_id, created_at, updated_at))
        
        # Xóa bảng cũ và đổi tên bảng mới
        print("🔄 Thay thế bảng cũ...")
        cursor.execute("DROP TABLE materials")
        cursor.execute("ALTER TABLE materials_new RENAME TO materials")
        
        # Tạo index
        cursor.execute("CREATE INDEX ix_materials_id ON materials (id)")
        cursor.execute("CREATE INDEX ix_materials_title ON materials (title)")
        
        conn.commit()
        print("✅ Migration hoàn thành!")
        print(f"✅ Đã chuyển đổi {len(old_materials)} học liệu sang format mới")
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("MIGRATION DATABASE - Phiên bản 1.0 -> 2.0")
    print("=" * 60)
    print()
    
    response = input("⚠️  Bạn có chắc muốn migration database? (y/n): ")
    if response.lower() != 'y':
        print("❌ Hủy migration")
        exit(0)
    
    migrate_database()
    
    print()
    print("=" * 60)
    print("✅ HOÀN THÀNH! Bạn có thể chạy lại server bây giờ.")
    print("=" * 60)
