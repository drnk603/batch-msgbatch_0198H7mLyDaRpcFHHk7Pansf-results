(function() {
  'use strict';

  const app = {
    initialized: false,
    modules: {}
  };

  const config = {
    headerSelector: '.l-header, .navbar',
    navToggleSelector: '.c-nav__toggle, .navbar-toggler',
    navSelector: '.c-nav, .navbar-collapse',
    navLinksSelector: '.c-nav__link, .nav-link',
    mobileBreakpoint: 1024
  };

  function BurgerMenu() {
    const nav = document.querySelector(config.navSelector);
    const toggle = document.querySelector(config.navToggleSelector);
    const navLinks = document.querySelectorAll(config.navLinksSelector);
    const body = document.body;

    if (!nav || !toggle) return;

    let focusableElements = [];
    let firstFocusable = null;
    let lastFocusable = null;

    function updateFocusableElements() {
      focusableElements = Array.from(nav.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'));
      firstFocusable = focusableElements[0];
      lastFocusable = focusableElements[focusableElements.length - 1];
    }

    function openMenu() {
      nav.classList.add('is-open', 'show');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
      updateFocusableElements();
      if (firstFocusable) {
        setTimeout(() => firstFocusable.focus(), 100);
      }
    }

    function closeMenu() {
      nav.classList.remove('is-open', 'show');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
    }

    function toggleMenu() {
      nav.classList.contains('is-open') ? closeMenu() : openMenu();
    }

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      toggleMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }

      if (nav.classList.contains('is-open') && e.key === 'Tab' && focusableElements.length > 0) {
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    });

    document.addEventListener('click', (e) => {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && e.target !== toggle) {
        closeMenu();
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth >= config.mobileBreakpoint && nav.classList.contains('is-open')) {
          closeMenu();
        }
      }, 150);
    });
  }

  function SmoothScroll() {
    const isHomepage = ['/', '/index.html'].some(path => 
      window.location.pathname === path || window.location.pathname.endsWith(path)
    );

    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === '#' || href === '#!') return;

      if (!isHomepage && href.startsWith('#')) {
        const sectionId = href.substring(1);
        if (sectionId && !document.getElementById(sectionId)) {
          link.setAttribute('href', `/#${sectionId}`);
        }
      }

      link.addEventListener('click', function(e) {
        const targetHref = this.getAttribute('href');
        if (targetHref === '#' || targetHref === '#!') return;

        if (targetHref.startsWith('#')) {
          const targetId = targetHref.substring(1);
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
            e.preventDefault();

            const header = document.querySelector(config.headerSelector);
            const headerHeight = header ? header.offsetHeight : 80;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });

            if (history.pushState) {
              history.pushState(null, null, targetHref);
            }
          }
        }
      });
    });
  }

  function ActiveMenuState() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(config.navLinksSelector);
    const isHomepage = ['/', '/index.html'].some(path => 
      currentPath === path || currentPath.endsWith(path)
    );

    navLinks.forEach(link => {
      const linkPath = link.getAttribute('href');

      link.removeAttribute('aria-current');
      link.classList.remove('active');

      if (linkPath === currentPath || 
          (isHomepage && (linkPath === '/' || linkPath === '/index.html'))) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      } else if (linkPath && currentPath.startsWith(linkPath) && linkPath !== '/') {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
    });
  }

  function ScrollSpy() {
    const sections = document.querySelectorAll('[id]');
    const navLinks = document.querySelectorAll(`${config.navLinksSelector}[href^="#"]`);

    if (sections.length === 0 || navLinks.length === 0) return;

    const header = document.querySelector(config.headerSelector);
    const headerHeight = header ? header.offsetHeight : 80;

    function updateActiveLink() {
      let current = '';
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 100;
        if (window.pageYOffset >= sectionTop) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        
        const href = link.getAttribute('href');
        if (href === `#${current}`) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      });
    }

    window.addEventListener('scroll', debounce(updateActiveLink, 100), { passive: true });
    updateActiveLink();
  }

  function ImageHandling() {
    const images = document.querySelectorAll('img');

    images.forEach(img => {
      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      if (!img.hasAttribute('loading') && 
          !img.classList.contains('c-logo__img') && 
          !img.hasAttribute('data-critical')) {
        img.setAttribute('loading', 'lazy');
      }

      img.addEventListener('error', function() {
        if (this.dataset.fallbackApplied) return;
        this.dataset.fallbackApplied = 'true';

        const svgPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e9ecef" width="400" height="300"/%3E%3Ctext fill="%236c757d" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not available%3C/text%3E%3C/svg%3E';
        this.src = svgPlaceholder;
        this.style.objectFit = 'contain';

        if (this.classList.contains('c-logo__img')) {
          this.style.maxHeight = '40px';
        }
      });
    });
  }

  function FormValidation() {
    const forms = document.querySelectorAll('form.c-form, form[id*="Form"]');

    const validators = {
      name: (value) => {
        if (!value || value.trim().length < 2) {
          return 'Meno musí obsahovať aspoň 2 znaky';
        }
        if (!/^[a-zA-ZÀ-ÿs-']{2,50}$/.test(value)) {
          return 'Meno obsahuje nepovolené znaky';
        }
        return null;
      },
      email: (value) => {
        if (!value || value.trim().length === 0) {
          return 'E-mail je povinný';
        }
        if (!/^[^s@]+@[^s@]+.[^s@]+$/.test(value)) {
          return 'Neplatný formát e-mailu';
        }
        return null;
      },
      phone: (value) => {
        if (value && !/^[ds+-()]{10,20}$/.test(value)) {
          return 'Neplatný formát telefónneho čísla';
        }
        return null;
      },
      subject: (value) => {
        if (!value || value.trim().length < 3) {
          return 'Predmet musí obsahovať aspoň 3 znaky';
        }
        return null;
      },
      message: (value) => {
        if (!value || value.trim().length < 10) {
          return 'Správa musí obsahovať aspoň 10 znakov';
        }
        return null;
      },
      checkbox: (checked) => {
        if (!checked) {
          return 'Toto pole je povinné';
        }
        return null;
      }
    };

    function showError(input, message) {
      const formGroup = input.closest('.c-form__group, .form-group, .mb-3');
      if (!formGroup) return;

      input.classList.add('is-invalid');
      
      let errorElement = formGroup.querySelector('.c-form__error, .invalid-feedback');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'c-form__error invalid-feedback';
        input.parentNode.appendChild(errorElement);
      }
      
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }

    function clearError(input) {
      const formGroup = input.closest('.c-form__group, .form-group, .mb-3');
      if (!formGroup) return;

      input.classList.remove('is-invalid');
      
      const errorElement = formGroup.querySelector('.c-form__error, .invalid-feedback');
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    }

    function validateField(input) {
      const type = input.type;
      const name = input.name;
      const value = input.value;

      clearError(input);

      if (input.hasAttribute('required') || value.trim().length > 0) {
        let error = null;

        if (type === 'checkbox') {
          error = validators.checkbox(input.checked);
        } else if (validators[name]) {
          error = validators[name](value);
        } else if (type === 'email') {
          error = validators.email(value);
        }

        if (error) {
          showError(input, error);
          return false;
        }
      }

      return true;
    }

    function validateForm(form) {
      let isValid = true;
      const inputs = form.querySelectorAll('input, textarea, select');

      inputs.forEach(input => {
        if (!validateField(input)) {
          isValid = false;
        }
      });

      return isValid;
    }

    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        
        input.addEventListener('input', () => {
          if (input.classList.contains('is-invalid')) {
            validateField(input);
          }
        });
      });

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!validateForm(form)) {
          const firstInvalid = form.querySelector('.is-invalid');
          if (firstInvalid) {
            firstInvalid.focus();
          }
          return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        let originalText = '';

        if (submitBtn) {
          submitBtn.disabled = true;
          originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Odosielanie...';
        }

        setTimeout(() => {
          notify('Ďakujeme! Vaša správa bola úspešne odoslaná.', 'success');
          
          setTimeout(() => {
            window.location.href = 'thank_you.html';
          }, 1500);
        }, 1000);
      });
    });
  }

  function notify(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;max-width:350px;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
    container.appendChild(toast);

    const closeBtn = toast.querySelector('.btn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => toast.remove());
    }

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 150);
    }, 5000);
  }

  function ScrollToTop() {
    const scrollBtn = document.querySelector('[data-scroll-top], .scroll-to-top');
    if (!scrollBtn) return;

    function toggleButton() {
      if (window.pageYOffset > 300) {
        scrollBtn.classList.add('is-visible');
      } else {
        scrollBtn.classList.remove('is-visible');
      }
    }

    scrollBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', debounce(toggleButton, 100), { passive: true });
    toggleButton();
  }

  function CountUp() {
    const counters = document.querySelectorAll('[data-count], .counter');
    if (counters.length === 0) return;

    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          const target = entry.target;
          const countTo = parseInt(target.dataset.count || target.textContent);
          const duration = 2000;
          const increment = countTo / (duration / 16);
          let current = 0;

          target.dataset.counted = 'true';

          const counter = setInterval(() => {
            current += increment;
            if (current >= countTo) {
              target.textContent = countTo;
              clearInterval(counter);
            } else {
              target.textContent = Math.floor(current);
            }
          }, 16);

          observer.unobserve(target);
        }
      });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
  }

  function AccordionInit() {
    const accordionButtons = document.querySelectorAll('.accordion-button');

    accordionButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-bs-target');
        if (!targetId) return;

        const target = document.querySelector(targetId);
        if (!target) return;

        const isExpanded = this.getAttribute('aria-expanded') === 'true';

        this.setAttribute('aria-expanded', !isExpanded);
        this.classList.toggle('collapsed');

        if (isExpanded) {
          target.classList.remove('show');
        } else {
          target.classList.add('show');
        }
      });
    });
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function init() {
    if (app.initialized) return;
    app.initialized = true;

    BurgerMenu();
    SmoothScroll();
    ActiveMenuState();
    ScrollSpy();
    ImageHandling();
    FormValidation();
    ScrollToTop();
    CountUp();
    AccordionInit();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.__app = app;
  window.__app.notify = notify;

})();
