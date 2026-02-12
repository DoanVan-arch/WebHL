// detail.js - Material detail page functionality
let currentMaterial = null;
let currentPDF = null;
let currentPage = 1;
let totalPages = 0;
const MAX_PREVIEW_PAGES = 5;

// Get material ID from URL
function getMaterialIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load material details
async function loadMaterialDetail() {
    const materialId = getMaterialIdFromURL();
    if (!materialId) {
        showError('Không tìm thấy ID học liệu');
        return;
    }

    try {
        const response = await fetch(`/api/materials/${materialId}`);
        if (!response.ok) {
            throw new Error('Không thể tải thông tin học liệu');
        }

        currentMaterial = await response.json();
        renderMaterialInfo();
    } catch (error) {
        console.error('Error loading material:', error);
        showError('Lỗi khi tải thông tin học liệu');
    }
}

// Render material information
function renderMaterialInfo() {
    if (!currentMaterial) return;

    // Set title
    document.getElementById('materialTitle').textContent = currentMaterial.title;
    document.getElementById('materialSubject').textContent = currentMaterial.subject;
    document.getElementById('materialTopic').textContent = currentMaterial.topic;
    document.getElementById('materialDepartment').textContent = currentMaterial.department?.name || 'N/A';
    document.getElementById('materialUploader').textContent = currentMaterial.uploader?.full_name || 'N/A';
    
    const uploadDate = new Date(currentMaterial.created_at);
    document.getElementById('materialDate').textContent = uploadDate.toLocaleDateString('vi-VN');

    // Render files list
    renderFilesList();

    // Check if user can delete (admin or owner)
    checkDeletePermission();
}

// Render files list
function renderFilesList() {
    const filesList = document.getElementById('filesList');
    if (!currentMaterial.files || currentMaterial.files.length === 0) {
        filesList.innerHTML = '<p class="no-files">Không có tệp đính kèm</p>';
        return;
    }

    filesList.innerHTML = currentMaterial.files.map((file, index) => `
        <div class="file-item">
            <div class="file-info">
                <span class="file-type-badge ${getFileTypeClass(file.type)}">${file.type}</span>
                <span class="file-name">${file.name}</span>
            </div>
            <div class="file-actions">
                ${canPreview(file.name) ? `
                    <button class="btn-preview" onclick="previewFile(${index}, '${file.path}', '${file.name}')">
                        <i class="fas fa-eye"></i> Xem trước
                    </button>
                ` : ''}
                <button class="btn-download" onclick="downloadFile('${file.path}', '${file.name}')">
                    <i class="fas fa-download"></i> Tải xuống
                </button>
            </div>
        </div>
    `).join('');
}

// Get file type class for badge styling
function getFileTypeClass(type) {
    const typeMap = {
        'Tài liệu': 'type-document',
        'Bài giảng': 'type-lecture',
        'Đề cương': 'type-syllabus',
        'Trình chiếu': 'type-presentation'
    };
    return typeMap[type] || 'type-document';
}

// Check if file is PDF
function isPDF(filename) {
    return filename.toLowerCase().endsWith('.pdf');
}

// Check if file is DOCX
function isDOCX(filename) {
    return filename.toLowerCase().endsWith('.docx');
}

// Check if file is PPTX
function isPPTX(filename) {
    return filename.toLowerCase().endsWith('.pptx');
}

// Check if file can be previewed
function canPreview(filename) {
    return isPDF(filename) || isDOCX(filename) || isPPTX(filename);
}

// Preview file dispatcher
async function previewFile(fileIndex, filePath, fileName) {
    if (isPDF(fileName)) {
        await previewPDF(filePath, fileName);
    } else if (isDOCX(fileName)) {
        await previewDOCX(fileIndex, fileName);
    } else if (isPPTX(fileName)) {
        await previewPPTX(fileIndex, fileName);
    }
}

// Preview PDF file (first 5 pages only)
async function previewPDF(filePath, fileName) {
    const previewOverlay = document.getElementById('previewOverlay');
    const pdfViewer = document.getElementById('pdfViewer');
    const previewFileName = document.getElementById('previewFileName');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    previewOverlay.style.display = 'flex';
    previewFileName.textContent = fileName;
    loadingIndicator.style.display = 'block';
    pdfViewer.innerHTML = '';
    pageInfo.textContent = '';
    
    // Show navigation buttons
    prevBtn.style.display = 'inline-block';
    nextBtn.style.display = 'inline-block';
    
    // Set PDF navigation handlers
    prevBtn.onclick = previousPage;
    nextBtn.onclick = nextPage;

    try {
        // Load PDF using PDF.js
        const loadingTask = pdfjsLib.getDocument(filePath);
        currentPDF = await loadingTask.promise;
        totalPages = Math.min(currentPDF.numPages, MAX_PREVIEW_PAGES);
        currentPage = 1;

        loadingIndicator.style.display = 'none';
        await renderPDFPage(currentPage);
        updatePageInfo();
        updateNavigationButtons();
    } catch (error) {
        console.error('Error loading PDF:', error);
        loadingIndicator.style.display = 'none';
        pdfViewer.innerHTML = '<p class="error-message">Lỗi khi tải PDF. Vui lòng thử tải xuống tệp.</p>';
    }
}

// Render specific PDF page
async function renderPDFPage(pageNum) {
    if (!currentPDF) return;

    const pdfViewer = document.getElementById('pdfViewer');
    pdfViewer.innerHTML = '';

    try {
        const page = await currentPDF.getPage(pageNum);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        await page.render(renderContext).promise;
        pdfViewer.appendChild(canvas);
    } catch (error) {
        console.error('Error rendering PDF page:', error);
        pdfViewer.innerHTML = '<p class="error-message">Lỗi khi hiển thị trang PDF</p>';
    }
}

// Navigate to previous page
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderPDFPage(currentPage);
        updatePageInfo();
        updateNavigationButtons();
    }
}

// Navigate to next page
function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        renderPDFPage(currentPage);
        updatePageInfo();
        updateNavigationButtons();
    }
}

// Update page info display
function updatePageInfo() {
    const pageInfo = document.getElementById('pageInfo');
    const totalPDFPages = currentPDF ? currentPDF.numPages : 0;
    
    if (totalPDFPages > MAX_PREVIEW_PAGES) {
        pageInfo.textContent = `Trang ${currentPage}/${totalPages} (Xem trước ${MAX_PREVIEW_PAGES}/${totalPDFPages} trang)`;
    } else {
        pageInfo.textContent = `Trang ${currentPage}/${totalPages}`;
    }
}

// Update navigation button states
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
}

// Close preview
function closePreview() {
    const previewOverlay = document.getElementById('previewOverlay');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    previewOverlay.style.display = 'none';
    currentPDF = null;
    currentPage = 1;
    totalPages = 0;
    
    // Reset navigation handlers
    prevBtn.onclick = null;
    nextBtn.onclick = null;
    prevBtn.style.display = 'inline-block';
    nextBtn.style.display = 'inline-block';
}

// Preview DOCX file
async function previewDOCX(fileIndex, fileName) {
    const previewOverlay = document.getElementById('previewOverlay');
    const pdfViewer = document.getElementById('pdfViewer');
    const previewFileName = document.getElementById('previewFileName');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    previewOverlay.style.display = 'flex';
    previewFileName.textContent = fileName;
    loadingIndicator.style.display = 'block';
    pdfViewer.innerHTML = '';
    pageInfo.textContent = '';
    
    // Hide navigation buttons for DOCX (single page view)
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    
    // Reset navigation handlers
    prevBtn.onclick = null;
    nextBtn.onclick = null;

    try {
        const materialId = getMaterialIdFromURL();
        console.log(`[DOCX Preview] Material ID: ${materialId}, File Index: ${fileIndex}`);
        
        const response = await fetch(`/api/preview/${materialId}/${fileIndex}`);
        console.log(`[DOCX Preview] Response status: ${response.status}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            console.error('[DOCX Preview] Error response:', errorData);
            throw new Error(errorData.detail || 'Không thể tải file preview');
        }

        const data = await response.json();
        console.log('[DOCX Preview] Data received:', data);
        loadingIndicator.style.display = 'none';

        if (!data.paragraphs || data.paragraphs.length === 0) {
            pdfViewer.innerHTML = '<p class="error-message">File DOCX không có nội dung hoặc rỗng.</p>';
            return;
        }

        // Render DOCX content
        let html = '<div class="docx-preview">';
        html += '<div style="background: white; padding: 40px; max-width: 800px; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px;">';
        
        data.paragraphs.forEach(para => {
            if (para.text.trim()) {
                const fontSize = para.style.includes('Heading') ? '18px' : '14px';
                const fontWeight = para.style.includes('Heading') ? 'bold' : 'normal';
                const margin = para.style.includes('Heading') ? '20px 0 10px 0' : '5px 0';
                
                html += `<p style="font-size: ${fontSize}; font-weight: ${fontWeight}; margin: ${margin}; line-height: 1.6; color: #333;">${escapeHtml(para.text)}</p>`;
            }
        });
        
        html += '</div></div>';
        pdfViewer.innerHTML = html;
        
        pageInfo.textContent = `Xem trước ${data.preview_paragraphs} / ${data.total_paragraphs} đoạn văn (≈${data.estimated_pages} trang)`;
    } catch (error) {
        console.error('[DOCX Preview] Error loading DOCX:', error);
        loadingIndicator.style.display = 'none';
        pdfViewer.innerHTML = `<p class="error-message">Lỗi khi tải file DOCX: ${error.message}<br>Vui lòng thử tải xuống tệp hoặc kiểm tra console để biết chi tiết.</p>`;
    }
}

// Preview PPTX file
async function previewPPTX(fileIndex, fileName) {
    const previewOverlay = document.getElementById('previewOverlay');
    const pdfViewer = document.getElementById('pdfViewer');
    const previewFileName = document.getElementById('previewFileName');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    previewOverlay.style.display = 'flex';
    previewFileName.textContent = fileName;
    loadingIndicator.style.display = 'block';
    pdfViewer.innerHTML = '';
    pageInfo.textContent = '';

    try {
        const materialId = getMaterialIdFromURL();
        console.log(`[PPTX Preview] Material ID: ${materialId}, File Index: ${fileIndex}`);
        
        const response = await fetch(`/api/preview/${materialId}/${fileIndex}`);
        console.log(`[PPTX Preview] Response status: ${response.status}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            console.error('[PPTX Preview] Error response:', errorData);
            throw new Error(errorData.detail || 'Không thể tải file preview');
        }

        const data = await response.json();
        console.log('[PPTX Preview] Data received:', data);
        loadingIndicator.style.display = 'none';

        if (!data.slides || data.slides.length === 0) {
            pdfViewer.innerHTML = '<p class="error-message">File PPTX không có nội dung hoặc rỗng.</p>';
            return;
        }

        // Render PPTX slides
        let currentSlideIndex = 0;
        
        function renderSlide(index) {
            const slide = data.slides[index];
            let html = '<div class="pptx-preview">';
            html += `<div class="pptx-slide" style="background: white; padding: 60px; max-width: 900px; margin: 0 auto; min-height: 500px; box-shadow: 0 2px 12px rgba(0,0,0,0.15); border-radius: 8px;">`;
            html += `<div style="text-align: center; margin-bottom: 30px; font-size: 24px; font-weight: bold; color: #2c3e50;">Slide ${slide.slide_number}</div>`;
            
            if (slide.content && slide.content.length > 0) {
                slide.content.forEach(item => {
                    html += `<div style="margin: 15px 0; font-size: 16px; line-height: 1.8; color: #333;">${escapeHtml(item.text)}</div>`;
                });
            } else {
                html += `<div style="text-align: center; color: #999; font-style: italic;">Slide không có nội dung văn bản</div>`;
            }
            
            html += '</div></div>';
            pdfViewer.innerHTML = html;
            
            pageInfo.textContent = `Slide ${index + 1}/${data.preview_slides} (Xem trước ${data.preview_slides}/${data.total_slides} slides)`;
            
            // Update navigation buttons
            prevBtn.disabled = index === 0;
            nextBtn.disabled = index === data.slides.length - 1;
            prevBtn.style.display = 'inline-block';
            nextBtn.style.display = 'inline-block';
        }
        
        // Set navigation handlers for slides
        prevBtn.onclick = () => {
            if (currentSlideIndex > 0) {
                currentSlideIndex--;
                renderSlide(currentSlideIndex);
            }
        };
        
        nextBtn.onclick = () => {
            if (currentSlideIndex < data.slides.length - 1) {
                currentSlideIndex++;
                renderSlide(currentSlideIndex);
            }
        };
        
        renderSlide(currentSlideIndex);
        
    } catch (error) {
        console.error('[PPTX Preview] Error loading PPTX:', error);
        loadingIndicator.style.display = 'none';
        pdfViewer.innerHTML = `<p class="error-message">Lỗi khi tải file PPTX: ${error.message}<br>Vui lòng thử tải xuống tệp hoặc kiểm tra console để biết chi tiết.</p>`;
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Download file
function downloadFile(filePath, fileName) {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Check delete permission
function checkDeletePermission() {
    // User info is passed from template via global variables
    if (typeof currentUserRole !== 'undefined' && typeof currentUserId !== 'undefined') {
        // Show delete button if admin or owner
        if (currentUserRole === 'admin' || currentUserId === currentMaterial.uploader?.id) {
            document.getElementById('deleteMaterialBtn').style.display = 'inline-flex';
        }
    }
}

// Delete material
async function deleteMaterial() {
    if (!confirm('Bạn có chắc chắn muốn xóa học liệu này?')) {
        return;
    }

    const materialId = getMaterialIdFromURL();
    try {
        const response = await fetch(`/api/materials/${materialId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            alert('Đã xóa học liệu thành công');
            window.location.href = '/';
        } else {
            const error = await response.json();
            alert('Lỗi: ' + (error.detail || 'Không thể xóa học liệu'));
        }
    } catch (error) {
        console.error('Error deleting material:', error);
        alert('Lỗi khi xóa học liệu');
    }
}

// Go back to list
function goBack() {
    window.location.href = '/';
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-alert';
    errorDiv.textContent = message;
    document.body.insertBefore(errorDiv, document.body.firstChild);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    // Load material details
    loadMaterialDetail();

    // Close preview on overlay click (but not on content click)
    document.getElementById('previewOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'previewOverlay') {
            closePreview();
        }
    });
});
