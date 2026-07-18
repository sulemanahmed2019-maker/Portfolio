  // ---------- Sticky header shadow on scroll ----------
  const header = document.getElementById('siteHeader');
  let ticking = false;
  function onScroll(){
    if (!ticking){
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 8);
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

  // ---------- Mobile hamburger menu ----------
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');

  function closeMenu(){
    navLinks.classList.remove('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    header.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
  }
  function toggleMenu(){
    const isOpen = navLinks.classList.toggle('is-open');
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    header.classList.toggle('menu-open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
  hamburgerBtn.addEventListener('click', toggleMenu);
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('is-open') &&
        !navLinks.contains(e.target) &&
        !hamburgerBtn.contains(e.target)){
      closeMenu();
    }
  });

  // ---------- Scroll reveal ----------
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  // ---------- Stat counter animation ----------
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const statList = document.querySelector('.stat-list');
  function animateCount(el){
    const target = parseInt(el.dataset.target, 10);
    if (prefersReducedMotion || isNaN(target)){
      el.textContent = target || el.textContent;
      return;
    }
    const duration = 1000;
    const start = performance.now();
    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }
  if (statList){
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          statList.querySelectorAll('.stat-num').forEach(animateCount);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statObserver.observe(statList);
  }

  // ---------- Active nav link on scroll ----------
  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (!link) return;
      if (entry.isIntersecting){
        navAnchors.forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach(sec => navObserver.observe(sec));

  // ---------- Footer year ----------
  document.getElementById('year').textContent = new Date().getFullYear();

  // ---------- Skills tabs ----------
  const skillTabs = Array.from(document.querySelectorAll('.skills-tab'));
  const skillPanels = Array.from(document.querySelectorAll('.skill-group'));

  if (skillTabs.length && skillPanels.length){
    skillTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('aria-controls');
        const targetPanel = document.getElementById(targetId);

        if (!targetPanel) return;

        skillTabs.forEach((item) => {
          const isActive = item === tab;
          item.classList.toggle('is-active', isActive);
          item.setAttribute('aria-selected', String(isActive));
        });

        skillPanels.forEach((panel) => {
          const isActivePanel = panel === targetPanel;
          panel.classList.toggle('is-active', isActivePanel);
          if (isActivePanel) {
            panel.removeAttribute('hidden');
          } else {
            panel.setAttribute('hidden', 'true');
          }
        });
      });
    });
  }

  // ---------- Contact form ----------
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');

  // TODO: replace with your real Formspree endpoint (or another form backend)
  const FORM_ENDPOINT = 'https://formspree.io/f/mkoldzgd';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    const data = new FormData(form);
    const email = data.get('email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.get('name') || !email || !data.get('message')){
      formStatus.textContent = 'Please fill in all fields.';
      formStatus.classList.add('error');
      return;
    }
    if (!emailPattern.test(email)){
      formStatus.textContent = 'Please enter a valid email address.';
      formStatus.classList.add('error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data
      });

      if (response.ok){
        formStatus.textContent = 'Message sent — thanks! I\'ll get back to you soon.';
        formStatus.classList.add('success');
        form.reset();
      } else {
        formStatus.textContent = 'Something went wrong. Please email me directly instead.';
        formStatus.classList.add('error');
      }
    } catch (err){
      formStatus.textContent = 'Network error. Please email me directly instead.';
      formStatus.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    }
  });
