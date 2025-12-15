// form-handler.js - Google Sheets 연동 (제공된 URL로 미리 설정됨)

// 🔥 중요: Google Apps Script 배포 URL (제공된 URL)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxaqrNwqBnzdXO0QsVFSDmAJz-Ul_k-0s_6w3a_Fd5UXtPsdUntZBGdH3fIRgO_B7jYNA/exec';

class FormHandler {
  constructor() {
    this.form = document.getElementById('estimateForm');
    if (!this.form) return;
    
    this.init();
  }

  init() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // 버튼 상태 변경
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 전송 중...';
    
    try {
      // 폼 데이터 수집
      const formData = new FormData(form);
      const data = this.processFormData(formData);
      
      // Google Sheets에 전송
      const response = await this.sendToGoogleSheets(data);
      
      // 성공 처리
      this.showSuccess(form);
      
      // 디버깅용 콘솔 출력
      console.log('✅ 폼 전송 성공:', data);
      
    } catch (error) {
      console.error('❌ 폼 제출 실패:', error);
      this.showError(form, '제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  processFormData(formData) {
    const data = Object.fromEntries(formData.entries());
    
    // 체크박스/라디오 값 처리
    data['website-type'] = Array.from(formData.getAll('website-type')).join(', ');
    data['design-style'] = Array.from(formData.getAll('design-style')).join(', ');
    data['features'] = Array.from(formData.getAll('features')).join(', ');
    
    // 추가 메타데이터
    data.timestamp = new Date().toISOString();
    data.pageUrl = window.location.href;
    data.userAgent = navigator.userAgent;
    data.formType = 'estimate-request';
    
    return data;
  }

  async sendToGoogleSheets(data) {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
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
    const successElement = document.getElementById('formSuccess');
    if (successElement) {
      form.style.display = 'none';
      successElement.style.display = 'block';
    } else {
      alert('견적 요청이 완료되었습니다! 24시간 이내에 연락드리겠습니다.');
      form.reset();
    }
  }

  showError(form, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
      background: #f8d7da;
      color: #721c24;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
      text-align: center;
    `;
    errorDiv.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      ${message}
    `;
    
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
}

// 폼 핸들러 초기화
document.addEventListener('DOMContentLoaded', () => {
  new FormHandler();
});
