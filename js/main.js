// main.js - ashop 메인 인터랙션

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
  }

  // 3. 필수 필드 표시
  const requiredInputs = document.querySelectorAll('input[required], select[required], textarea[required]');
  requiredInputs.forEach(input => {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) {
      label.innerHTML += ' <span class="required-asterisk">*</span>';
    }
  });

  // 4. Unsplash 이미지 자동 로드 (옵션)
  loadUnsplashImages();
});

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
    }
  } catch (error) {
    console.log('Unsplash 이미지 로드:', error);
  }
}

// 5. 폼 데이터 콘솔 출력 (디버깅용)
function logFormData(formData) {
  console.group('📋 폼 데이터 확인');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }
  console.groupEnd();
}
