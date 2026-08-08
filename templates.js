/* ==============================================================
   RESUME FORGE — TEMPLATE RENDERERS
   Four templates: Modern, Classic, Creative, Minimal
   Each renderer receives the app `data` object and returns HTML.
   ============================================================== */

window.ResumeTemplates = {

  /* ============================================================
     TEMPLATE 1: MODERN
     Two-column layout with a dark left sidebar
     ============================================================ */
  modern(data) {
    const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Your Name';
    const photo = data.photo ? `<img src="${data.photo}" alt="profile" />` : '';
    const initials = ((data.firstName || '')[0] || '') + ((data.lastName || '')[0] || '');

    const contactItems = [
      data.email && `<div class="m-contact-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>${data.email}</div>`,
      data.phone && `<div class="m-contact-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.02-.93a2 2 0 0 1 2.12-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>${data.phone}</div>`,
      data.location && `<div class="m-contact-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${data.location}</div>`,
      data.linkedin && `<div class="m-contact-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>${data.linkedin.replace('https://', '')}</div>`,
      data.website && `<div class="m-contact-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>${data.website.replace('https://', '')}</div>`,
    ].filter(Boolean).join('');

    const techSkills = (data.techSkills || []).map(s =>
      `<span class="m-skill-tag">${s}</span>`).join('');
    const softSkills = (data.softSkills || []).map(s =>
      `<span class="m-skill-tag soft">${s}</span>`).join('');
    const languages = (data.languages || []).map(l =>
      `<div class="m-lang"><span>${l.name}</span><span class="m-lang-level">${l.level}</span></div>`).join('');

    const certifications = (data.certifications || []).map(c => `
      <div class="m-cert">
        <div class="m-cert-name">${c.name || ''}</div>
        <div class="m-cert-meta">${c.issuer || ''} ${c.date ? '· ' + c.date : ''}</div>
      </div>`).join('');

    const experience = (data.experience || []).map(e => `
      <div class="m-entry">
        <div class="m-entry-header">
          <div>
            <div class="m-entry-title">${e.role || 'Role'}</div>
            <div class="m-entry-org">${e.company || ''}</div>
          </div>
          <div class="m-entry-date">${e.startDate || ''}${e.current ? ' – Present' : e.endDate ? ' – ' + e.endDate : ''}</div>
        </div>
        ${e.description ? `<p class="m-entry-desc">${e.description.replace(/\n/g, '<br/>')}</p>` : ''}
      </div>`).join('');

    const education = (data.education || []).map(e => `
      <div class="m-entry">
        <div class="m-entry-header">
          <div>
            <div class="m-entry-title">${e.degree || 'Degree'}</div>
            <div class="m-entry-org">${e.school || ''}</div>
          </div>
          <div class="m-entry-date">${e.year || ''}</div>
        </div>
        ${e.gpa ? `<div class="m-entry-desc">GPA: ${e.gpa}</div>` : ''}
      </div>`).join('');

    const projects = (data.projects || []).map(p => `
      <div class="m-entry">
        <div class="m-entry-header">
          <div class="m-entry-title">${p.title || 'Project'}</div>
          ${p.url ? `<a href="${p.url}" class="m-entry-date" style="color:#4fc3f7">${p.url.replace('https://', '')}</a>` : ''}
        </div>
        ${p.tech ? `<div class="m-tech-chips">${p.tech.split(',').map(t => `<span>${t.trim()}</span>`).join('')}</div>` : ''}
        ${p.description ? `<p class="m-entry-desc">${p.description}</p>` : ''}
      </div>`).join('');

    return `
<style>
  .modern-resume { display:flex; min-height:1123px; font-family:'Inter',sans-serif; font-size:12px; line-height:1.5; color:#1a1a2e; }
  .m-sidebar { width:220px; background:linear-gradient(160deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%); color:#e0e0f0; padding:28px 18px; display:flex; flex-direction:column; gap:22px; flex-shrink:0; }
  .m-photo { width:90px; height:90px; border-radius:50%; overflow:hidden; margin:0 auto; border:3px solid rgba(79,195,247,0.5); background:rgba(79,195,247,0.15); display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:700; color:#4fc3f7; }
  .m-photo img { width:100%; height:100%; object-fit:cover; }
  .m-sidebar-section { }
  .m-sidebar-heading { font-size:9px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#4fc3f7; border-bottom:1px solid rgba(79,195,247,0.2); padding-bottom:5px; margin-bottom:8px; }
  .m-contact-item { display:flex; align-items:flex-start; gap:7px; font-size:10.5px; color:#b0bec5; margin-bottom:5px; word-break:break-all; }
  .m-contact-item svg { flex-shrink:0; margin-top:1px; color:#4fc3f7; }
  .m-skill-tags { display:flex; flex-wrap:wrap; gap:5px; }
  .m-skill-tag { padding:3px 8px; background:rgba(79,195,247,0.15); border:1px solid rgba(79,195,247,0.25); border-radius:99px; font-size:10px; font-weight:500; color:#81d4fa; }
  .m-skill-tag.soft { background:rgba(186,104,200,0.15); border-color:rgba(186,104,200,0.25); color:#ce93d8; }
  .m-lang { display:flex; justify-content:space-between; font-size:10.5px; color:#b0bec5; margin-bottom:4px; }
  .m-lang-level { color:#4fc3f7; font-weight:500; }
  .m-cert { margin-bottom:8px; }
  .m-cert-name { font-size:11px; font-weight:600; color:#e0e0f0; }
  .m-cert-meta { font-size:10px; color:#90a4ae; margin-top:1px; }
  .m-main { flex:1; padding:32px 28px; }
  .m-name { font-family:'Playfair Display',serif; font-size:26px; font-weight:700; color:#1a1a2e; line-height:1.1; margin-bottom:3px; }
  .m-job-title { font-size:13px; color:#4fc3f7; font-weight:600; letter-spacing:0.5px; margin-bottom:18px; }
  .m-divider { height:2px; background:linear-gradient(90deg,#4fc3f7,transparent); border-radius:99px; margin:16px 0 12px; }
  .m-section-title { font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#4fc3f7; margin-bottom:10px; }
  .m-summary { font-size:11.5px; color:#37474f; line-height:1.7; }
  .m-entry { margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid #f0f4f8; }
  .m-entry:last-child { border-bottom:none; margin-bottom:0; }
  .m-entry-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:3px; }
  .m-entry-title { font-size:12.5px; font-weight:700; color:#1a1a2e; }
  .m-entry-org { font-size:11px; color:#546e7a; margin-top:1px; }
  .m-entry-date { font-size:10px; color:#78909c; white-space:nowrap; margin-left:8px; padding-top:2px; }
  .m-entry-desc { font-size:11px; color:#455a64; line-height:1.7; margin-top:5px; }
  .m-tech-chips { display:flex; flex-wrap:wrap; gap:4px; margin:4px 0; }
  .m-tech-chips span { padding:2px 7px; background:#e3f2fd; border-radius:4px; font-size:9.5px; font-weight:600; color:#1565c0; }
</style>
<div class="modern-resume">
  <aside class="m-sidebar">
    <div class="m-photo">${data.photo ? `<img src="${data.photo}" alt="photo"/>` : (initials || '?')}</div>
    ${contactItems ? `<div class="m-sidebar-section"><div class="m-sidebar-heading">Contact</div>${contactItems}</div>` : ''}
    ${techSkills ? `<div class="m-sidebar-section"><div class="m-sidebar-heading">Technical Skills</div><div class="m-skill-tags">${techSkills}</div></div>` : ''}
    ${softSkills ? `<div class="m-sidebar-section"><div class="m-sidebar-heading">Soft Skills</div><div class="m-skill-tags">${softSkills}</div></div>` : ''}
    ${languages ? `<div class="m-sidebar-section"><div class="m-sidebar-heading">Languages</div>${languages}</div>` : ''}
    ${certifications ? `<div class="m-sidebar-section"><div class="m-sidebar-heading">Certifications</div>${certifications}</div>` : ''}
  </aside>
  <main class="m-main">
    <div class="m-name">${name}</div>
    ${data.jobTitle ? `<div class="m-job-title">${data.jobTitle}</div>` : ''}
    ${data.summary ? `<div><div class="m-section-title">About Me</div><p class="m-summary">${data.summary}</p></div><div class="m-divider"></div>` : ''}
    ${experience ? `<div class="m-section-title">Experience</div>${experience}<div class="m-divider"></div>` : ''}
    ${education ? `<div class="m-section-title">Education</div>${education}<div class="m-divider"></div>` : ''}
    ${projects ? `<div class="m-section-title">Projects</div>${projects}` : ''}
  </main>
</div>`;
  },

  /* ============================================================
     TEMPLATE 2: CLASSIC
     Elegant single-column with header bar
     ============================================================ */
  classic(data) {
    const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Your Name';

    const contactParts = [
      data.email, data.phone, data.location, data.website
    ].filter(Boolean).join('  ·  ');

    const experience = (data.experience || []).map(e => `
      <div class="cl-entry">
        <div class="cl-entry-row">
          <div>
            <div class="cl-entry-title">${e.role || 'Role'}</div>
            <div class="cl-entry-org">${e.company || ''}</div>
          </div>
          <div class="cl-entry-date">${e.startDate || ''}${e.current ? ' – Present' : e.endDate ? ' – ' + e.endDate : ''}</div>
        </div>
        ${e.description ? `<p class="cl-entry-desc">${e.description.replace(/\n/g, '<br/>')}</p>` : ''}
      </div>`).join('');

    const education = (data.education || []).map(e => `
      <div class="cl-entry">
        <div class="cl-entry-row">
          <div>
            <div class="cl-entry-title">${e.degree || 'Degree'}</div>
            <div class="cl-entry-org">${e.school || ''}</div>
          </div>
          <div class="cl-entry-date">${e.year || ''}</div>
        </div>
        ${e.gpa ? `<div class="cl-entry-desc">GPA: ${e.gpa}</div>` : ''}
      </div>`).join('');

    const allSkills = [...(data.techSkills || []), ...(data.softSkills || [])];
    const skills = allSkills.map(s => `<span class="cl-skill">${s}</span>`).join('');

    const projects = (data.projects || []).map(p => `
      <div class="cl-entry">
        <div class="cl-entry-row">
          <div class="cl-entry-title">${p.title || 'Project'}${p.tech ? ` <span class="cl-tech">| ${p.tech}</span>` : ''}</div>
          ${p.url ? `<a href="${p.url}" class="cl-entry-date">${p.url.replace('https://', '')}</a>` : ''}
        </div>
        ${p.description ? `<p class="cl-entry-desc">${p.description}</p>` : ''}
      </div>`).join('');

    const certifications = (data.certifications || []).map(c =>
      `<div class="cl-cert"><span class="cl-cert-name">${c.name || ''}</span>${c.issuer ? ` — ${c.issuer}` : ''}${c.date ? `, ${c.date}` : ''}</div>`
    ).join('');

    const languages = (data.languages || []).map(l =>
      `<span class="cl-skill">${l.name} (${l.level})</span>`
    ).join('');

    function section(title, content) {
      if (!content) return '';
      return `<div class="cl-section"><div class="cl-section-title">${title}</div><div class="cl-rule"></div>${content}</div>`;
    }

    return `
<style>
  .classic-resume { font-family:'DM Sans','Inter',sans-serif; font-size:12px; line-height:1.55; color:#2c2c2c; background:white; padding:40px 44px; min-height:1123px; }
  .cl-header { text-align:center; padding-bottom:20px; border-bottom:2px solid #2c3e50; margin-bottom:20px; }
  .cl-name { font-family:'Playfair Display',serif; font-size:32px; font-weight:700; color:#2c3e50; letter-spacing:-0.5px; line-height:1.1; }
  .cl-job-title { font-size:14px; font-weight:600; color:#2980b9; letter-spacing:1px; text-transform:uppercase; margin-top:6px; }
  .cl-contact { font-size:10.5px; color:#666; margin-top:8px; }
  .cl-section { margin-bottom:16px; }
  .cl-section-title { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#2c3e50; margin-bottom:5px; }
  .cl-rule { height:1px; background:linear-gradient(90deg,#2c3e50 0%,transparent 100%); margin-bottom:10px; }
  .cl-entry { margin-bottom:10px; }
  .cl-entry-row { display:flex; justify-content:space-between; align-items:flex-start; }
  .cl-entry-title { font-size:12.5px; font-weight:700; color:#1a1a1a; }
  .cl-entry-org { font-size:11px; color:#666; font-style:italic; }
  .cl-entry-date { font-size:10.5px; color:#888; white-space:nowrap; margin-left:8px; }
  .cl-entry-desc { font-size:11px; color:#444; line-height:1.7; margin-top:4px; }
  .cl-tech { color:#2980b9; font-size:10.5px; font-weight:400; }
  .cl-skills { display:flex; flex-wrap:wrap; gap:6px; }
  .cl-skill { padding:3px 10px; border:1px solid #c8d6df; border-radius:3px; font-size:10.5px; color:#2c3e50; background:#f5f8fa; }
  .cl-cert { font-size:11px; color:#444; margin-bottom:4px; }
  .cl-cert-name { font-weight:600; color:#1a1a1a; }
  .cl-summary { font-size:11.5px; color:#444; line-height:1.8; }
</style>
<div class="classic-resume">
  <header class="cl-header">
    <div class="cl-name">${name}</div>
    ${data.jobTitle ? `<div class="cl-job-title">${data.jobTitle}</div>` : ''}
    ${contactParts ? `<div class="cl-contact">${contactParts}</div>` : ''}
    ${data.linkedin ? `<div class="cl-contact">${data.linkedin}</div>` : ''}
  </header>
  ${section('Professional Summary', data.summary ? `<p class="cl-summary">${data.summary}</p>` : '')}
  ${section('Work Experience', experience)}
  ${section('Education', education)}
  ${skills ? section('Skills', `<div class="cl-skills">${skills}</div>`) : ''}
  ${languages ? section('Languages', `<div class="cl-skills">${languages}</div>`) : ''}
  ${section('Projects', projects)}
  ${section('Certifications', certifications)}
</div>`;
  },

  /* ============================================================
     TEMPLATE 3: CREATIVE
     Bold dark header, two-column body
     ============================================================ */
  creative(data) {
    const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Your Name';
    const initials = ((data.firstName || '')[0] || '') + ((data.lastName || '')[0] || '');

    const experience = (data.experience || []).map(e => `
      <div class="cr-entry">
        <div class="cr-entry-dot"></div>
        <div class="cr-entry-body">
          <div class="cr-entry-title">${e.role || 'Role'}</div>
          <div class="cr-entry-meta">${e.company || ''}${e.startDate ? ' · ' + e.startDate : ''}${e.current ? ' – Present' : e.endDate ? ' – ' + e.endDate : ''}</div>
          ${e.description ? `<p class="cr-entry-desc">${e.description.replace(/\n/g, '<br/>')}</p>` : ''}
        </div>
      </div>`).join('');

    const projects = (data.projects || []).map(p => `
      <div class="cr-entry">
        <div class="cr-entry-dot" style="background:#ec4899"></div>
        <div class="cr-entry-body">
          <div class="cr-entry-title">${p.title || 'Project'}</div>
          ${p.tech ? `<div class="cr-entry-meta">${p.tech}</div>` : ''}
          ${p.description ? `<p class="cr-entry-desc">${p.description}</p>` : ''}
        </div>
      </div>`).join('');

    const education = (data.education || []).map(e => `
      <div class="cr-sidebar-edu">
        <div class="cr-edu-degree">${e.degree || 'Degree'}</div>
        <div class="cr-edu-school">${e.school || ''}</div>
        <div class="cr-edu-year">${e.year || ''}</div>
      </div>`).join('');

    const techSkills = (data.techSkills || []).map(s =>
      `<div class="cr-skill-bar"><span>${s}</span><div class="cr-bar"><div class="cr-bar-fill"></div></div></div>`).join('');
    const softSkills = (data.softSkills || []).map(s =>
      `<span class="cr-soft-tag">${s}</span>`).join('');
    const languages = (data.languages || []).map(l =>
      `<div class="cr-lang">${l.name} <span>${l.level}</span></div>`).join('');
    const certs = (data.certifications || []).map(c =>
      `<div class="cr-cert">🏆 ${c.name || ''}${c.issuer ? ` — ${c.issuer}` : ''}</div>`).join('');

    return `
<style>
  .creative-resume { font-family:'Inter',sans-serif; font-size:12px; min-height:1123px; display:flex; flex-direction:column; }
  .cr-header { background:linear-gradient(135deg,#1a0533 0%,#6d28d9 60%,#7c3aed 100%); color:white; padding:28px 32px; display:flex; align-items:center; gap:20px; }
  .cr-avatar { width:80px; height:80px; border-radius:50%; background:rgba(255,255,255,0.15); border:3px solid rgba(255,255,255,0.4); display:flex; align-items:center; justify-content:center; font-size:26px; font-weight:700; flex-shrink:0; overflow:hidden; }
  .cr-avatar img { width:100%; height:100%; object-fit:cover; }
  .cr-header-info { flex:1; }
  .cr-name { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; letter-spacing:-0.5px; line-height:1.1; }
  .cr-job-title { font-size:13px; font-weight:500; color:rgba(255,255,255,0.75); margin-top:4px; }
  .cr-header-contacts { display:flex; flex-wrap:wrap; gap:12px; margin-top:10px; }
  .cr-header-contact { display:flex; align-items:center; gap:5px; font-size:10.5px; color:rgba(255,255,255,0.8); }
  .cr-body { display:flex; flex:1; }
  .cr-sidebar { width:200px; background:#f3f0ff; padding:20px 16px; display:flex; flex-direction:column; gap:18px; flex-shrink:0; }
  .cr-sidebar-title { font-size:9px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#6d28d9; border-bottom:2px solid #ddd6fe; padding-bottom:4px; margin-bottom:8px; }
  .cr-skill-bar { margin-bottom:6px; }
  .cr-skill-bar > span { font-size:10.5px; color:#374151; display:block; margin-bottom:3px; }
  .cr-bar { height:4px; background:#ddd6fe; border-radius:99px; }
  .cr-bar-fill { width:70%; height:100%; background:linear-gradient(90deg,#7c3aed,#ec4899); border-radius:99px; }
  .cr-soft-tag { display:inline-flex; padding:3px 8px; background:rgba(124,58,237,0.1); border:1px solid rgba(124,58,237,0.2); border-radius:99px; font-size:10px; color:#6d28d9; margin:2px; }
  .cr-lang { display:flex; justify-content:space-between; font-size:10.5px; color:#4b5563; margin-bottom:3px; }
  .cr-lang span { color:#7c3aed; font-weight:600; }
  .cr-cert { font-size:10.5px; color:#374151; margin-bottom:4px; }
  .cr-edu-degree { font-size:11px; font-weight:600; color:#1f2937; }
  .cr-edu-school { font-size:10.5px; color:#6b7280; }
  .cr-edu-year { font-size:10px; color:#9ca3af; margin-top:1px; }
  .cr-sidebar-edu { margin-bottom:10px; }
  .cr-main { flex:1; padding:20px 24px; background:white; }
  .cr-section-title { font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#6d28d9; margin-bottom:10px; }
  .cr-summary { font-size:11.5px; color:#374151; line-height:1.8; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid #f0e7ff; }
  .cr-entry { display:flex; gap:10px; margin-bottom:10px; position:relative; }
  .cr-entry-dot { width:10px; height:10px; border-radius:50%; background:#7c3aed; flex-shrink:0; margin-top:3px; box-shadow:0 0 0 3px rgba(124,58,237,0.15); }
  .cr-entry-body { flex:1; padding-bottom:8px; border-bottom:1px solid #f3f4f6; }
  .cr-entry:last-child .cr-entry-body { border-bottom:none; }
  .cr-entry-title { font-size:12.5px; font-weight:700; color:#111827; }
  .cr-entry-meta { font-size:10.5px; color:#9333ea; margin-top:1px; }
  .cr-entry-desc { font-size:11px; color:#4b5563; line-height:1.7; margin-top:4px; }
  .cr-section-gap { margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid #f0e7ff; }
</style>
<div class="creative-resume">
  <header class="cr-header">
    <div class="cr-avatar">${data.photo ? `<img src="${data.photo}" alt="photo"/>` : (initials || '?')}</div>
    <div class="cr-header-info">
      <div class="cr-name">${name}</div>
      ${data.jobTitle ? `<div class="cr-job-title">${data.jobTitle}</div>` : ''}
      <div class="cr-header-contacts">
        ${data.email ? `<span class="cr-header-contact">✉ ${data.email}</span>` : ''}
        ${data.phone ? `<span class="cr-header-contact">📞 ${data.phone}</span>` : ''}
        ${data.location ? `<span class="cr-header-contact">📍 ${data.location}</span>` : ''}
        ${data.linkedin ? `<span class="cr-header-contact">in ${data.linkedin.replace('https://linkedin.com/in/', '')}</span>` : ''}
      </div>
    </div>
  </header>
  <div class="cr-body">
    <aside class="cr-sidebar">
      ${techSkills ? `<div><div class="cr-sidebar-title">Skills</div>${techSkills}</div>` : ''}
      ${softSkills ? `<div><div class="cr-sidebar-title">Soft Skills</div>${softSkills}</div>` : ''}
      ${languages ? `<div><div class="cr-sidebar-title">Languages</div>${languages}</div>` : ''}
      ${education ? `<div><div class="cr-sidebar-title">Education</div>${education}</div>` : ''}
      ${certs ? `<div><div class="cr-sidebar-title">Certifications</div>${certs}</div>` : ''}
    </aside>
    <main class="cr-main">
      ${data.summary ? `<p class="cr-summary">${data.summary}</p>` : ''}
      ${experience ? `<div class="cr-section-gap"><div class="cr-section-title">Work Experience</div>${experience}</div>` : ''}
      ${projects ? `<div><div class="cr-section-title">Projects</div>${projects}</div>` : ''}
    </main>
  </div>
</div>`;
  },

  /* ============================================================
     TEMPLATE 4: MINIMAL
     Ultra-clean, whitespace-heavy, monochrome
     ============================================================ */
  minimal(data) {
    const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Your Name';

    const contactParts = [
      data.email, data.phone, data.location
    ].filter(Boolean).join(' · ');
    const linkParts = [data.linkedin, data.website].filter(Boolean).join(' · ');

    const experience = (data.experience || []).map(e => `
      <div class="mn-entry">
        <div class="mn-entry-header">
          <div class="mn-entry-left">
            <span class="mn-entry-role">${e.role || 'Role'}</span>
            <span class="mn-entry-sep">@</span>
            <span class="mn-entry-org">${e.company || ''}</span>
          </div>
          <span class="mn-entry-date">${e.startDate || ''}${e.current ? ' – Present' : e.endDate ? ' – ' + e.endDate : ''}</span>
        </div>
        ${e.description ? `<p class="mn-entry-desc">${e.description.replace(/\n/g, '<br/>')}</p>` : ''}
      </div>`).join('');

    const education = (data.education || []).map(e => `
      <div class="mn-entry">
        <div class="mn-entry-header">
          <div class="mn-entry-left">
            <span class="mn-entry-role">${e.degree || 'Degree'}</span>
            <span class="mn-entry-sep">—</span>
            <span class="mn-entry-org">${e.school || ''}</span>
          </div>
          <span class="mn-entry-date">${e.year || ''}${e.gpa ? ' · GPA ' + e.gpa : ''}</span>
        </div>
      </div>`).join('');

    const allSkills = [...(data.techSkills || []), ...(data.softSkills || [])];
    const skills = allSkills.map(s => `<span class="mn-skill">${s}</span>`).join('');

    const projects = (data.projects || []).map(p => `
      <div class="mn-entry">
        <div class="mn-entry-header">
          <span class="mn-entry-role">${p.title || 'Project'}</span>
          ${p.url ? `<a href="${p.url}" class="mn-entry-date" style="font-style:normal">${p.url.replace('https://', '')}</a>` : ''}
        </div>
        ${p.tech ? `<div class="mn-entry-tech">${p.tech}</div>` : ''}
        ${p.description ? `<p class="mn-entry-desc">${p.description}</p>` : ''}
      </div>`).join('');

    const certs = (data.certifications || []).map(c =>
      `<div class="mn-cert"><span class="mn-cert-name">${c.name || ''}</span>${c.issuer ? ` · ${c.issuer}` : ''}${c.date ? ` · ${c.date}` : ''}</div>`
    ).join('');

    const langs = (data.languages || []).map(l =>
      `<span class="mn-skill">${l.name} (${l.level})</span>`
    ).join('');

    function mnSection(title, content) {
      if (!content) return '';
      return `
        <section class="mn-section">
          <div class="mn-section-header">
            <h3 class="mn-section-title">${title}</h3>
            <div class="mn-section-rule"></div>
          </div>
          ${content}
        </section>`;
    }

    return `
<style>
  .minimal-resume { font-family:'Inter',sans-serif; font-size:11.5px; line-height:1.6; color:#1a1a1a; background:white; padding:44px 52px; min-height:1123px; }
  .mn-header { margin-bottom:28px; }
  .mn-name { font-size:30px; font-weight:800; color:#0a0a0a; letter-spacing:-1px; line-height:1; }
  .mn-job-title { font-size:14px; font-weight:400; color:#555; margin-top:5px; }
  .mn-contacts { margin-top:8px; font-size:11px; color:#666; display:flex; flex-direction:column; gap:2px; }
  .mn-section { margin-bottom:20px; }
  .mn-section-header { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
  .mn-section-title { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#000; white-space:nowrap; }
  .mn-section-rule { flex:1; height:1px; background:#e5e5e5; }
  .mn-summary { font-size:11.5px; color:#333; line-height:1.8; }
  .mn-entry { margin-bottom:10px; }
  .mn-entry-header { display:flex; justify-content:space-between; align-items:center; }
  .mn-entry-left { display:flex; align-items:center; gap:5px; }
  .mn-entry-role { font-size:12px; font-weight:700; color:#0a0a0a; }
  .mn-entry-sep { color:#aaa; font-size:11px; }
  .mn-entry-org { font-size:11.5px; color:#555; }
  .mn-entry-date { font-size:10.5px; color:#888; }
  .mn-entry-desc { font-size:11px; color:#444; line-height:1.7; margin-top:4px; }
  .mn-entry-tech { font-size:10px; color:#888; margin-top:2px; font-style:italic; }
  .mn-skills { display:flex; flex-wrap:wrap; gap:6px; }
  .mn-skill { padding:3px 10px; border:1px solid #ddd; border-radius:3px; font-size:10.5px; color:#333; }
  .mn-cert { font-size:11px; color:#333; margin-bottom:3px; }
  .mn-cert-name { font-weight:700; }
</style>
<div class="minimal-resume">
  <header class="mn-header">
    <div class="mn-name">${name}</div>
    ${data.jobTitle ? `<div class="mn-job-title">${data.jobTitle}</div>` : ''}
    <div class="mn-contacts">
      ${contactParts ? `<span>${contactParts}</span>` : ''}
      ${linkParts ? `<span>${linkParts}</span>` : ''}
    </div>
  </header>
  ${mnSection('Summary', data.summary ? `<p class="mn-summary">${data.summary}</p>` : '')}
  ${mnSection('Experience', experience)}
  ${mnSection('Education', education)}
  ${skills ? mnSection('Skills', `<div class="mn-skills">${skills}</div>`) : ''}
  ${langs ? mnSection('Languages', `<div class="mn-skills">${langs}</div>`) : ''}
  ${mnSection('Projects', projects)}
  ${certs ? mnSection('Certifications', certs) : ''}
</div>`;
  }

}; // end ResumeTemplates
