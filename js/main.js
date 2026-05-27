/* ==============================================
   Future Enlightenment – Main JS
   ============================================== */
(function () {
  'use strict';

  var LANGS = {
    en: { native: 'English',   code: 'EN', greet: 'Welcome' },
    fr: { native: 'Français',  code: 'FR', greet: 'Bienvenue' },
    ro: { native: 'Română',    code: 'RO', greet: 'Bun venit' },
    pl: { native: 'Polski',    code: 'PL', greet: 'Witamy' },
    el: { native: 'Ελληνικά', code: 'EL', greet: 'Καλώς ήρθατε' },
    ln: { native: 'Lingála',   code: 'LN', greet: 'Boyei bolamu' },
  };

  var LANG_OFFERS = {
    fr: { offer: 'Lire ce site en français ?',        switchBtn: 'Passer au français',     dismiss: "Garder l'anglais" },
    ro: { offer: 'Vrei să citești site-ul în română?', switchBtn: 'Treci la română',         dismiss: 'Păstrează engleza' },
    pl: { offer: 'Czytać tę stronę po polsku?',       switchBtn: 'Przełącz na polski',      dismiss: 'Zostaw angielski' },
    el: { offer: 'Να διαβάσετε τον ιστότοπο στα ελληνικά;', switchBtn: 'Αλλαγή στα ελληνικά', dismiss: 'Παραμονή στα αγγλικά' },
    ln: { offer: 'Tángá site oyo na Lingála?',        switchBtn: 'Bongola na Lingála',      dismiss: 'Tika na Angílí' },
  };

  var currentLang = localStorage.getItem('fe_lang') || 'en';
  var darkMode    = localStorage.getItem('fe_dark') === '1';

  function init() {
    applyDarkMode();
    applyLanguage(currentLang);
    wireNav();
    wireControls();
    wireLangSwitcher();
    wireLangBanner();
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

    /* Update lang-trigger button */
    var info = LANGS[lang] || LANGS.en;
    var nativeEl = document.getElementById('lang-native');
    var codeEl   = document.getElementById('lang-code');
    var trigger  = document.getElementById('lang-trigger');
    if (nativeEl) nativeEl.textContent = info.native;
    if (codeEl)   codeEl.textContent   = info.code;
    if (trigger)  trigger.setAttribute('aria-label', 'Language: ' + info.native);

    /* Update active option in panel */
    document.querySelectorAll('.lang-option').forEach(function (btn) {
      var isActive = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      var check = btn.querySelector('.lang-check');
      if (check) check.style.display = isActive ? '' : 'none';
    });
  }

  /* ---- Dark mode ---- */
  function applyDarkMode() {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('fe_dark', darkMode ? '1' : '0');
    var btn = document.getElementById('contrast-toggle');
    if (btn) btn.setAttribute('aria-label', darkMode ? 'Switch to light mode' : 'Switch to dark mode');
  }

  /* ---- Wire theme toggle + legacy lang-select ---- */
  function wireControls() {
    var con  = document.getElementById('contrast-toggle');
    var lang = document.getElementById('lang-select');
    if (con)  con.addEventListener('click',  function () { darkMode = !darkMode; applyDarkMode(); });
    if (lang) lang.addEventListener('change', function () { applyLanguage(this.value); });
  }

  /* ---- Lang switcher popover ---- */
  function wireLangSwitcher() {
    var switcher = document.getElementById('lang-switcher');
    var trigger  = document.getElementById('lang-trigger');
    var panel    = document.getElementById('lang-panel');
    if (!switcher || !trigger || !panel) return;

    function openPanel() {
      panel.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function closePanel() {
      panel.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }
    function togglePanel() {
      if (panel.classList.contains('is-open')) closePanel(); else openPanel();
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      togglePanel();
    });

    document.addEventListener('click', function (e) {
      if (!switcher.contains(e.target)) closePanel();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePanel();
    });

    panel.querySelectorAll('.lang-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLanguage(btn.getAttribute('data-lang'));
        closePanel();
      });
    });
  }

  /* ---- Language auto-detect banner ---- */
  function wireLangBanner() {
    try {
      if (localStorage.getItem('fe_lang')) return;
      if (localStorage.getItem('fe_lang_dismissed')) return;
      var browser = (navigator.language || 'en').split('-')[0].toLowerCase();
      if (browser === 'en' || !LANGS[browser] || !LANG_OFFERS[browser]) return;
      setTimeout(function () { showLangBanner(browser); }, 350);
    } catch (e) {}
  }

  function showLangBanner(detected) {
    var info = LANGS[detected];
    var offers = LANG_OFFERS[detected];
    var header = document.querySelector('.site-header');
    if (!header) return;

    var banner = document.createElement('div');
    banner.className = 'lang-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Language suggestion');
    banner.setAttribute('lang', detected);
    banner.innerHTML =
      '<div class="lang-banner-inner container">' +
        '<div class="lang-banner-globe" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></svg>' +
        '</div>' +
        '<div class="lang-banner-text">' +
          '<strong class="lang-banner-native">' + info.greet + '.</strong>' +
          '<span class="lang-banner-offer">' + offers.offer + '</span>' +
        '</div>' +
        '<div class="lang-banner-actions">' +
          '<button class="btn btn-sm lang-banner-switch">' + offers.switchBtn + '</button>' +
          '<button class="lang-banner-close" aria-label="' + offers.dismiss + '" title="' + offers.dismiss + '">' +
            '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>';

    header.insertAdjacentElement('afterend', banner);

    banner.querySelector('.lang-banner-switch').addEventListener('click', function () {
      applyLanguage(detected);
      try { localStorage.setItem('fe_lang_dismissed', '1'); } catch (e) {}
      banner.remove();
    });
    banner.querySelector('.lang-banner-close').addEventListener('click', function () {
      try { localStorage.setItem('fe_lang_dismissed', '1'); } catch (e) {}
      banner.remove();
    });
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
