// form-handler.js - Google Sheets 연동 (제공된 URL로 미리 설정됨)

// 🔥 중요: Google Apps Script 배포 URL 
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxaqrNwqBnzdXO0QsVFSDmAJz-Ul_k-0s_6w3a_Fd5UXtPsdUntZBGdH3fIRgO_B7jYNA/exec';

class FormHandler {
  constructor() {
    this.form = document.getElementById('estimateForm');
    if (!this.form) {
      console.warn('폼을 찾을 수 없습니다: #estimateForm');
      return;
    }
    
    this.init();
    this.setupFormValidation();
  }

  init() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    this.setupCheckboxRadioStyling();
    this.setupInputFocusEffects();
  }

  setupFormValidation() {
    const requiredFields = this.form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
    });
  }

  validateField(field) {
    if (!field.value.trim() && field.hasAttribute('required')) {
      field.style.borderColor = '#ff6b6b';
      field.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.1)';
      return false;
    }
    
    // 이메일 유효성 검사
    if (field.type === 'email' && field.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        field.style.borderColor = '#ff6b6b';
        field.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.1)';
        return false;
      }
    }
    
    field.style.borderColor = '#e9ecef';
    field.style.boxShadow = 'none';
    return true;
  }

  setupCheckboxRadioStyling() {
    document.querySelectorAll('.checkbox-label, .radio-label').forEach(label => {
      const input = label.querySelector('input');
      
      label.addEventListener('click', function(event) {
        if (event.target !== input) {
          if (input.type === 'radio') {
            // 같은 name의 라디오 버튼 해제
            const radioName = input.getAttribute('name');
            document.querySelectorAll(`input[name="${radioName}"]`).forEach(radio => {
              radio.checked = false;
              const radioLabel = radio.closest('.radio-label');
              if (radioLabel) {
                radioLabel.style.background = '#f8f9fa';
                radioLabel.style.borderColor = 'transparent';
              }
            });
          }
          
          input.checked = !input.checked;
          this.updateCheckboxRadioStyle(input);
        }
      });
      
      // 초기 스타일 설정
      this.updateCheckboxRadioStyle(input);
    });
  }

  updateCheckboxRadioStyle(input) {
    const label = input.closest('.checkbox-label, .radio-label');
    if (label) {
      if (input.checked) {
        label.style.background = '#edf2ff';
        label.style.borderColor = '#667eea';
        label.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.2)';
      } else {
        label.style.background = '#f8f9fa';
        label.style.borderColor = 'transparent';
        label.style.boxShadow = 'none';
      }
    }
  }

  setupInputFocusEffects() {
    document.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('focus', function() {
        this.style.borderColor = '#667eea';
        this.style.boxShadow = '0 0 0 5px rgba(102, 126, 234, 0.2)';
      });
      
      field.addEventListener('blur', function() {
        if (!this.value && this.hasAttribute('required')) {
          this.style.borderColor = '#ff6b6b';
          this.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.1)';
        } else {
          this.style.borderColor = '#e9ecef';
          this.style.boxShadow = 'none';
        }
      });
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    // 폼 유효성 검사
    if (!this.validateForm()) {
      this.showError('필수 항목을 모두 입력해주세요.');
      return;
    }
    
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
      await this.sendToGoogleSheets(data);
      
      // 성공 처리
      this.showSuccess(form);
      
      // 디버깅용 콘솔 출력
      console.log('✅ 폼 전송 성공:', data);
      
    } catch (error) {
      console.error('❌ 폼 제출 실패:', error);
      this.showError('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  validateForm() {
    const requiredFields = this.form.querySelectorAll('[required]');
    let isValid = true;
    
    for (const field of requiredFields) {
      if (!field.value || (field.type === 'checkbox' && !field.checked)) {
        isValid = false;
        field.style.borderColor = '#ff6b6b';
        field.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.1)';
        
        // 필드가 보이도록 스크롤
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        field.style.borderColor = '#e9ecef';
        field.style.boxShadow = 'none';
      }
    }
    
    return isValid;
  }

  processFormData(formData) {
    const data = Object.fromEntries(formData.entries());
    
    // 체크박스/라디오 값 처리
    data['website-type'] = Array.from(formData.getAll('website-type')).join(', ');
    data['design-style'] = Array.from(formData.getAll('design-style')).join(', ');
    data['features'] = Array.from(formData.getAll('features')).join(', ');
    
    // 라디오 버튼 값 처리
    const pageCount = document.querySelector('input[name="page-count"]:checked');
    if (pageCount) {
      data['page-count'] = pageCount.value;
    }
    
    const timeline = document.querySelector('input[name="timeline"]:checked');
    if (timeline) {
      data.timeline = timeline.value;
    }
    
    // 추가 메타데이터
    data.timestamp = new Date().toISOString();
    data.pageUrl = window.location.href;
    data.userAgent = navigator.userAgent;
    data.formType = 'estimate-request';
    data.browserLanguage = navigator.language;
    data.screenResolution = `${window.screen.width}x${window.screen.height}`;
    data.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    return data;
  }

  async sendToGoogleSheets(data) {
    // Google Apps Script는 URL 인코딩된 데이터를 기대하므로 변환
    const params = new URLSearchParams();
    
    // 모든 데이터를 문자열로 변환하여 추가
    for (const key in data) {
      if (data[key] !== null && data[key] !== undefined) {
        params.append(key, data[key].toString());
      }
    }
    
    // POST 요청 보내기 (no-cors 모드 사용)
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // CORS 이슈 방지를 위해 no-cors 사용
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });
    
    // no-cors 모드에서는 응답을 읽을 수 없으므로 항상 성공으로 가정
    // 실제 배포 시에는 Google Apps Script의 doPost 함수가 성공적으로 작동한다고 가정
    
    return response;
  }

  showSuccess(form) {
    const successElement = document.getElementById('successMessage') || document.getElementById('formSuccess');
    
    if (successElement) {
      form.style.display = 'none';
      successElement.style.display = 'block';
      
      // 페이지 상단으로 스크롤
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // 폼 리셋
      setTimeout(() => {
        form.reset();
        this.resetCheckboxRadioStyles();
      }, 1000);
      
    } else {
      alert('✅ 견적 요청이 완료되었습니다! 24시간 이내에 연락드리겠습니다.');
      form.reset();
      this.resetCheckboxRadioStyles();
    }
  }

  resetCheckboxRadioStyles() {
    document.querySelectorAll('.checkbox-label, .radio-label').forEach(label => {
      label.style.background = '#f8f9fa';
      label.style.borderColor = 'transparent';
      label.style.boxShadow = 'none';
    });
  }

  showError(message) {
    // 기존 에러 메시지 제거
    const existingErrors = document.querySelectorAll('.form-error-message');
    existingErrors.forEach(error => error.remove());
    
    // 새 에러 메시지 생성
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error-message';
    errorDiv.style.cssText = `
      background: #fff5f5;
      color: #c92a2a;
      padding: 20px 30px;
      border: 2px solid #ff6b6b;
      border-radius: 12px;
      margin: 25px 0;
      font-size: 1.4rem;
      text-align: center;
      animation: fadeIn 0.3s ease;
    `;
    
    errorDiv.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
        <i class="fas fa-exclamation-circle" style="font-size: 2rem;"></i>
        <span style="font-weight: 600;">${message}</span>
      </div>
      <p style="margin-top: 15px; font-size: 1.2rem; color: #868e96;">
        문제가 계속되면 <a href="mailto:help@ashop.com" style="color: #667eea; text-decoration: underline;">help@ashop.com</a>으로 문의주세요.
      </p>
    `;
    
    // 폼 상단에 에러 메시지 삽입
    const formContainer = this.form.closest('.form-container') || this.form.parentElement;
    formContainer.insertBefore(errorDiv, this.form);
    
    // 애니메이션 정의 (동적으로 추가)
    if (!document.querySelector('#fadeInAnimation')) {
      const style = document.createElement('style');
      style.id = 'fadeInAnimation';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }
    
    // 10초 후 에러 메시지 제거
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.style.opacity = '0';
        errorDiv.style.transform = 'translateY(-10px)';
        errorDiv.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
          if (errorDiv.parentNode) {
            errorDiv.remove();
          }
        }, 300);
      }
    }, 10000);
    
    // 에러 위치로 스크롤
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// 폼 핸들러 초기화
document.addEventListener('DOMContentLoaded', () => {
  new FormHandler();
  
  // 페이지 로드 시 첫 번째 필드에 포커스
  setTimeout(() => {
    const firstInput = document.querySelector('input[name="name"], input[required]');
    if (firstInput) {
      firstInput.focus();
    }
  }, 500);
});

// 전역 함수 - 폼 재설정
window.resetForm = function() {
  const form = document.getElementById('estimateForm');
  if (form) {
    form.reset();
    form.style.display = 'block';
    
    const successElement = document.getElementById('successMessage') || document.getElementById('formSuccess');
    if (successElement) {
      successElement.style.display = 'none';
    }
    
    // 체크박스/라디오 스타일 초기화
    document.querySelectorAll('.checkbox-label, .radio-label').forEach(label => {
      label.style.background = '#f8f9fa';
      label.style.borderColor = 'transparent';
      label.style.boxShadow = 'none';
    });
    
    // 페이지 상단으로 스크롤
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
};

// 전역 함수 - 에러 메시지 숨기기
window.hideErrorMessage = function() {
  const errorElement = document.getElementById('errorMessage');
  if (errorElement) {
    errorElement.style.display = 'none';
  }
};
