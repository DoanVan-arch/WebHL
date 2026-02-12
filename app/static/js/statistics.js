// Statistics data
let currentView = 'overall';
let overallData = null;
let departmentData = null;

// Charts
let deptComparisonChart = null;
let growthTrendChart = null;
let overallFileTypesChart = null;
let overallTopUploadersChart = null;
let deptFileTypesChart = null;
let deptMonthlyChart = null;
let deptTopUploadersChart = null;

// Load overall statistics on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadOverallStats();
});

// Switch between views
function switchView(view) {
    currentView = view;
    
    const overallView = document.getElementById('overallView');
    const departmentView = document.getElementById('departmentView');
    const overallBtn = document.getElementById('overallViewBtn');
    const deptBtn = document.getElementById('deptViewBtn');
    
    if (view === 'overall') {
        overallView.style.display = 'block';
        departmentView.style.display = 'none';
        overallBtn.classList.add('active');
        deptBtn.classList.remove('active');
        
        if (!overallData) {
            loadOverallStats();
        }
    } else {
        overallView.style.display = 'none';
        departmentView.style.display = 'block';
        overallBtn.classList.remove('active');
        deptBtn.classList.add('active');
    }
}

// Load overall statistics
async function loadOverallStats() {
    try {
        const response = await fetch('/api/statistics/overall');
        
        if (!response.ok) {
            throw new Error('Failed to load overall statistics');
        }
        
        overallData = await response.json();
        console.log('[Statistics] Overall data loaded:', overallData);
        
        // Update summary
        document.getElementById('overallTotalMaterials').textContent = overallData.total_materials;
        
        // Render charts
        renderDeptComparisonChart();
        renderGrowthTrendChart();
        renderOverallFileTypesChart();
        renderOverallTopUploadersChart();
        
    } catch (error) {
        console.error('[Statistics] Error loading overall stats:', error);
        alert('Lỗi khi tải thống kê tổng quan: ' + error.message);
    }
}

// Load department statistics
async function loadDepartmentStats() {
    const deptSelector = document.getElementById('deptSelector');
    const deptId = deptSelector.value;
    
    if (!deptId) {
        document.getElementById('deptStatsContent').style.display = 'none';
        document.getElementById('deptNoData').style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch(`/api/statistics/department/${deptId}`);
        
        if (!response.ok) {
            throw new Error('Failed to load department statistics');
        }
        
        departmentData = await response.json();
        console.log('[Statistics] Department data loaded:', departmentData);
        
        if (departmentData.error) {
            alert(departmentData.error);
            return;
        }
        
        // Show content
        document.getElementById('deptStatsContent').style.display = 'block';
        document.getElementById('deptNoData').style.display = 'none';
        
        // Update summary
        document.getElementById('deptName').textContent = departmentData.department_code;
        document.getElementById('deptTotalMaterials').textContent = departmentData.total_materials;
        
        // Render charts
        renderDeptFileTypesChart();
        renderDeptMonthlyChart();
        renderDeptTopUploadersChart();
        
    } catch (error) {
        console.error('[Statistics] Error loading department stats:', error);
        alert('Lỗi khi tải thống kê khoa: ' + error.message);
    }
}

// Render department comparison chart
function renderDeptComparisonChart() {
    const ctx = document.getElementById('deptComparisonChart').getContext('2d');
    
    if (deptComparisonChart) {
        deptComparisonChart.destroy();
    }
    
    const labels = overallData.dept_comparison.map(d => d.code);
    const data = overallData.dept_comparison.map(d => d.count);
    const colors = generateColors(labels.length);
    
    deptComparisonChart = new Chart(ctx, {
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
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const index = context[0].dataIndex;
                            return overallData.dept_comparison[index].name;
                        },
                        label: function(context) {
                            return 'Số lượng: ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Render growth trend chart
function renderGrowthTrendChart() {
    const ctx = document.getElementById('growthTrendChart').getContext('2d');
    
    if (growthTrendChart) {
        growthTrendChart.destroy();
    }
    
    growthTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: overallData.growth_labels,
            datasets: [{
                label: 'Số học liệu mới',
                data: overallData.growth_counts,
                borderColor: 'rgb(52, 152, 219)',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true },
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
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// Render overall file types chart
function renderOverallFileTypesChart() {
    const ctx = document.getElementById('overallFileTypesChart').getContext('2d');
    
    if (overallFileTypesChart) {
        overallFileTypesChart.destroy();
    }
    
    const labels = Object.keys(overallData.overall_file_types);
    const data = Object.values(overallData.overall_file_types);
    
    overallFileTypesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(241, 196, 15, 0.8)'
                ],
                borderColor: [
                    'rgb(52, 152, 219)',
                    'rgb(46, 204, 113)',
                    'rgb(155, 89, 182)',
                    'rgb(241, 196, 15)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Render overall top uploaders chart
function renderOverallTopUploadersChart() {
    const ctx = document.getElementById('overallTopUploadersChart').getContext('2d');
    
    if (overallTopUploadersChart) {
        overallTopUploadersChart.destroy();
    }
    
    const labels = overallData.top_uploaders.map(u => u.username);
    const data = overallData.top_uploaders.map(u => u.count);
    
    const colors = [
        { bg: 'rgba(255, 215, 0, 0.6)', border: 'rgb(255, 215, 0)' },
        { bg: 'rgba(192, 192, 192, 0.6)', border: 'rgb(192, 192, 192)' },
        { bg: 'rgba(205, 127, 50, 0.6)', border: 'rgb(205, 127, 50)' },
        { bg: 'rgba(52, 152, 219, 0.6)', border: 'rgb(52, 152, 219)' },
        { bg: 'rgba(155, 89, 182, 0.6)', border: 'rgb(155, 89, 182)' },
        { bg: 'rgba(46, 204, 113, 0.6)', border: 'rgb(46, 204, 113)' },
        { bg: 'rgba(241, 196, 15, 0.6)', border: 'rgb(241, 196, 15)' },
        { bg: 'rgba(230, 126, 34, 0.6)', border: 'rgb(230, 126, 34)' },
        { bg: 'rgba(231, 76, 60, 0.6)', border: 'rgb(231, 76, 60)' },
        { bg: 'rgba(149, 165, 166, 0.6)', border: 'rgb(149, 165, 166)' }
    ];
    
    const backgroundColors = data.map((_, idx) => colors[idx]?.bg || 'rgba(149, 165, 166, 0.6)');
    const borderColors = data.map((_, idx) => colors[idx]?.border || 'rgb(149, 165, 166)');
    
    overallTopUploadersChart = new Chart(ctx, {
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
                legend: { display: false },
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
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// Render department file types chart
function renderDeptFileTypesChart() {
    const ctx = document.getElementById('deptFileTypesChart').getContext('2d');
    
    if (deptFileTypesChart) {
        deptFileTypesChart.destroy();
    }
    
    const labels = Object.keys(departmentData.file_type_counts);
    const data = Object.values(departmentData.file_type_counts);
    
    deptFileTypesChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(241, 196, 15, 0.8)'
                ],
                borderColor: [
                    'rgb(52, 152, 219)',
                    'rgb(46, 204, 113)',
                    'rgb(155, 89, 182)',
                    'rgb(241, 196, 15)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Render department monthly chart
function renderDeptMonthlyChart() {
    const ctx = document.getElementById('deptMonthlyChart').getContext('2d');
    
    if (deptMonthlyChart) {
        deptMonthlyChart.destroy();
    }
    
    deptMonthlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: departmentData.month_labels,
            datasets: [{
                label: 'Số học liệu',
                data: departmentData.month_counts,
                borderColor: 'rgb(155, 89, 182)',
                backgroundColor: 'rgba(155, 89, 182, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true },
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
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// Render department top uploaders chart
function renderDeptTopUploadersChart() {
    const ctx = document.getElementById('deptTopUploadersChart').getContext('2d');
    
    if (deptTopUploadersChart) {
        deptTopUploadersChart.destroy();
    }
    
    const labels = departmentData.top_uploaders.map(u => u.username);
    const data = departmentData.top_uploaders.map(u => u.count);
    
    const colors = [
        { bg: 'rgba(255, 215, 0, 0.6)', border: 'rgb(255, 215, 0)' },
        { bg: 'rgba(192, 192, 192, 0.6)', border: 'rgb(192, 192, 192)' },
        { bg: 'rgba(205, 127, 50, 0.6)', border: 'rgb(205, 127, 50)' },
        { bg: 'rgba(52, 152, 219, 0.6)', border: 'rgb(52, 152, 219)' },
        { bg: 'rgba(155, 89, 182, 0.6)', border: 'rgb(155, 89, 182)' }
    ];
    
    const backgroundColors = data.map((_, idx) => colors[idx]?.bg || 'rgba(149, 165, 166, 0.6)');
    const borderColors = data.map((_, idx) => colors[idx]?.border || 'rgb(149, 165, 166)');
    
    deptTopUploadersChart = new Chart(ctx, {
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
                legend: { display: false },
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
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
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
