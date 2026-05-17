/* ==============================================
   Future Enlightenment – Main JS
   ============================================== */
(function () {
  'use strict';

  var currentLang = localStorage.getItem('fe_lang') || 'en';
  var darkMode    = localStorage.getItem('fe_dark') === '1';

  function init() {
    applyDarkMode();
    applyLanguage(currentLang);
    wireNav();
    wireControls();
    wireContactMode();
    wireTopicPills();
    wireContactForm();
  }

  /* ---- Language ---- */
  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('fe_lang', lang);
    document.documentElement.lang = lang;
    var t = TRANSLATIONS[lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (t[key] !== undefined) el.innerHTML = t[key].replace(/\n/g, '<br>');
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (t[key] !== undefined) el.placeholder = t[key];
    });
    document.querySelectorAll('[data-i18n-option]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-option');
      if (t[key] !== undefined) el.textContent = t[key];
    });
    var picker = document.getElementById('lang-select');
    if (picker) picker.value = lang;
  }

  /* ---- Dark mode ---- */
  function applyDarkMode() {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('fe_dark', darkMode ? '1' : '0');
    var btn = document.getElementById('contrast-toggle');
    if (btn) btn.setAttribute('aria-label', darkMode ? 'Switch to light mode' : 'Switch to dark mode');
  }

  /* ---- Wire controls ---- */
  function wireControls() {
    var con  = document.getElementById('contrast-toggle');
    var lang = document.getElementById('lang-select');
    if (con)  con.addEventListener('click',  function () { darkMode = !darkMode; applyDarkMode(); });
    if (lang) lang.addEventListener('change', function () { applyLanguage(this.value); });
  }

  /* ---- Mobile nav ---- */
  function wireNav() {
    var toggle = document.getElementById('nav-toggle');
    var panel  = document.getElementById('nav-panel');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    /* Close when a nav link is clicked */
    panel.querySelectorAll('a, button.nav-link').forEach(function (el) {
      el.addEventListener('click', function () {
        panel.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    /* Close on outside click */
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && !toggle.contains(e.target)) {
        panel.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    /* Mark active page */
    var page = window.location.pathname.split('/').pop() || 'index.html';
    panel.querySelectorAll('.nav-link').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ---- Contact mode toggle (form / info) ---- */
  function wireContactMode() {
    var btnForm  = document.getElementById('mode-form-btn');
    var btnInfo  = document.getElementById('mode-info-btn');
    var panelForm = document.getElementById('contact-form-panel');
    var panelInfo = document.getElementById('contact-info-panel');
    var switchBtn = document.getElementById('switch-to-form');
    if (!btnForm || !btnInfo) return;

    function showForm() {
      btnForm.classList.add('active');   btnInfo.classList.remove('active');
      btnForm.setAttribute('aria-selected', 'true');
      btnInfo.setAttribute('aria-selected', 'false');
      panelForm.hidden = false;          panelInfo.hidden = true;
    }
    function showInfo() {
      btnInfo.classList.add('active');   btnForm.classList.remove('active');
      btnInfo.setAttribute('aria-selected', 'true');
      btnForm.setAttribute('aria-selected', 'false');
      panelInfo.hidden = false;          panelForm.hidden = true;
    }
    btnForm.addEventListener('click', showForm);
    btnInfo.addEventListener('click', showInfo);
    if (switchBtn) switchBtn.addEventListener('click', showForm);
  }

  /* ---- Topic pills ---- */
  function wireTopicPills() {
    var subjectInput = document.getElementById('f-subject');
    if (!subjectInput) return;
    document.querySelectorAll('.topic-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        document.querySelectorAll('.topic-pill').forEach(function (p) {
          p.classList.remove('active');
          p.setAttribute('aria-pressed', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-pressed', 'true');
        subjectInput.value = pill.getAttribute('data-value');
      });
    });
  }

  /* ---- Contact form ---- */
  function wireContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name    = form.querySelector('#f-name').value.trim();
      var email   = form.querySelector('#f-email').value.trim();
      var subject = form.querySelector('#f-subject').value;
      var message = form.querySelector('#f-message').value.trim();
      if (!name || !email || !message) return;
      var body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message);
      window.location.href =
        'mailto:info@futureenlightenment.org.uk?subject=' +
        encodeURIComponent(subject) + '&body=' + body;
      var success = document.getElementById('form-success');
      if (success) { success.classList.add('visible'); form.reset(); success.focus(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
