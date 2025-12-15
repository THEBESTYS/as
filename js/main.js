// main.js - ashop 메인 인터랙션

document.addEventListener('DOMContentLoaded', function() {
  // 1. 파티클 배경 초기화
  if (document.getElementById('particles-js')) {
    particlesJS('particles-js', {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#00D4FF" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#FF00FF",
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 3,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "repulse" },
          onclick: { enable: true, mode: "push" }
        }
      }
    });
  }

  // 2. 타이핑 효과
  const typingElement = document.getElementById('typing');
  if (typingElement) {
    const texts = ['아키텍처', '아이덴티티', '경험', '성장'];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function typeText() {
      const currentText = texts[textIndex];
      
      if (isDeleting) {
        typingElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
      }
      
      if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        setTimeout(typeText, 2000);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        setTimeout(typeText, 500);
      } else {
        setTimeout(typeText, isDeleting ? 100 : 200);
      }
    }
    
    setTimeout(typeText, 1000);
  }

  // 3. 스크롤 효과
  let lastScroll = 0;
  const header = document.querySelector('.glass-header');
  
  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    // 헤더 투명도
    if (currentScroll > 100) {
      header.style.background = 'rgba(10, 10, 20, 0.95)';
    } else {
      header.style.background = 'rgba(10, 10, 20, 0.8)';
    }
    
    // 스크롤 방향에 따른 헤더 숨김/표시
    if (currentScroll > lastScroll && currentScroll > 100) {
      header.style.transform = 'translateY(-100%)';
    } else {
      header.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
    
    // 섹션 등장 효과
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (sectionTop < windowHeight * 0.75) {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
      }
    });
  });

  // 4. 모바일 메뉴 토글
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

  // 5. 스무스 스크롤
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // 모바일 메뉴 닫기
        if (navMenu) navMenu.classList.remove('active');
        if (menuToggle) menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        
        // 스크롤 이동
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // 6. Unsplash 이미지 자동 로드
  loadUnsplashImages();
});

// Unsplash 이미지 로드 함수
async function loadUnsplashImages() {
  const imageElements = document.querySelectorAll('[data-unsplash]');
  
  if (imageElements.length === 0 || !UNSPLASH_ACCESS_KEY) return;
  
  try {
    for (const element of imageElements) {
      const query = element.getAttribute('data-unsplash') || 'digital art technology';
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        element.src = data.urls.regular;
        element.alt = data.alt_description || query;
      }
    }
  } catch (error) {
    console.log('Unsplash 이미지 로드 실패:', error);
  }
}
