/* ==============================================================
   RESUME FORGE — APPLICATION LOGIC
   State management, form handling, live preview, PDF export
   ============================================================== */

(function () {
  'use strict';

  /* ============================================================
     STATE
     ============================================================ */
  const DEFAULT_STATE = {
    currentStep: 0,
    activeTemplate: 'modern',
    previewZoom: 0.42,
    data: {
      firstName: '', lastName: '', jobTitle: '', email: '', phone: '',
      location: '', website: '', linkedin: '', summary: '', photo: '',
      experience: [],
      education: [],
      techSkills: [],
      softSkills: [],
      languages: [],
      projects: [],
      certifications: [],
    }
  };

  let state = deepClone(DEFAULT_STATE);

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /* ============================================================
     SUPABASE INIT
     ============================================================ */
  // Replace these with the actual URL and Anon Key from your Supabase dashboard
  const SUPABASE_URL = 'https://mcwfcsinuezljyovflnb.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_TUKLZoEBRCFsdErT_1iXhQ_mC8rR1u-';

  let supabaseClient = null;
  let currentUser = null;

  if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  /* ============================================================
     DOM REFS
     ============================================================ */
  const $ = id => document.getElementById(id);
  const formSteps = document.querySelectorAll('.form-step');
  const navSteps = document.querySelectorAll('.step-item');
  const btnPrev = $('btn-prev');
  const btnNext = $('btn-next');
  const progressFill = $('progress-fill');
  const progressPct = $('progress-pct');
  const resumeOutput = $('resume-output');
  const previewPaper = $('preview-paper');
  const templateCards = document.querySelectorAll('.template-card');
  const btnReset = $('reset-btn');
  const btnDlHeader = $('download-btn');
  const btnDlPreview = $('btn-download-preview');
  const headerMenuToggle = $('action-menu-btn');
  const headerMenu = $('header-menu');
  const menuAuthBtn = $('auth-header-btn');
  const menuResetBtn = $('reset-btn');
  const menuDownloadBtn = $('download-btn');
  const modalReset = $('modal-reset');
  const modalCancel = $('modal-cancel');
  const modalConfirm = $('modal-confirm-reset');

  // Auth Elements
  const authModal = $('auth-modal');
  const authClose = $('auth-close');
  const authTitle = $('auth-title');
  const authError = $('auth-error');
  const authEmail = $('auth-email');
  const authPassword = $('auth-password');
  const authSubmitBtn = $('auth-submit-btn');
  const authToggleBtn = $('auth-toggle-btn');
  const authSwitchText = $('auth-switch-text');
  const zoomIn = $('zoom-in');
  const zoomOut = $('zoom-out');
  const zoomPct = $('zoom-pct');
  const photoUploadArea = $('photo-upload-area');
  const photoUploadInput = $('photo-upload');
  const photoPreview = $('photo-preview');
  const summaryTA = $('summary');
  const summaryCount = $('summary-count');

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    closeHeaderMenu();
    loadFromStorage();
    restoreFormFields();
    renderAllDynamicLists();
    renderSkillTags();
    applyStep(state.currentStep);
    applyZoom();
    updatePreview();
    bindEvents();
    if (supabaseClient) {
      checkAuthSession();
    }
  }

  /* ============================================================
     AUTH LOGIC
     ============================================================ */
  let isSignUpMode = false;

  async function checkAuthSession() {
    if (!supabaseClient) return;

    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) {
      console.error('Supabase session error:', error);
      return;
    }

    currentUser = session?.user || null;
    updateAuthUI();

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      currentUser = session?.user || null;
      updateAuthUI();
    });
  }

  function updateAuthUI() {
    if (currentUser) {
      menuAuthBtn.textContent = 'Log Out';
      authModal.style.display = 'none';
    } else {
      menuAuthBtn.textContent = 'Log In / Sign Up';
    }
  }

  async function handleAuthSubmit() {
    const email = authEmail.value.trim();
    const password = authPassword.value;
    if (!email || !password) {
      showAuthError('Please enter both email and password.');
      return;
    }

    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = 'Please wait...';
    authError.style.display = 'none';

    try {
      let result;
      if (isSignUpMode) {
        result = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin || undefined,
          },
        });
      } else {
        result = await supabaseClient.auth.signInWithPassword({ email, password });
      }

      if (result.error) throw result.error;

      if (isSignUpMode) {
        const createdUser = result.data?.user;
        const hasSession = Boolean(result.data?.session);

        authEmail.value = '';
        authPassword.value = '';

        if (createdUser && !hasSession) {
          showToast('Account created. Please confirm your email to finish signing in.', 'success');
          authModal.style.display = 'none';
          return;
        }

        currentUser = createdUser;
        updateAuthUI();
        showToast('Account created and signed in successfully!', 'success');
        triggerDownload();
        return;
      }

      currentUser = result.data.user;
      updateAuthUI();
      authEmail.value = '';
      authPassword.value = '';

      showToast('Successfully authenticated!', 'success');
      triggerDownload();

    } catch (err) {
      showAuthError(err.message);
    } finally {
      authSubmitBtn.disabled = false;
      authSubmitBtn.textContent = isSignUpMode ? 'Sign Up' : 'Sign In';
    }
  }

  async function handleLogout() {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
      currentUser = null;
      updateAuthUI();
      showToast('Logged out successfully', 'info');
    }
  }

  function showAuthError(msg) {
    authError.textContent = msg;
    authError.style.display = 'block';
  }

  function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    authTitle.textContent = isSignUpMode ? 'Create an Account' : 'Sign In to Download';
    authSubmitBtn.textContent = isSignUpMode ? 'Sign Up' : 'Sign In';
    authSwitchText.textContent = isSignUpMode ? 'Already have an account?' : "Don't have an account?";
    authToggleBtn.textContent = isSignUpMode ? 'Sign In' : 'Sign Up';
    authError.style.display = 'none';
  }

  /* ============================================================
     STORAGE
     ============================================================ */
  function saveToStorage() {
    try {
      localStorage.setItem('resumeforge_state', JSON.stringify({
        activeTemplate: state.activeTemplate,
        previewZoom: state.previewZoom,
        data: state.data,
      }));
    } catch (e) { /* quota */ }
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem('resumeforge_state');
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.data) state.data = { ...DEFAULT_STATE.data, ...saved.data };
      if (saved.activeTemplate) state.activeTemplate = saved.activeTemplate;
      if (saved.previewZoom) state.previewZoom = saved.previewZoom;
    } catch (e) { /* corrupt */ }
  }

  /* ============================================================
     STEP NAVIGATION
     ============================================================ */
  function applyStep(stepIdx) {
    state.currentStep = stepIdx;

    formSteps.forEach((s, i) => {
      s.classList.toggle('active', i === stepIdx);
    });

    navSteps.forEach((n, i) => {
      n.classList.toggle('active', i === stepIdx);
    });

    btnPrev.style.visibility = stepIdx === 0 ? 'hidden' : 'visible';
    const isLast = stepIdx === formSteps.length - 1;
    btnNext.innerHTML = isLast
      ? `Finish <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
      : `Next Step <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;

    updateProgress();
    saveToStorage();
  }

  function isSectionComplete(stepIdx) {
    const d = state.data;
    switch (stepIdx) {
      case 0: // Personal Info
        return Boolean(
          d.firstName && d.firstName.trim() &&
          d.lastName && d.lastName.trim() &&
          d.jobTitle && d.jobTitle.trim() &&
          d.email && d.email.trim() &&
          d.summary && d.summary.trim()
        );
      case 1: // Work Experience
        return Boolean(
          d.experience &&
          d.experience.length > 0 &&
          d.experience.every(e => e.role && e.role.trim() && e.company && e.company.trim())
        );
      case 2: // Education
        return Boolean(
          d.education &&
          d.education.length > 0 &&
          d.education.every(e => e.degree && e.degree.trim() && e.school && e.school.trim())
        );
      case 3: // Skills
        return Boolean(
          (d.techSkills && d.techSkills.length > 0) ||
          (d.softSkills && d.softSkills.length > 0) ||
          (d.languages && d.languages.some(l => l.name && l.name.trim()))
        );
      case 4: // Projects
        return Boolean(
          d.projects &&
          d.projects.length > 0 &&
          d.projects.every(p => p.title && p.title.trim())
        );
      case 5: // Certifications
        return Boolean(
          d.certifications &&
          d.certifications.length > 0 &&
          d.certifications.every(c => c.name && c.name.trim() && c.issuer && c.issuer.trim())
        );
      default:
        return false;
    }
  }

  function updateProgress() {
    const total = formSteps.length;
    let completedCount = 0;

    navSteps.forEach((n, i) => {
      const isComplete = isSectionComplete(i);
      n.classList.toggle('completed', isComplete);
      if (isComplete) {
        completedCount++;
      }
    });

    const pct = Math.round((completedCount / total) * 100);
    progressFill.style.width = pct + '%';
    progressPct.textContent = pct + '%';
  }

  /* ============================================================
     BIND EVENTS
     ============================================================ */
  function bindEvents() {
    btnNext.addEventListener('click', () => {
      if (state.currentStep < formSteps.length - 1) {
        applyStep(state.currentStep + 1);
      } else {
        showToast('Resume complete! Click Download PDF to save.', 'success');
      }
    });

    btnPrev.addEventListener('click', () => {
      if (state.currentStep > 0) applyStep(state.currentStep - 1);
    });

    navSteps.forEach((n, i) => {
      n.addEventListener('click', () => applyStep(i));
    });

    // Template switcher
    templateCards.forEach(card => {
      card.addEventListener('click', () => {
        state.activeTemplate = card.dataset.template;
        templateCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        updatePreview();
        saveToStorage();
      });
    });
    // Restore active template visual
    templateCards.forEach(c => {
      c.classList.toggle('active', c.dataset.template === state.activeTemplate);
    });

    // Zoom
    zoomIn.addEventListener('click', () => { state.previewZoom = Math.min(state.previewZoom + 0.05, 0.9); applyZoom(); });
    zoomOut.addEventListener('click', () => { state.previewZoom = Math.max(state.previewZoom - 0.05, 0.2); applyZoom(); });

    // Download
    btnDlHeader.addEventListener('click', () => {
      if (currentUser || !supabaseClient) triggerDownload();
      else authModal.style.display = 'flex';
    });
    menuDownloadBtn.addEventListener('click', () => {
      closeHeaderMenu();
      if (currentUser || !supabaseClient) triggerDownload();
      else authModal.style.display = 'flex';
    });
    btnDlPreview.addEventListener('click', () => {
      if (currentUser || !supabaseClient) triggerDownload();
      else authModal.style.display = 'flex';
    });

    // Header action menu
    headerMenuToggle.addEventListener('click', () => {
      const isOpen = headerMenu.hasAttribute('hidden') === false;
      if (isOpen) closeHeaderMenu();
      else openHeaderMenu();
    });

    document.addEventListener('click', e => {
      if (!headerMenu.contains(e.target) && !headerMenuToggle.contains(e.target)) {
        closeHeaderMenu();
      }
    });

    // Auth Modal
    menuAuthBtn.addEventListener('click', () => {
      closeHeaderMenu();
      if (currentUser) handleLogout();
      else authModal.style.display = 'flex';
    });
    authClose.addEventListener('click', () => { authModal.style.display = 'none'; });
    authToggleBtn.addEventListener('click', toggleAuthMode);
    authSubmitBtn.addEventListener('click', handleAuthSubmit);

    // Reset
    btnReset.addEventListener('click', () => { modalReset.hidden = false; });
    menuResetBtn.addEventListener('click', () => {
      closeHeaderMenu();
      modalReset.hidden = false;
    });
    modalCancel.addEventListener('click', () => { modalReset.hidden = true; });
    modalConfirm.addEventListener('click', () => {
      state = deepClone(DEFAULT_STATE);
      localStorage.removeItem('resumeforge_state');
      location.reload();
    });
    modalReset.addEventListener('click', e => {
      if (e.target === modalReset) modalReset.hidden = true;
    });

    // Photo upload
    photoUploadArea.addEventListener('click', () => photoUploadInput.click());
    photoUploadInput.addEventListener('change', handlePhotoUpload);

    // Summary char count
    summaryTA.addEventListener('input', () => {
      const len = summaryTA.value.length;
      summaryCount.textContent = len;
      if (len > 500) summaryTA.value = summaryTA.value.slice(0, 500);
    });

    // Personal info fields
    document.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('input', () => {
        state.data[el.dataset.field] = el.value;
        updatePreview();
        saveToStorage();
        updateProgress();
      });
    });

    // Dynamic sections
    $('add-experience').addEventListener('click', () => addEntry('experience'));
    $('add-education').addEventListener('click', () => addEntry('education'));
    $('add-project').addEventListener('click', () => addEntry('projects'));
    $('add-certification').addEventListener('click', () => addEntry('certifications'));
    $('add-language').addEventListener('click', () => addLanguage());

    // Skill tag inputs
    setupTagInput('tech-skill-input', 'tech-tags-display', 'techSkills');
    setupTagInput('soft-skill-input', 'soft-tags-display', 'softSkills');
  }

  function openHeaderMenu() {
    headerMenu.hidden = false;
    headerMenu.style.display = 'flex';
    headerMenuToggle.setAttribute('aria-expanded', 'true');
  }

  function closeHeaderMenu() {
    headerMenu.hidden = true;
    headerMenu.style.display = 'none';
    headerMenuToggle.setAttribute('aria-expanded', 'false');
  }

  /* ============================================================
     PHOTO UPLOAD
     ============================================================ */
  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Image too large (max 5MB)', 'error'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      state.data.photo = ev.target.result;
      photoPreview.innerHTML = `<img src="${ev.target.result}" alt="profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`;
      updatePreview();
      saveToStorage();
      updateProgress();
    };
    reader.readAsDataURL(file);
  }

  /* ============================================================
     RESTORE FORM FIELDS FROM STATE
     ============================================================ */
  function restoreFormFields() {
    document.querySelectorAll('[data-field]').forEach(el => {
      const val = state.data[el.dataset.field];
      if (val !== undefined) el.value = val;
    });
    if (state.data.photo) {
      photoPreview.innerHTML = `<img src="${state.data.photo}" alt="profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`;
    }
    if (summaryTA) summaryCount.textContent = summaryTA.value.length;
  }

  /* ============================================================
     TAG INPUT (Skills)
     ============================================================ */
  function setupTagInput(inputId, displayId, dataKey) {
    const input = $(inputId);
    const display = $(displayId);
    if (!input || !display) return;

    function renderTags() {
      display.innerHTML = (state.data[dataKey] || []).map((tag, i) => `
        <span class="tag-chip">
          ${escHtml(tag)}
          <button type="button" data-idx="${i}" data-key="${dataKey}" aria-label="Remove ${tag}">×</button>
        </span>`).join('');
    }

    display.addEventListener('click', e => {
      const btn = e.target.closest('button[data-idx]');
      if (!btn) return;
      const idx = parseInt(btn.dataset.idx);
      state.data[btn.dataset.key].splice(idx, 1);
      renderTags();
      updatePreview();
      saveToStorage();
      updateProgress();
    });

    function addTag() {
      const val = input.value.replace(/,/g, '').trim();
      if (!val) return;
      if (!state.data[dataKey]) state.data[dataKey] = [];
      if (!state.data[dataKey].includes(val)) {
        state.data[dataKey].push(val);
        renderTags();
        updatePreview();
        saveToStorage();
        updateProgress();
      }
      input.value = '';
    }

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
      if (e.key === 'Backspace' && !input.value && state.data[dataKey]?.length) {
        state.data[dataKey].pop();
        renderTags();
        updatePreview();
        saveToStorage();
        updateProgress();
      }
    });

    renderTags();
  }

  function renderSkillTags() {
    // Re-render both tag displays on load (setup called in bindEvents, so this is just a pass)
  }

  /* ============================================================
     DYNAMIC ENTRY CARDS (Experience, Education, Projects, Certs)
     ============================================================ */
  const ENTRY_CONFIGS = {
    experience: {
      listId: 'experience-list',
      defaultItem: () => ({ role: '', company: '', startDate: '', endDate: '', current: false, description: '' }),
      render: renderExperienceCard,
    },
    education: {
      listId: 'education-list',
      defaultItem: () => ({ degree: '', school: '', year: '', gpa: '' }),
      render: renderEducationCard,
    },
    projects: {
      listId: 'projects-list',
      defaultItem: () => ({ title: '', description: '', tech: '', url: '' }),
      render: renderProjectCard,
    },
    certifications: {
      listId: 'certifications-list',
      defaultItem: () => ({ name: '', issuer: '', date: '' }),
      render: renderCertCard,
    },
  };

  function addEntry(key) {
    if (!state.data[key]) state.data[key] = [];
    state.data[key].push(ENTRY_CONFIGS[key].defaultItem());
    renderEntryList(key);
    updatePreview();
    saveToStorage();
    updateProgress();
  }

  function removeEntry(key, idx) {
    state.data[key].splice(idx, 1);
    renderEntryList(key);
    updatePreview();
    saveToStorage();
    updateProgress();
  }

  function renderAllDynamicLists() {
    Object.keys(ENTRY_CONFIGS).forEach(key => renderEntryList(key));
    renderLanguageList();
    // Re-setup tag inputs after restore
    setupTagInput('tech-skill-input', 'tech-tags-display', 'techSkills');
    setupTagInput('soft-skill-input', 'soft-tags-display', 'softSkills');
  }

  function renderEntryList(key) {
    const cfg = ENTRY_CONFIGS[key];
    const listEl = $(cfg.listId);
    if (!listEl) return;
    const items = state.data[key] || [];
    listEl.innerHTML = '';
    items.forEach((item, idx) => {
      const card = document.createElement('div');
      card.innerHTML = cfg.render(item, idx, key);
      listEl.appendChild(card.firstElementChild);
      bindEntryCard(listEl.lastElementChild, key, idx);
    });
    if (items.length === 0) {
      listEl.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:12px;">No entries yet. Click the button below to add one.</div>`;
    }
  }

  function bindEntryCard(card, key, idx) {
    // Remove button
    const removeBtn = card.querySelector('.btn-icon-remove');
    if (removeBtn) removeBtn.addEventListener('click', () => removeEntry(key, idx));

    // All inputs in the card
    card.querySelectorAll('input, textarea, select').forEach(el => {
      const field = el.dataset.field;
      if (!field) return;
      el.addEventListener('input', () => {
        state.data[key][idx][field] = el.type === 'checkbox' ? el.checked : el.value;
        updateEntryCardTitle(card, key, idx);
        updatePreview();
        saveToStorage();
        updateProgress();
      });
      el.addEventListener('change', () => {
        if (el.type === 'checkbox') {
          state.data[key][idx][field] = el.checked;
          const endDateInput = card.querySelector('[data-field="endDate"]');
          if (endDateInput) endDateInput.disabled = el.checked;
          updatePreview();
          saveToStorage();
          updateProgress();
        }
      });
    });
  }

  function updateEntryCardTitle(card, key, idx) {
    const titleEl = card.querySelector('.entry-card-title');
    const subtitleEl = card.querySelector('.entry-card-subtitle');
    if (!titleEl) return;
    const item = state.data[key][idx];
    if (key === 'experience') {
      titleEl.textContent = `Position #${idx + 1}`;
      if (subtitleEl) subtitleEl.textContent = item.role ? `${item.role}${item.company ? ' at ' + item.company : ''}` : '';
    } else if (key === 'education') {
      titleEl.textContent = `Education #${idx + 1}`;
      if (subtitleEl) subtitleEl.textContent = item.degree ? `${item.degree}${item.school ? ' · ' + item.school : ''}` : '';
    } else if (key === 'projects') {
      titleEl.textContent = `Project #${idx + 1}`;
      if (subtitleEl) subtitleEl.textContent = item.title || '';
    } else if (key === 'certifications') {
      titleEl.textContent = `Certification #${idx + 1}`;
      if (subtitleEl) subtitleEl.textContent = item.name ? `${item.name}${item.issuer ? ' · ' + item.issuer : ''}` : '';
    }
  }

  /* -- Render functions for each entry type -- */

  function renderExperienceCard(item, idx, key) {
    return `
<div class="entry-card" data-key="${key}" data-idx="${idx}">
  <div class="entry-card-header">
    <div>
      <div class="entry-card-title">Position #${idx + 1}</div>
      <div class="entry-card-subtitle">${escHtml(item.role ? `${item.role}${item.company ? ' at ' + item.company : ''}` : '')}</div>
    </div>
    <div class="entry-card-actions">
      <button class="btn-icon-remove" title="Remove" aria-label="Remove entry">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
      </button>
    </div>
  </div>
  <div class="entry-form-grid">
    <div class="form-group">
      <label class="form-label">Job Title / Role</label>
      <input type="text" class="form-input" placeholder="e.g. Software Engineer" data-field="role" value="${escHtml(item.role || '')}" />
    </div>
    <div class="form-group">
      <label class="form-label">Company</label>
      <input type="text" class="form-input" placeholder="e.g. Google" data-field="company" value="${escHtml(item.company || '')}" />
    </div>
    <div class="form-group">
      <label class="form-label">Start Date</label>
      <input type="text" class="form-input" placeholder="Jan 2022" data-field="startDate" value="${escHtml(item.startDate || '')}" />
    </div>
    <div class="form-group">
      <label class="form-label">End Date</label>
      <div class="date-range-row" style="display:flex;gap:8px;align-items:center">
        <input type="text" class="form-input" placeholder="Dec 2023" data-field="endDate" value="${escHtml(item.endDate || '')}" ${item.current ? 'disabled' : ''} style="flex:1" />
        <label class="current-toggle" style="white-space:nowrap">
          <label class="toggle-switch">
            <input type="checkbox" data-field="current" ${item.current ? 'checked' : ''} />
            <span class="toggle-slider"></span>
          </label>
          <span class="toggle-label">Current</span>
        </label>
      </div>
    </div>
    <div class="form-group full">
      <label class="form-label">Description / Achievements</label>
      <textarea class="form-textarea" rows="3" placeholder="• Led a team of 5 engineers&#10;• Increased performance by 40%&#10;• Launched 3 major features" data-field="description">${escHtml(item.description || '')}</textarea>
    </div>
  </div>
</div>`;
  }

  function renderEducationCard(item, idx, key) {
    return `
<div class="entry-card" data-key="${key}" data-idx="${idx}">
  <div class="entry-card-header">
    <div>
      <div class="entry-card-title">Education #${idx + 1}</div>
      <div class="entry-card-subtitle">${escHtml(item.degree ? `${item.degree}${item.school ? ' · ' + item.school : ''}` : '')}</div>
    </div>
    <div class="entry-card-actions">
      <button class="btn-icon-remove" title="Remove" aria-label="Remove entry">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
      </button>
    </div>
  </div>
  <div class="entry-form-grid">
    <div class="form-group full">
      <label class="form-label">Degree / Qualification</label>
      <input type="text" class="form-input" placeholder="e.g. B.Tech Computer Science" data-field="degree" value="${escHtml(item.degree || '')}" />
    </div>
    <div class="form-group">
      <label class="form-label">School / University</label>
      <input type="text" class="form-input" placeholder="e.g. MIT" data-field="school" value="${escHtml(item.school || '')}" />
    </div>
    <div class="form-group">
      <label class="form-label">Graduation Year</label>
      <input type="text" class="form-input" placeholder="2023" data-field="year" value="${escHtml(item.year || '')}" />
    </div>
    <div class="form-group">
      <label class="form-label">GPA / Grade <span class="optional">(optional)</span></label>
      <input type="text" class="form-input" placeholder="3.8 / 4.0" data-field="gpa" value="${escHtml(item.gpa || '')}" />
    </div>
  </div>
</div>`;
  }

  function renderProjectCard(item, idx, key) {
    return `
<div class="entry-card" data-key="${key}" data-idx="${idx}">
  <div class="entry-card-header">
    <div>
      <div class="entry-card-title">Project #${idx + 1}</div>
      <div class="entry-card-subtitle">${escHtml(item.title || '')}</div>
    </div>
    <div class="entry-card-actions">
      <button class="btn-icon-remove" title="Remove" aria-label="Remove entry">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
      </button>
    </div>
  </div>
  <div class="entry-form-grid">
    <div class="form-group full">
      <label class="form-label">Project Title</label>
      <input type="text" class="form-input" placeholder="e.g. E-Commerce Platform" data-field="title" value="${escHtml(item.title || '')}" />
    </div>
    <div class="form-group">
      <label class="form-label">Tech Stack</label>
      <input type="text" class="form-input" placeholder="React, Node.js, MongoDB" data-field="tech" value="${escHtml(item.tech || '')}" />
    </div>
    <div class="form-group">
      <label class="form-label">Project URL <span class="optional">(optional)</span></label>
      <input type="url" class="form-input" placeholder="https://github.com/..." data-field="url" value="${escHtml(item.url || '')}" />
    </div>
    <div class="form-group full">
      <label class="form-label">Description</label>
      <textarea class="form-textarea" rows="3" placeholder="Built a full-stack e-commerce platform with real-time inventory tracking..." data-field="description">${escHtml(item.description || '')}</textarea>
    </div>
  </div>
</div>`;
  }

  function renderCertCard(item, idx, key) {
    return `
<div class="entry-card" data-key="${key}" data-idx="${idx}">
  <div class="entry-card-header">
    <div>
      <div class="entry-card-title">Certification #${idx + 1}</div>
      <div class="entry-card-subtitle">${escHtml(item.name ? `${item.name}${item.issuer ? ' · ' + item.issuer : ''}` : '')}</div>
    </div>
    <div class="entry-card-actions">
      <button class="btn-icon-remove" title="Remove" aria-label="Remove entry">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
      </button>
    </div>
  </div>
  <div class="entry-form-grid">
    <div class="form-group full">
      <label class="form-label">Certification Name</label>
      <input type="text" class="form-input" placeholder="e.g. AWS Certified Solutions Architect" data-field="name" value="${escHtml(item.name || '')}" />
    </div>
    <div class="form-group">
      <label class="form-label">Issuing Organization</label>
      <input type="text" class="form-input" placeholder="e.g. Amazon Web Services" data-field="issuer" value="${escHtml(item.issuer || '')}" />
    </div>
    <div class="form-group">
      <label class="form-label">Date</label>
      <input type="text" class="form-input" placeholder="March 2024" data-field="date" value="${escHtml(item.date || '')}" />
    </div>
  </div>
</div>`;
  }

  /* ============================================================
     LANGUAGES
     ============================================================ */
  function addLanguage() {
    state.data.languages.push({ name: '', level: 'Fluent' });
    renderLanguageList();
    saveToStorage();
    updateProgress();
  }

  function renderLanguageList() {
    const list = $('languages-list');
    if (!list) return;
    list.innerHTML = '';
    (state.data.languages || []).forEach((lang, idx) => {
      const row = document.createElement('div');
      row.className = 'language-entry';
      row.innerHTML = `
        <input type="text" class="form-input" placeholder="Language" value="${escHtml(lang.name || '')}" />
        <select class="form-select">
          ${['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic'].map(l =>
        `<option value="${l}" ${lang.level === l ? 'selected' : ''}>${l}</option>`
      ).join('')}
        </select>
        <button class="btn-icon-remove" title="Remove language">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>`;

      const input = row.querySelector('input');
      const select = row.querySelector('select');
      const removeBtn = row.querySelector('.btn-icon-remove');

      input.addEventListener('input', () => {
        state.data.languages[idx].name = input.value;
        updatePreview();
        saveToStorage();
        updateProgress();
      });
      select.addEventListener('change', () => {
        state.data.languages[idx].level = select.value;
        updatePreview();
        saveToStorage();
        updateProgress();
      });
      removeBtn.addEventListener('click', () => {
        state.data.languages.splice(idx, 1);
        renderLanguageList();
        updatePreview();
        saveToStorage();
        updateProgress();
      });

      list.appendChild(row);
    });
  }

  /* ============================================================
     LIVE PREVIEW
     ============================================================ */
  let previewTimer = null;

  function updatePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      const renderer = window.ResumeTemplates && window.ResumeTemplates[state.activeTemplate];
      if (!renderer) return;
      try {
        resumeOutput.innerHTML = renderer(state.data);
      } catch (err) {
        console.error('Template render error:', err);
      }
    }, 60);
  }

  /* ============================================================
     ZOOM
     ============================================================ */
  function applyZoom() {
    const z = state.previewZoom;
    previewPaper.style.transform = `scale(${z})`;
    previewPaper.style.transformOrigin = 'top center';
    // Adjust the viewport height to account for the scaled paper
    const paperH = 1123 * z;
    previewPaper.parentElement.style.minHeight = (paperH + 32) + 'px';
    zoomPct.textContent = Math.round(z * 100) + '%';
  }

  /* ============================================================
     PDF DOWNLOAD
     ============================================================ */
  function triggerDownload() {
    const renderer = window.ResumeTemplates && window.ResumeTemplates[state.activeTemplate];
    if (!renderer) { showToast('Template not found', 'error'); return; }

    const printArea = $('print-area');
    printArea.innerHTML = renderer(state.data);
    printArea.hidden = false;

    showToast('Opening print dialog…', 'info');

    // Small delay to let styles paint
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        printArea.hidden = true;
        printArea.innerHTML = '';
      }, 1000);
    }, 300);
  }

  /* ============================================================
     TOAST
     ============================================================ */
  let toastTimer = null;
  function showToast(msg, type = 'info') {
    const toast = $('toast');
    toast.textContent = msg;
    toast.className = `toast show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  /* ============================================================
     UTILS
     ============================================================ */
  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ============================================================
     BOOT
     ============================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
