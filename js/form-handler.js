// form-handler.js - 전체 새 코드
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyXbYzkSN2vcGlmeaCFO51b4rQcibczGCnTiCrPbajM1dnPaPu-4gTzbZhdKxn2wq-X6w/exec';

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
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 전송 중...';
    
    try {
      // 폼 데이터 수집 및 정리
      const formData = new FormData(form);
      const data = this.processFormData(formData);
      
      // Google Sheets에 전송
      await this.sendToGoogleSheets(data);
      
      // 성공 처리
      this.showSuccess(form);
      
    } catch (error) {
      console.error('❌ 폼 제출 실패:', error);
      this.showError('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  processFormData(formData) {
    const data = {};
    
    // 텍스트 필드
    data.name = formData.get('name') || '';
    data.email = formData.get('email') || '';
    data.phone = formData.get('phone') || '';
    data.company = formData.get('company') || '';
    data.industry = formData.get('industry') || '';
    data.references = formData.get('references') || '';
    data.budget = formData.get('budget') || '';
    data['project-desc'] = formData.get('project-desc') || '';
    
    // 체크박스 그룹 (복수 선택)
    data['website-type'] = Array.from(formData.getAll('website-type')).join(', ');
    data['design-style'] = Array.from(formData.getAll('design-style')).join(', ');
    data.features = Array.from(formData.getAll('features')).join(', ');
    
    // 라디오 버튼
    const pageCount = document.querySelector('input[name="page-count"]:checked');
    data['page-count'] = pageCount ? pageCount.value : '';
    
    const timeline = document.querySelector('input[name="timeline"]:checked');
    data.timeline = timeline ? timeline.value : '';
    
    // 체크박스 (동의)
    data.privacyAgree = document.getElementById('privacyAgree').checked ? 'true' : 'false';
    data.marketingConsent = document.getElementById('marketingConsent').checked ? 'true' : 'false';
    
    // 메타데이터
    data.timestamp = new Date().toISOString();
    data.pageUrl = window.location.href;
    data.userAgent = navigator.userAgent;
    
    console.log('📋 처리된 데이터:', data);
    return data;
  }

  async sendToGoogleSheets(data) {
    console.log('📤 Google Sheets로 전송:', data);
    
    // URL 인코딩된 데이터로 변환
    const params = new URLSearchParams();
    for (const key in data) {
      if (data[key] !== null && data[key] !== undefined) {
        params.append(key, data[key].toString());
      }
    }
    
    console.log('📦 전송 파라미터:', params.toString());
    
    try {
      // POST 요청 (no-cors 모드)
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });
      
      console.log('✅ Google Sheets 전송 완료');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Google Sheets 전송 실패:', error);
      throw error;
    }
  }

  showSuccess(form) {
    console.log('✅ 폼 제출 성공');
    
    // 폼 숨기기
    form.style.display = 'none';
    
    // 성공 메시지 표시
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
      successMessage.style.display = 'block';
    } else {
      // 성공 메시지가 없으면 생성
      const messageDiv = document.createElement('div');
      messageDiv.innerHTML = `
        <div style="text-align: center; padding: 40px; background: #4CAF50; color: white; border-radius: 10px; margin-top: 20px;">
          <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 20px;"></i>
          <h3>견적 요청이 완료되었습니다!</h3>
          <p>24시간 이내에 연락드리겠습니다.</p>
        </div>
      `;
      form.parentNode.appendChild(messageDiv);
    }
    
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showError(message) {
    console.error('❌ 에러 발생:', message);
    
    // 기존 에러 메시지 제거
    const existingErrors = document.querySelectorAll('.form-error');
    existingErrors.forEach(error => error.remove());
    
    // 새 에러 메시지 생성
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.innerHTML = `
      <div style="background: #ffebee; color: #c62828; padding: 15px; border-radius: 8px; border-left: 4px solid #f44336; margin: 20px 0;">
        <i class="fas fa-exclamation-circle"></i> ${message}
      </div>
    `;
    
    // 폼 상단에 추가
    const form = document.getElementById('estimateForm');
    form.parentNode.insertBefore(errorDiv, form);
    
    // 5초 후 제거
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }
}

// 폼 핸들러 초기화
document.addEventListener('DOMContentLoaded', () => {
  new FormHandler();
});
