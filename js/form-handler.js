// form-handler.js - Google Sheets 연동

class FormHandler {
  constructor() {
    this.forms = document.querySelectorAll('form');
    this.init();
  }

  init() {
    this.forms.forEach(form => {
      form.addEventListener('submit', this.handleSubmit.bind(this));
    });

    // 파일 업로드 드래그 앤 드롭
    this.initFileUpload();
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // 버튼 상태 변경
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 처리 중...';
    
    try {
      // 폼 데이터 수집
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      // 추가 메타데이터
      data.timestamp = new Date().toISOString();
      data.pageUrl = window.location.href;
      data.userAgent = navigator.userAgent;
      
      // 파일 업로드 처리
      const files = form.querySelector('input[type="file"]')?.files;
      if (files && files.length > 0) {
        data.hasAttachments = true;
        data.attachmentCount = files.length;
        // 실제 파일 업로드는 별도 API 필요
      }
      
      // Google Sheets에 전송
      const response = await this.sendToGoogleSheets(data);
      
      // 성공 처리
      this.showSuccess(form);
      
      // 이메일 자동 응답 (옵션)
      if (data.email) {
        this.sendAutoReply(data);
      }
      
    } catch (error) {
      console.error('폼 제출 실패:', error);
      this.showError(form, '제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  async sendToGoogleSheets(data) {
    // Google Apps Script URL (실제 배포 후 변경)
    const scriptUrl = GOOGLE_SCRIPT_URL || 'YOUR_GOOGLE_SCRIPT_URL';
    
    const response = await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors', // CORS 이슈 방지
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    return response;
  }

  showSuccess(form) {
    const successElement = document.getElementById('formSuccess') || 
                          form.nextElementSibling;
    
    if (successElement && successElement.classList.contains('success-message')) {
      form.style.display = 'none';
      successElement.style.display = 'block';
      
      // 10초 후 폼 리셋
      setTimeout(() => {
        form.reset();
        form.style.display = 'block';
        successElement.style.display = 'none';
      }, 10000);
    } else {
      alert('요청이 성공적으로 전송되었습니다! 24시간 이내에 연락드리겠습니다.');
      form.reset();
    }
  }

  showError(form, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      ${message}
    `;
    
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  sendAutoReply(data) {
    // 이메일 자동 응답 로직 (Google Apps Script에서 처리 권장)
    console.log('자동 응답 이메일 발송:', data.email);
  }

  initFileUpload() {
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.querySelector('input[type="file"]');
    const fileList = document.getElementById('fileList');
    
    if (!dropArea || !fileInput) return;
    
    // 드래그 앤 드롭 이벤트
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // 드래그 오버 시 하이라이트
    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => {
        dropArea.style.borderColor = '#00D4FF';
        dropArea.style.background = 'rgba(0, 212, 255, 0.1)';
      }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => {
        dropArea.style.borderColor = '';
        dropArea.style.background = '';
      }, false);
    });
    
    // 파일 드롭 처리
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
      const dt = e.dataTransfer;
      const files = dt.files;
      fileInput.files = files;
      updateFileList(files);
    }
    
    // 파일 선택 처리
    fileInput.addEventListener('change', function() {
      updateFileList(this.files);
    });
    
    function updateFileList(files) {
      if (!fileList) return;
      
      fileList.innerHTML = '';
      
      if (files.length === 0) return;
      
      const list = document.createElement('ul');
      list.className = 'file-list';
      
      Array.from(files).forEach((file, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
          <i class="fas fa-file"></i>
          <span>${file.name}</span>
          <span class="file-size">(${formatFileSize(file.size)})</span>
          <button type="button" class="remove-file" data-index="${index}">
            <i class="fas fa-times"></i>
          </button>
        `;
        list.appendChild(listItem);
      });
      
      fileList.appendChild(list);
      
      // 파일 삭제 버튼
      fileList.querySelectorAll('.remove-file').forEach(button => {
        button.addEventListener('click', function() {
          const index = parseInt(this.dataset.index);
          removeFile(index);
        });
      });
    }
    
    function removeFile(index) {
      const dt = new DataTransfer();
      const files = Array.from(fileInput.files);
      files.splice(index, 1);
      
      files.forEach(file => dt.items.add(file));
      fileInput.files = dt.files;
      updateFileList(dt.files);
    }
    
    function formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  }
}

// 폼 핸들러 초기화
document.addEventListener('DOMContentLoaded', () => {
  new FormHandler();
});
