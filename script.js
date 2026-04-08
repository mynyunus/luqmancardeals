const header = document.querySelector('.site-header');
const revealItems = document.querySelectorAll('.reveal');
const yearEl = document.getElementById('year');
const loanForm = document.getElementById('loanForm');
const monthlyPaymentEl = document.getElementById('monthlyPayment');
const loanSummaryEl = document.getElementById('loanSummary');
const loanWhatsappCta = document.getElementById('loanWhatsappCta');
const carousel = document.querySelector('[data-carousel]');
const mobilePillNav = document.querySelector('[data-mobile-pill-nav]');
const mobileMoreToggle = mobilePillNav ? mobilePillNav.querySelector('.pill-more-toggle') : null;
const mobileDropdown = mobilePillNav ? mobilePillNav.querySelector('.pill-dropdown') : null;

const getOffset = () => {
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  if (isMobile && mobilePillNav && mobilePillNav.offsetHeight > 0) {
    return mobilePillNav.offsetHeight + 20;
  }
  if (header && header.offsetHeight > 0) {
    return header.offsetHeight + 12;
  }
  return 88;
};

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - getOffset();
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

if (mobilePillNav && mobileMoreToggle && mobileDropdown) {
  let dropdownCloseTimer = 0;

  const openMobileDropdown = () => {
    window.clearTimeout(dropdownCloseTimer);
    mobileMoreToggle.setAttribute('aria-expanded', 'true');
    mobileDropdown.hidden = false;
    window.requestAnimationFrame(() => {
      mobileDropdown.classList.add('is-open');
    });
  };

  const closeMobileDropdown = (immediate = false) => {
    mobileMoreToggle.setAttribute('aria-expanded', 'false');
    mobileDropdown.classList.remove('is-open');
    window.clearTimeout(dropdownCloseTimer);

    if (immediate) {
      mobileDropdown.hidden = true;
      return;
    }

    dropdownCloseTimer = window.setTimeout(() => {
      if (mobileMoreToggle.getAttribute('aria-expanded') !== 'true') {
        mobileDropdown.hidden = true;
      }
    }, 190);
  };

  mobileMoreToggle.addEventListener('click', () => {
    const isOpen = mobileMoreToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) closeMobileDropdown();
    else openMobileDropdown();
  });

  mobileDropdown.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileDropdown);
  });

  mobilePillNav.querySelectorAll('.pill-link').forEach((link) => {
    link.addEventListener('click', closeMobileDropdown);
  });

  document.addEventListener('click', (event) => {
    if (!mobilePillNav.contains(event.target)) closeMobileDropdown();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileDropdown();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) closeMobileDropdown(true);
  });
}

let lastScrollY = window.scrollY;

const onScroll = () => {
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 8);
  }

  if (mobilePillNav) {
    const currentY = window.scrollY;
    const deltaY = currentY - lastScrollY;
    mobilePillNav.classList.toggle('is-scrolled', currentY > 8);
    if (Math.abs(deltaY) > 2) {
      const isGoingDown = deltaY > 0 && currentY > 90;
      mobilePillNav.classList.toggle('is-scrolling-down', isGoingDown);
    }
    if (currentY <= 20) {
      mobilePillNav.classList.remove('is-scrolling-down');
    }
    lastScrollY = currentY;
  }
};

onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

if (loanForm && monthlyPaymentEl && loanSummaryEl && loanWhatsappCta) {
  const formatMYR = (value) =>
    new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const toValidNumber = (input, fallback = 0) => {
    const parsed = Number.parseFloat(input);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const calculateLoan = () => {
    const carPrice = Math.max(0, toValidNumber(loanForm.carPrice.value));
    const downPaymentPct = Math.min(90, Math.max(0, toValidNumber(loanForm.downPayment.value)));
    const interestRate = Math.max(0, toValidNumber(loanForm.interestRate.value));
    const years = Math.max(1, toValidNumber(loanForm.loanYears.value, 7));

    const downPaymentAmount = carPrice * (downPaymentPct / 100);
    const loanAmount = Math.max(0, carPrice - downPaymentAmount);
    const totalInterest = loanAmount * (interestRate / 100) * years;
    const totalRepayment = loanAmount + totalInterest;
    const months = years * 12;
    const monthlyInstallment = months > 0 ? totalRepayment / months : 0;

    monthlyPaymentEl.textContent = formatMYR(monthlyInstallment);
    loanSummaryEl.textContent = `Jumlah pinjaman: ${formatMYR(loanAmount)} | Tempoh: ${years} tahun`;

    const waText = `Hi Faiz, saya dah guna loan calculator. Anggaran bulanan saya ${formatMYR(
      monthlyInstallment
    )} (harga kereta ${formatMYR(carPrice)}). Boleh bantu saya semak kelayakan loan?`;
    loanWhatsappCta.href = `https://wa.me/60196667724?text=${encodeURIComponent(waText)}`;
  };

  loanForm.addEventListener('submit', (event) => {
    event.preventDefault();
    calculateLoan();
  });

  loanForm.addEventListener('input', calculateLoan);
  calculateLoan();
}

if (carousel) {
  const viewport = carousel.querySelector('#deliveryCarouselViewport');
  const track = carousel.querySelector('#deliveryCarouselTrack');
  const slides = track ? Array.from(track.querySelectorAll('.carousel-slide')) : [];
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  const dotsContainer = carousel.querySelector('#carouselDots');

  let currentIndex = 0;
  let isTransitionLocked = false;
  let touchStartX = 0;
  let touchDeltaX = 0;
  let touchActive = false;
  const dots = [];

  const lockTransition = () => {
    isTransitionLocked = true;
    window.setTimeout(() => {
      isTransitionLocked = false;
    }, 520);
  };

  const renderCarousel = () => {
    if (!track || !slides.length) return;
    track.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;
    dots.forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  };

  const goToSlide = (index) => {
    if (!slides.length || isTransitionLocked) return;
    const total = slides.length;
    currentIndex = (index + total) % total;
    lockTransition();
    renderCarousel();
  };

  if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

  if (dotsContainer) {
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Pergi ke gambar ${index + 1}`);
      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.append(dot);
      dots.push(dot);
    });
  }

  if (viewport) {
    viewport.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToSlide(currentIndex - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToSlide(currentIndex + 1);
      }
    });

    viewport.addEventListener(
      'touchstart',
      (event) => {
        if (!event.touches || event.touches.length !== 1 || isTransitionLocked) return;
        touchActive = true;
        touchStartX = event.touches[0].clientX;
        touchDeltaX = 0;
      },
      { passive: true }
    );

    viewport.addEventListener(
      'touchmove',
      (event) => {
        if (!touchActive || !event.touches || event.touches.length !== 1) return;
        touchDeltaX = event.touches[0].clientX - touchStartX;
      },
      { passive: true }
    );

    viewport.addEventListener(
      'touchend',
      () => {
        if (!touchActive) return;
        const threshold = 72;
        if (Math.abs(touchDeltaX) >= threshold) {
          if (touchDeltaX < 0) goToSlide(currentIndex + 1);
          if (touchDeltaX > 0) goToSlide(currentIndex - 1);
        }
        touchActive = false;
        touchDeltaX = 0;
      },
      { passive: true }
    );
  }

  renderCarousel();
}
