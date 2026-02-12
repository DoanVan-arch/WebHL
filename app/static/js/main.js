// Global variables
let currentUser = null;
let currentDepartmentId = null;
let materials = [];
let allMaterials = []; // Keep unfiltered list
let departments = [];
let users = [];
let searchContentEnabled = false;
let columnFilters = {
    subject: '',
    topic: '',
    uploader: '',
    dateFrom: '',
    dateTo: ''
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadDepartments();
    await loadMaterials();
    setupEventListeners();
});

// Load departments
async function loadDepartments() {
    try {
        const response = await fetch('/api/departments');
        const data = await response.json();
        departments = data.departments;
        renderDepartments();
    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

// Render departments menu
function renderDepartments() {
    const container = document.getElementById('departmentList');
    if (!container) return;
    
    container.innerHTML = `
        <div class="department-item active" data-id="all" onclick="selectDepartment(null, event)">
            <span class="department-code">All</span>
            <span class="department-name">Tất cả các khoa</span>
        </div>
    ` + departments.map((dept) => `
        <div class="department-item" 
             data-id="${dept.id}" 
             onclick="selectDepartment(${dept.id}, event)">
            <span class="department-code">${dept.code}</span>
            <span class="department-name">${dept.name}</span>
        </div>
    `).join('');
}

// Select department
function selectDepartment(departmentId, event) {
    currentDepartmentId = departmentId;
    
    // Update active state
    document.querySelectorAll('.department-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.department-item').classList.add('active');
    
    // Reload materials
    loadMaterials();
}

// Load materials
async function loadMaterials() {
    try {
        let url = '/api/materials';
        const params = new URLSearchParams();
        
        if (currentDepartmentId) {
            params.append('department_id', currentDepartmentId);
        }
        
        const search = document.getElementById('filterSearch')?.value;
        if (search) {
            params.append('search', search);
        }
        
        const uploader = document.getElementById('filterUploader')?.value;
        if (uploader) {
            params.append('uploader', uploader);
        }
        
        // Add content search parameter
        if (searchContentEnabled && search) {
            params.append('search_content', 'true');
        }
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const response = await fetch(url);
        const data = await response.json();
        allMaterials = data.materials;
        materials = [...allMaterials];
        
        // Update column filter options
        updateColumnFilterOptions();
        
        // Apply column filters
        applyColumnFilters();
        
        renderMaterialsTable();
    } catch (error) {
        console.error('Error loading materials:', error);
        showError('Không thể tải danh sách học liệu');
    }
}

// Render materials table
function renderMaterialsTable() {
    const tbody = document.getElementById('materialsTableBody');
    if (!tbody) return;
    
    if (materials.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 50px; color: #999;">
                    <h3>Chưa có học liệu</h3>
                    <p>Không tìm thấy học liệu nào phù hợp với bộ lọc của bạn</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = materials.map((material, index) => {
        const canEdit = checkEditPermission(material);
        const canDelete = checkDeletePermission(material);
        
        return `
            <tr onclick="viewMaterialDetail(${material.id})" style="cursor: pointer;">
                <td class="col-stt">${index + 1}</td>
                <td class="col-title"><strong>${escapeHtml(material.title)}</strong></td>
                <td class="col-subject">${escapeHtml(material.subject)}</td>
                <td class="col-topic">${material.topic ? escapeHtml(material.topic) : '-'}</td>
                <td class="col-files">
                    <span class="file-count">
                        📎 ${material.files.length} file
                    </span>
                </td>
                <td class="col-uploader">${escapeHtml(material.uploader.full_name)}</td>
                <td class="col-date date-cell">${formatDate(material.created_at)}</td>
                <td onclick="event.stopPropagation();">
                    <div class="action-cell">
                        <button class="btn-view" onclick="viewMaterialDetail(${material.id})" title="Xem chi tiết">
                            Xem
                        </button>
                        ${canEdit ? `<button class="btn-edit" onclick="showEditModal(${material.id})" title="Chỉnh sửa">Sửa</button>` : ''}
                        ${canDelete ? `<button class="btn-delete" onclick="deleteMaterial(${material.id})" title="Xóa">Xóa</button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// View material detail
function viewMaterialDetail(materialId) {
    window.location.href = `/detail?id=${materialId}`;
}

// Toggle filter visibility
function toggleFilter() {
    const filterBar = document.getElementById('filterBar');
    const toggleBtn = document.querySelector('.btn-filter-toggle');
    const icon = document.getElementById('filterToggleIcon');
    
    if (filterBar.classList.contains('hidden')) {
        filterBar.classList.remove('hidden');
        toggleBtn.classList.remove('collapsed');
        icon.textContent = '▼';
    } else {
        filterBar.classList.add('hidden');
        toggleBtn.classList.add('collapsed');
        icon.textContent = '▶';
    }
}

// Toggle content search
function toggleContentSearch() {
    const checkbox = document.getElementById('searchContent');
    searchContentEnabled = checkbox.checked;
    
    if (searchContentEnabled) {
        showInfo('Tìm kiếm theo nội dung đã được bật. Quá trình tìm kiếm có thể mất nhiều thời gian hơn.');
    }
    
    // Reload materials if there's search text
    const search = document.getElementById('filterSearch')?.value;
    if (search) {
        loadMaterials();
    }
}

// Toggle column controls visibility
function toggleColumnControls() {
    const checkboxes = document.getElementById('columnCheckboxes');
    if (checkboxes.style.display === 'none') {
        checkboxes.style.display = 'flex';
    } else {
        checkboxes.style.display = 'none';
    }
}

// Toggle column visibility
function toggleColumn(columnClass) {
    const elements = document.querySelectorAll('.' + columnClass);
    const checkbox = document.getElementById('toggle-' + columnClass.replace('col-', ''));
    
    elements.forEach(el => {
        if (checkbox.checked) {
            el.style.display = '';
        } else {
            el.style.display = 'none';
        }
    });
}

// Update column filter options
function updateColumnFilterOptions() {
    // Get unique values
    const subjects = [...new Set(allMaterials.map(m => m.subject))].sort();
    const topics = [...new Set(allMaterials.map(m => m.topic).filter(t => t))].sort();
    const uploaders = [...new Set(allMaterials.map(m => m.uploader.full_name))].sort();
    
    // Update subject filter
    const subjectFilter = document.getElementById('filterSubject');
    if (subjectFilter) {
        subjectFilter.innerHTML = '<option value="">-- Tất cả --</option>' +
            subjects.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
    }
    
    // Update topic filter
    const topicFilter = document.getElementById('filterTopic');
    if (topicFilter) {
        topicFilter.innerHTML = '<option value="">-- Tất cả --</option>' +
            topics.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
    }
    
    // Update uploader filter
    const uploaderFilter = document.getElementById('filterUploaderSelect');
    if (uploaderFilter) {
        uploaderFilter.innerHTML = '<option value="">-- Tất cả --</option>' +
            uploaders.map(u => `<option value="${escapeHtml(u)}">${escapeHtml(u)}</option>`).join('');
    }
}

// Filter by column
function filterByColumn(column, value) {
    columnFilters[column] = value;
    applyColumnFilters();
    renderMaterialsTable();
}

// Apply all column filters
function applyColumnFilters() {
    materials = allMaterials.filter(m => {
        // Filter by subject
        if (columnFilters.subject && m.subject !== columnFilters.subject) return false;
        
        // Filter by topic
        if (columnFilters.topic && m.topic !== columnFilters.topic) return false;
        
        // Filter by uploader
        if (columnFilters.uploader && m.uploader.full_name !== columnFilters.uploader) return false;
        
        // Filter by date range
        if (columnFilters.dateFrom || columnFilters.dateTo) {
            const materialDate = new Date(m.created_at);
            
            if (columnFilters.dateFrom) {
                const fromDate = new Date(columnFilters.dateFrom);
                fromDate.setHours(0, 0, 0, 0);
                if (materialDate < fromDate) return false;
            }
            
            if (columnFilters.dateTo) {
                const toDate = new Date(columnFilters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (materialDate > toDate) return false;
            }
        }
        
        return true;
    });
}

// Filter by date range
function filterByDateRange() {
    const dateFrom = document.getElementById('filterDateFrom')?.value;
    const dateTo = document.getElementById('filterDateTo')?.value;
    
    columnFilters.dateFrom = dateFrom;
    columnFilters.dateTo = dateTo;
    
    applyColumnFilters();
    renderMaterialsTable();
}

// Toggle column filters visibility
function toggleColumnFilters() {
    const filters = document.querySelectorAll('.filter-dropdown');
    const isHidden = filters[0]?.classList.contains('hidden');
    
    filters.forEach(filter => {
        if (isHidden) {
            filter.classList.remove('hidden');
        } else {
            filter.classList.add('hidden');
        }
    });
}

// Reset all column filters
function resetColumnFilters() {
    // Reset filter values
    columnFilters = {
        subject: '',
        topic: '',
        uploader: '',
        dateFrom: '',
        dateTo: ''
    };
    
    // Reset dropdown selections
    const subjectFilter = document.getElementById('filterSubject');
    const topicFilter = document.getElementById('filterTopic');
    const uploaderFilter = document.getElementById('filterUploaderSelect');
    const dateFromFilter = document.getElementById('filterDateFrom');
    const dateToFilter = document.getElementById('filterDateTo');
    
    if (subjectFilter) subjectFilter.value = '';
    if (topicFilter) topicFilter.value = '';
    if (uploaderFilter) uploaderFilter.value = '';
    if (dateFromFilter) dateFromFilter.value = '';
    if (dateToFilter) dateToFilter.value = '';
    
    // Reapply filters (will show all)
    applyColumnFilters();
    renderMaterialsTable();
}

// Get badge class for material type
function getBadgeClass(type) {
    const typeMap = {
        'Tài liệu': 'badge-tailieu',
        'Bài giảng': 'badge-baigiang',
        'Đề cương': 'badge-decuong',
        'Trình chiếu': 'badge-giaoan'
    };
    return typeMap[type] || 'badge-tailieu';
}

// Check delete permission
function checkDeletePermission(material) {
    if (typeof currentUserRole === 'undefined') return false;
    
    if (currentUserRole === 'admin') return true;
    if (currentUserRole === 'superuser' && material.uploader.id === currentUserId) return true;
    
    return false;
}

// Check edit permission (same as delete)
function checkEditPermission(material) {
    if (typeof currentUserRole === 'undefined') return false;
    
    if (currentUserRole === 'admin') return true;
    if (currentUserRole === 'superuser' && material.uploader.id === currentUserId) return true;
    
    return false;
}

// Download file
function downloadFile(filePath, fileName) {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;
    link.click();
}

// Delete material
async function deleteMaterial(materialId) {
    if (!confirm('Bạn có chắc chắn muốn xóa học liệu này?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/materials/${materialId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Xóa học liệu thành công');
            await loadMaterials();
        } else {
            const data = await response.json();
            showError(data.detail || 'Không thể xóa học liệu');
        }
    } catch (error) {
        console.error('Error deleting material:', error);
        showError('Đã xảy ra lỗi khi xóa học liệu');
    }
}

// Show upload modal
function showUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Show edit modal
async function showEditModal(materialId) {
    const modal = document.getElementById('editModal');
    if (!modal) return;
    
    try {
        // Fetch material details
        const response = await fetch(`/api/materials/${materialId}`);
        if (!response.ok) {
            throw new Error('Không thể tải thông tin học liệu');
        }
        
        const material = await response.json();
        
        // Populate form
        document.getElementById('edit_material_id').value = material.id;
        document.getElementById('edit_title').value = material.title;
        document.getElementById('edit_subject').value = material.subject;
        document.getElementById('edit_topic').value = material.topic || '';
        document.getElementById('edit_department_id').value = material.department.id;
        
        // Show modal
        modal.classList.add('active');
    } catch (error) {
        console.error('Error loading material:', error);
        showError('Không thể tải thông tin học liệu');
    }
}

// Show user management modal
async function showUserManagement() {
    const modal = document.getElementById('userManagementModal');
    if (modal) {
        modal.classList.add('active');
        await loadUsers();
    }
}

// Load users (admin only)
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        if (response.ok) {
            const data = await response.json();
            users = data.users;
            renderUsers();
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Render users table
function renderUsers() {
    const container = document.getElementById('usersTable');
    if (!container) return;
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Tên đăng nhập</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Quyền</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td>${escapeHtml(user.username)}</td>
                        <td>${escapeHtml(user.full_name)}</td>
                        <td>${escapeHtml(user.email)}</td>
                        <td>
                            <span class="role-badge role-${user.role}">
                                ${getRoleLabel(user.role)}
                            </span>
                        </td>
                        <td>${formatDate(user.created_at)}</td>
                        <td>
                            <select onchange="changeUserRole(${user.id}, this.value)" class="btn-small">
                                <option value="">Đổi quyền</option>
                                <option value="user">User</option>
                                <option value="superuser">Superuser</option>
                                <option value="admin">Admin</option>
                            </select>
                            ${user.id !== currentUserId ? `
                                <button class="btn-small btn-danger" onclick="deleteUser(${user.id})">Xóa</button>
                            ` : ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Get role label
function getRoleLabel(role) {
    const labels = {
        'admin': 'Quản trị viên',
        'superuser': 'Người đăng',
        'user': 'Người xem'
    };
    return labels[role] || role;
}

// Change user role
async function changeUserRole(userId, newRole) {
    if (!newRole) return;
    
    if (!confirm('Bạn có chắc chắn muốn thay đổi quyền người dùng này?')) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('role', newRole);
        
        const response = await fetch(`/api/users/${userId}/role`, {
            method: 'PUT',
            body: formData
        });
        
        if (response.ok) {
            showSuccess('Cập nhật quyền thành công');
            await loadUsers();
        } else {
            const data = await response.json();
            showError(data.detail || 'Không thể cập nhật quyền');
        }
    } catch (error) {
        console.error('Error changing role:', error);
        showError('Đã xảy ra lỗi');
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Xóa người dùng thành công');
            await loadUsers();
        } else {
            const data = await response.json();
            showError(data.detail || 'Không thể xóa người dùng');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showError('Đã xảy ra lỗi');
    }
}

// Show create user modal
function showCreateUserModal() {
    const modal = document.getElementById('createUserModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId || 'uploadModal');
    if (modal) {
        modal.classList.remove('active');
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Upload form submit
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await uploadMaterial();
        });
    }
    
    // Edit form submit
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await updateMaterial();
        });
    }
    
    // Create user form submit
    const createUserForm = document.getElementById('createUserForm');
    if (createUserForm) {
        createUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await createUser();
        });
    }
    
    // Search filter
    const filterSearch = document.getElementById('filterSearch');
    if (filterSearch) {
        filterSearch.addEventListener('input', debounce(loadMaterials, 500));
    }
    
    // Uploader filter
    const filterUploader = document.getElementById('filterUploader');
    if (filterUploader) {
        filterUploader.addEventListener('input', debounce(loadMaterials, 500));
    }
    
    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Upload material
async function uploadMaterial() {
    const form = document.getElementById('uploadForm');
    const formData = new FormData(form);
    
    try {
        const response = await fetch('/api/materials', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            showSuccess('Đăng học liệu thành công');
            closeModal('uploadModal');
            await loadMaterials();
        } else {
            const data = await response.json();
            showError(data.detail || 'Không thể đăng học liệu');
        }
    } catch (error) {
        console.error('Error uploading material:', error);
        showError('Đã xảy ra lỗi khi đăng học liệu');
    }
}

// Update material
async function updateMaterial() {
    const materialId = document.getElementById('edit_material_id').value;
    const formData = new FormData();
    
    formData.append('title', document.getElementById('edit_title').value);
    formData.append('subject', document.getElementById('edit_subject').value);
    formData.append('topic', document.getElementById('edit_topic').value);
    formData.append('department_id', document.getElementById('edit_department_id').value);
    
    try {
        const response = await fetch(`/api/materials/${materialId}`, {
            method: 'PUT',
            body: formData
        });
        
        if (response.ok) {
            showSuccess('Cập nhật học liệu thành công');
            closeModal('editModal');
            await loadMaterials();
        } else {
            const data = await response.json();
            showError(data.detail || 'Không thể cập nhật học liệu');
        }
    } catch (error) {
        console.error('Error updating material:', error);
        showError('Đã xảy ra lỗi khi cập nhật học liệu');
    }
}

// Create user
async function createUser() {
    const form = document.getElementById('createUserForm');
    const formData = new FormData(form);
    
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            showSuccess('Tạo người dùng thành công');
            closeModal('createUserModal');
            await loadUsers();
        } else {
            const data = await response.json();
            showError(data.detail || 'Không thể tạo người dùng');
        }
    } catch (error) {
        console.error('Error creating user:', error);
        showError('Đã xảy ra lỗi');
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showSuccess(message) {
    alert(message);
}

function showError(message) {
    alert(message);
}

function showInfo(message) {
    alert(message);
}
