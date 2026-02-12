// Dashboard data
let dashboardData = null;
let departmentChart = null;
let uploadersChart = null;

// Load dashboard data on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadDashboardData();
});

// Fetch dashboard statistics
async function loadDashboardData() {
    try {
        const response = await fetch('/api/dashboard/stats');
        
        if (!response.ok) {
            throw new Error('Failed to load dashboard data');
        }
        
        dashboardData = await response.json();
        console.log('[Dashboard] Data loaded:', dashboardData);
        
        // Update summary cards
        updateSummaryCards();
        
        // Render charts
        renderDepartmentChart();
        renderUploadersChart();
        
        // Render recent uploads table
        renderRecentUploads();
        
    } catch (error) {
        console.error('[Dashboard] Error loading data:', error);
        alert('Lỗi khi tải dữ liệu dashboard: ' + error.message);
    }
}

// Update summary statistics cards
function updateSummaryCards() {
    document.getElementById('totalMaterials').textContent = dashboardData.total_materials;
    document.getElementById('totalUsers').textContent = dashboardData.total_users;
    document.getElementById('totalDepartments').textContent = dashboardData.total_departments;
    document.getElementById('materialsToday').textContent = dashboardData.materials_today;
    document.getElementById('materialsWeek').textContent = dashboardData.materials_this_week;
    document.getElementById('materialsMonth').textContent = dashboardData.materials_this_month;
}

// Render department materials chart (Bar Chart)
function renderDepartmentChart() {
    const ctx = document.getElementById('departmentChart').getContext('2d');
    
    // Destroy previous chart if exists
    if (departmentChart) {
        departmentChart.destroy();
    }
    
    // Prepare data
    const labels = dashboardData.departments_data.map(d => d.department);
    const data = dashboardData.departments_data.map(d => d.count);
    
    // Generate colors
    const colors = generateColors(labels.length);
    
    departmentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số lượng học liệu',
                data: data,
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Số lượng: ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// Render top uploaders chart (Horizontal Bar Chart)
function renderUploadersChart() {
    const ctx = document.getElementById('uploadersChart').getContext('2d');
    
    // Destroy previous chart if exists
    if (uploadersChart) {
        uploadersChart.destroy();
    }
    
    // Prepare data
    const labels = dashboardData.top_uploaders.map(u => u.username);
    const data = dashboardData.top_uploaders.map(u => u.count);
    
    // Colors for top uploaders
    const colors = [
        { bg: 'rgba(255, 215, 0, 0.6)', border: 'rgb(255, 215, 0)' },    // Gold
        { bg: 'rgba(192, 192, 192, 0.6)', border: 'rgb(192, 192, 192)' }, // Silver
        { bg: 'rgba(205, 127, 50, 0.6)', border: 'rgb(205, 127, 50)' },  // Bronze
        { bg: 'rgba(52, 152, 219, 0.6)', border: 'rgb(52, 152, 219)' },
        { bg: 'rgba(155, 89, 182, 0.6)', border: 'rgb(155, 89, 182)' }
    ];
    
    const backgroundColors = data.map((_, idx) => colors[idx]?.bg || 'rgba(149, 165, 166, 0.6)');
    const borderColors = data.map((_, idx) => colors[idx]?.border || 'rgb(149, 165, 166)');
    
    uploadersChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số học liệu đã đăng',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Đã đăng: ' + context.parsed.x + ' học liệu';
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Render recent uploads table
function renderRecentUploads() {
    const tbody = document.getElementById('recentUploadsBody');
    
    if (!dashboardData.recent_uploads || dashboardData.recent_uploads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Chưa có học liệu nào</td></tr>';
        return;
    }
    
    let html = '';
    
    dashboardData.recent_uploads.forEach(material => {
        const createdDate = new Date(material.created_at);
        const formattedDate = createdDate.toLocaleDateString('vi-VN') + ' ' + 
                            createdDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        
        html += `
            <tr>
                <td>${escapeHtml(material.title)}</td>
                <td>${escapeHtml(material.subject)}</td>
                <td>${escapeHtml(material.uploader)}</td>
                <td>${escapeHtml(material.department)}</td>
                <td>${formattedDate}</td>
                <td>
                    <a href="/detail?id=${material.id}" class="btn-view" style="text-decoration: none;">
                        👁️ Xem
                    </a>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Generate colors for charts
function generateColors(count) {
    const baseColors = [
        { bg: 'rgba(52, 152, 219, 0.6)', border: 'rgb(52, 152, 219)' },
        { bg: 'rgba(46, 204, 113, 0.6)', border: 'rgb(46, 204, 113)' },
        { bg: 'rgba(155, 89, 182, 0.6)', border: 'rgb(155, 89, 182)' },
        { bg: 'rgba(241, 196, 15, 0.6)', border: 'rgb(241, 196, 15)' },
        { bg: 'rgba(230, 126, 34, 0.6)', border: 'rgb(230, 126, 34)' },
        { bg: 'rgba(231, 76, 60, 0.6)', border: 'rgb(231, 76, 60)' },
        { bg: 'rgba(26, 188, 156, 0.6)', border: 'rgb(26, 188, 156)' },
        { bg: 'rgba(52, 73, 94, 0.6)', border: 'rgb(52, 73, 94)' },
        { bg: 'rgba(149, 165, 166, 0.6)', border: 'rgb(149, 165, 166)' },
        { bg: 'rgba(44, 62, 80, 0.6)', border: 'rgb(44, 62, 80)' },
        { bg: 'rgba(22, 160, 133, 0.6)', border: 'rgb(22, 160, 133)' },
        { bg: 'rgba(39, 174, 96, 0.6)', border: 'rgb(39, 174, 96)' },
        { bg: 'rgba(41, 128, 185, 0.6)', border: 'rgb(41, 128, 185)' },
        { bg: 'rgba(142, 68, 173, 0.6)', border: 'rgb(142, 68, 173)' }
    ];
    
    const background = [];
    const border = [];
    
    for (let i = 0; i < count; i++) {
        const colorIndex = i % baseColors.length;
        background.push(baseColors[colorIndex].bg);
        border.push(baseColors[colorIndex].border);
    }
    
    return { background, border };
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
