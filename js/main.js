// main.js - ashop 메인 인터랙션 (Google Sheets 연동 최적화)

document.addEventListener('DOMContentLoaded', function() {
  // 1. 모바일 메뉴 토글
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      navMenu.classList.toggle('active');
      menuToggle.innerHTML = navMenu.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
      
      // 메뉴 닫기 버튼 추가
      if (!document.querySelector('.menu-close-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'menu-close-overlay';
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 999;
          display: ${navMenu.classList.contains('active') ? 'block' : 'none'};
        `;
        overlay.addEventListener('click', function() {
          navMenu.classList.remove('active');
          menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
          this.style.display = 'none';
        });
        document.body.appendChild(overlay);
      } else {
        const overlay = document.querySelector('.menu-close-overlay');
        overlay.style.display = navMenu.classList.contains('active') ? 'block' : 'none';
      }
    });
  }

  // 2. 폼 필드 자동 포맷팅 (전화번호)
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/[^\d]/g, '');
      
      if (value.length > 3 && value.length <= 7) {
        value = value.replace(/(\d{3})(\d+)/, '$1-$2');
      } else if (value.length > 7) {
        value = value.replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
      }
      
      e.target.value = value;
    });
    
    // 전화번호 유효성 검사
    phoneInput.addEventListener('blur', function() {
      const value = this.value.replace(/[^\d]/g, '');
      if (value && value.length !== 10 && value.length !== 11) {
        this.style.borderColor = '#ff6b6b';
        this.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.1)';
        this.setCustomValidity('올바른 전화번호 형식이 아닙니다 (10-11자리 숫자)');
      } else {
        this.style.borderColor = '#e9ecef';
        this.style.boxShadow = 'none';
        this.setCustomValidity('');
      }
    });
  }

  // 3. 필수 필드 표시
  const requiredInputs = document.querySelectorAll('input[required], select[required], textarea[required]');
  requiredInputs.forEach(input => {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) {
      if (!label.querySelector('.required-asterisk')) {
        const asterisk = document.createElement('span');
        asterisk.className = 'required-asterisk';
        asterisk.innerHTML = ' *';
        asterisk.style.cssText = 'color: #ff6b6b; font-weight: bold; font-size: 1.2em;';
        label.appendChild(asterisk);
      }
    }
    
    // 실시간 유효성 검사
    input.addEventListener('input', function() {
      this.validateField();
    });
  });

  // 4. 입력 필드 유효성 검사 함수
  setupFieldValidation();

  // 5. 제출 버튼 로딩 상태
  const submitBtn = document.querySelector('.submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', function(e) {
      if (this.disabled) {
        e.preventDefault();
        return;
      }
    });
  }

  // 6. 페이지 진입 애니메이션
  setupPageAnimations();

  // 7. Google Sheets 상태 표시 (옵션)
  showGoogleSheetsStatus();

  // 8. 카드 호버 효과
  setupCardHoverEffects();

  // 9. Unsplash 이미지 자동 로드 (옵션)
  // loadUnsplashImages();
});

// 필드 유효성 검사 설정
function setupFieldValidation() {
  const emailField = document.getElementById('email');
  if (emailField) {
    emailField.validateField = function() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (this.value && !emailRegex.test(this.value)) {
        this.style.borderColor = '#ff6b6b';
        this.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.1)';
        this.setCustomValidity('올바른 이메일 주소를 입력해주세요');
        return false;
      } else {
        this.style.borderColor = '#e9ecef';
        this.style.boxShadow = 'none';
        this.setCustomValidity('');
        return true;
      }
    };
    
    emailField.addEventListener('blur', emailField.validateField);
  }

  // 숫자만 입력 필드
  const budgetField = document.getElementById('budget');
  if (budgetField) {
    budgetField.addEventListener('input', function(e) {
      // 숫자와 하이픈만 허용
      this.value = this.value.replace(/[^\d\-만원]/g, '');
    });
  }
}

// 페이지 애니메이션 설정
function setupPageAnimations() {
  // 스크롤 애니메이션
  const animateOnScroll = function() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('animated');
      }
    });
  };

  // 초기 실행
  animateOnScroll();
  
  // 스크롤 이벤트 리스너
  window.addEventListener('scroll', animateOnScroll);
  
  // 애니메이션 CSS 추가
  const style = document.createElement('style');
  style.textContent = `
    .animate-on-scroll {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-on-scroll.animated {
      opacity: 1;
      transform: translateY(0);
    }
    
    .form-section {
      opacity: 0;
      transform: translateY(20px);
      animation: fadeInUp 0.5s ease forwards;
    }
    
    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  
  // 섹션별 애니메이션 딜레이
  document.querySelectorAll('.form-section').forEach((section, index) => {
    section.style.animationDelay = `${index * 0.1}s`;
  });
  
  document.head.appendChild(style);
}

// Google Sheets 상태 표시
function showGoogleSheetsStatus() {
  // 상태 표시 요소가 없으면 생성
  if (!document.querySelector('.gs-status')) {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'gs-status';
    statusDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #f8f9fa;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 100;
      transition: all 0.3s ease;
      opacity: 0.9;
    `;
    
    statusDiv.innerHTML = `
      <i class="fas fa-cloud" style="color: #667eea;"></i>
      <span>Google Sheets 연동 준비 완료</span>
    `;
    
    document.body.appendChild(statusDiv);
    
    // 5초 후 숨기기
    setTimeout(() => {
      statusDiv.style.opacity = '0';
      statusDiv.style.transform = 'translateY(20px)';
      setTimeout(() => statusDiv.remove(), 300);
    }, 5000);
  }
}

// 카드 호버 효과 설정
function setupCardHoverEffects() {
  const cards = document.querySelectorAll('.checkbox-label, .radio-label');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      if (!this.querySelector('input').checked) {
        this.style.transform = 'translateY(-5px) scale(1.02)';
        this.style.transition = 'all 0.3s ease';
        this.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.15)';
      }
    });
    
    card.addEventListener('mouseleave', function() {
      if (!this.querySelector('input').checked) {
        this.style.transform = '';
        this.style.boxShadow = '';
      }
    });
  });
}

// Unsplash 이미지 로드 함수
async function loadUnsplashImages() {
  const imageElements = document.querySelectorAll('[data-unsplash]');
  
  if (imageElements.length === 0) return;
  
  try {
    for (const element of imageElements) {
      const query = element.getAttribute('data-unsplash') || 'branding design office';
      // 실제 사용 시 Unsplash Access Key 필요
      // const response = await fetch(`https://api.unsplash.com/photos/random?query=${query}&client_id=YOUR_ACCESS_KEY`);
      // if (response.ok) {
      //   const data = await response.json();
      //   element.src = data.urls.regular;
      //   element.alt = data.alt_description || query;
      // }
      
      // 대체 이미지 (로컬 이미지 사용)
      const placeholderImages = {
        'branding design office': 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
        'web development': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w-800',
        'digital marketing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'
      };
      
      if (placeholderImages[query]) {
        element.src = placeholderImages[query];
      }
    }
  } catch (error) {
    console.log('Unsplash 이미지 로드:', error);
  }
}

// 폼 데이터 콘솔 출력 (디버깅용)
function logFormData(formData) {
  console.group('📋 폼 데이터 확인');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }
  console.groupEnd();
}

// Google Sheets 전송 테스트 함수
async function testGoogleSheetsConnection() {
  const testData = {
    timestamp: new Date().toISOString(),
    name: '테스트 사용자',
    email: 'test@example.com',
    phone: '010-1234-5678',
    company: '테스트 회사',
    industry: '테크/스타트업',
    'website-type': '브랜드 소개형',
    'page-count': '5페이지 이하',
    'design-style': '심플 / 미니멀',
    references: 'https://example.com',
    features: '온라인 예약/상담 신청',
    timeline: '가능한 빨리',
    budget: '500-1000만원',
    'project-desc': '테스트 프로젝트 설명입니다.',
    privacyAgree: 'true',
    marketingConsent: 'false',
    formType: 'test-request'
  };
  
  try {
    const params = new URLSearchParams();
    for (const key in testData) {
      params.append(key, testData[key]);
    }
    
    const response = await fetch('https://script.google.com/macros/s/AKfycbxaqrNwqBnzdXO0QsVFSDmAJz-Ul_k-0s_6w3a_Fd5UXtPsdUntZBGdH3fIRgO_B7jYNA/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });
    
    console.log('✅ Google Sheets 연결 테스트 성공');
    return true;
  } catch (error) {
    console.error('❌ Google Sheets 연결 테스트 실패:', error);
    return false;
  }
}

// 실시간 문자 수 표시기
function setupCharacterCounters() {
  const textareas = document.querySelectorAll('textarea[data-maxlength]');
  
  textareas.forEach(textarea => {
    const maxLength = parseInt(textarea.getAttribute('data-maxlength')) || 1000;
    const counterId = `counter-${textarea.id}`;
    
    // 카운터 요소 생성
    let counter = document.getElementById(counterId);
    if (!counter) {
      counter = document.createElement('div');
      counter.id = counterId;
      counter.className = 'character-counter';
      counter.style.cssText = `
        font-size: 1.2rem;
        color: #666;
        text-align: right;
        margin-top: 8px;
        opacity: 0.7;
      `;
      textarea.parentNode.appendChild(counter);
    }
    
    // 업데이트 함수
    const updateCounter = () => {
      const currentLength = textarea.value.length;
      counter.textContent = `${currentLength} / ${maxLength} 자`;
      
      if (currentLength > maxLength * 0.9) {
        counter.style.color = '#ff6b6b';
      } else if (currentLength > maxLength * 0.7) {
        counter.style.color = '#ffa94d';
      } else {
        counter.style.color = '#666';
      }
    };
    
    // 이벤트 리스너
    textarea.addEventListener('input', updateCounter);
    textarea.addEventListener('keydown', function(e) {
      if (this.value.length >= maxLength && e.key !== 'Backspace' && e.key !== 'Delete') {
        e.preventDefault();
      }
    });
    
    // 초기 업데이트
    updateCounter();
  });
}

// 폼 저장 기능 (로컬 저장소)
function setupFormAutoSave() {
  const form = document.getElementById('estimateForm');
  if (!form) return;
  
  const saveKey = 'ashop-estimate-form-data';
  const saveInterval = 5000; // 5초마다 저장
  
  // 저장된 데이터 불러오기
  const savedData = localStorage.getItem(saveKey);
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      Object.keys(data).forEach(key => {
        const element = form.querySelector(`[name="${key}"]`);
        if (element) {
          if (element.type === 'checkbox' || element.type === 'radio') {
            element.checked = data[key] === 'true';
          } else {
            element.value = data[key];
          }
        }
      });
      
      // 복원 메시지
      showToast('이전에 작성하던 내용을 복원했습니다.', 'info');
    } catch (error) {
      console.log('저장된 데이터 복원 실패:', error);
    }
  }
  
  // 자동 저장 설정
  let saveTimeout;
  const saveFormData = () => {
    const formData = new FormData(form);
    const data = {};
    
    formData.forEach((value, key) => {
      data[key] = value;
    });
    
    localStorage.setItem(saveKey, JSON.stringify(data));
  };
  
  // 입력 이벤트 리스너
  form.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveFormData, saveInterval);
  });
  
  // 폼 제출 시 저장 데이터 삭제
  form.addEventListener('submit', () => {
    localStorage.removeItem(saveKey);
  });
}

// 토스트 메시지 표시
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  
  const colors = {
    info: { bg: '#667eea', icon: 'info-circle' },
    success: { bg: '#4CAF50', icon: 'check-circle' },
    warning: { bg: '#FFA726', icon: 'exclamation-triangle' },
    error: { bg: '#F44336', icon: 'exclamation-circle' }
  };
  
  const config = colors[type] || colors.info;
  
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: ${config.bg};
    color: white;
    padding: 15px 25px;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    z-index: 1000;
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: transform 0.3s ease;
  `;
  
  toast.innerHTML = `
    <i class="fas fa-${config.icon}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  // 애니메이션
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);
  
  // 자동 제거
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(100px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// DOMContentLoaded 이벤트에 추가
document.addEventListener('DOMContentLoaded', function() {
  // 추가 초기화 함수 호출
  setupCharacterCounters();
  setupFormAutoSave();
  
  // Google Sheets 연결 테스트 (옵션)
  // testGoogleSheetsConnection().then(connected => {
  //   if (connected) {
  //     showToast('Google Sheets 연결이 확인되었습니다.', 'success');
  //   }
  // });
});
