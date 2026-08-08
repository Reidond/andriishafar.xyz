import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { render } from "takumi-pdf";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = join(root, "src", "data", "resume.json");
const outputPath = join(root, "public", "andrii-shafar-resume.pdf");
const resume = JSON.parse(await readFile(dataPath, "utf8"));

const escapeHtml = (value) =>
  String(value)
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const link = (label, href, className = "") =>
  `<a class="${className}" href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;

const tags = (items) =>
  `<div class="tags">${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;

const experience = resume.experience
  .map(
    (item, index) => `
      <article class="experience${index === 2 ? " page-break" : ""}">
        <div class="experience-head">
          <div>
            <h3>${escapeHtml(item.company)}</h3>
            <p>${escapeHtml(item.scope)}</p>
          </div>
          <strong>${escapeHtml(item.period)}</strong>
        </div>
        <p class="experience-summary">${escapeHtml(item.summary)}</p>
        <ul>
          ${item.highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join("")}
        </ul>
        ${tags(item.technologies)}
      </article>`,
  )
  .join("");

const projects = resume.projects
  .map(
    (project) => `
      <article class="compact-card">
        <div class="compact-title">
          <h3>${link(project.name, project.href)}</h3>
          <span>${escapeHtml(project.stack)}</span>
        </div>
        <p>${escapeHtml(project.description)}</p>
      </article>`,
  )
  .join("");

const publications = resume.publications
  .map(
    (publication) => `
      <article class="publication">
        <span>${escapeHtml(publication.year)}</span>
        <div>
          <h3>${link(publication.title, publication.href)}</h3>
          <p>${escapeHtml(publication.journal)}</p>
        </div>
      </article>`,
  )
  .join("");

const socialLinks = resume.socialLinks
  .map((social) => link(`${social.label}: ${social.handle}`, social.href, "social-link"))
  .join("");

const html = `
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; color: #172033; font-family: sans-serif; font-size: 10.2px; line-height: 1.47; }
    a { color: #264ac7; text-decoration: none; }
    main { width: 100%; }
    .topline { display: flex; justify-content: space-between; align-items: center; color: #5d6676; font-size: 8.4px; letter-spacing: 0.08em; text-transform: uppercase; }
    .topline a { color: #5d6676; }
    .identity { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-top: 10px; padding-bottom: 15px; border-bottom: 3px solid #3157f6; }
    .identity h1 { margin: 0; color: #101822; font-size: 31px; line-height: 1; letter-spacing: -0.04em; }
    .identity h2 { margin: 6px 0 0; color: #3157f6; font-size: 12px; font-weight: 600; }
    .contact { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 8.8px; }
    .summary { margin: 14px 0 0; color: #465063; font-size: 10.4px; line-height: 1.55; }
    .metrics { display: flex; gap: 8px; margin-top: 12px; }
    .metric { flex: 1; padding: 8px 10px; background: #f0eee8; border-left: 3px solid #d7ff4f; }
    .metric strong { display: block; color: #101822; font-size: 14px; line-height: 1; }
    .metric span { display: block; margin-top: 3px; color: #596273; font-size: 7.7px; line-height: 1.35; text-transform: uppercase; }
    .section { margin-top: 18px; }
    .section-title { display: flex; justify-content: space-between; align-items: baseline; gap: 20px; padding-bottom: 6px; border-bottom: 1px solid #b9bec8; break-after: avoid; }
    .section-title h2 { margin: 0; color: #101822; font-size: 15px; letter-spacing: -0.02em; }
    .section-title span { color: #6d7481; font-size: 7.5px; letter-spacing: 0.06em; text-transform: uppercase; }
    .tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
    .tags span { padding: 3px 6px; border: 1px solid #c9ccd2; color: #4d5666; font-size: 7.1px; line-height: 1; text-transform: uppercase; }
    .profile-tags { margin-top: 10px; }
    .experience { padding: 11px 0 12px; border-bottom: 1px solid #d5d7dc; box-decoration-break: clone; }
    .experience.page-break { break-before: page; }
    .experience-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; break-after: avoid; }
    .experience-head h3 { margin: 0; color: #101822; font-size: 16px; line-height: 1.1; }
    .experience-head p { margin: 2px 0 0; color: #3157f6; font-size: 7.7px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
    .experience-head strong { color: #4d5666; font-size: 8px; letter-spacing: 0.05em; white-space: nowrap; }
    .experience-summary { margin: 7px 0; color: #505a6b; }
    ul { display: grid; grid-template-columns: repeat(2, 1fr); column-gap: 20px; row-gap: 4px; margin: 0; padding-left: 14px; }
    li { padding-left: 1px; color: #263044; font-size: 8.55px; line-height: 1.42; }
    .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .compact-card { padding: 8px 0; border-bottom: 1px solid #d5d7dc; break-inside: avoid; }
    .compact-title { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
    .compact-title h3 { margin: 0; font-size: 10px; }
    .compact-title span { color: #6b7280; font-size: 6.8px; text-align: right; text-transform: uppercase; }
    .compact-card p { margin: 3px 0 0; color: #505a6b; font-size: 8.2px; line-height: 1.4; }
    .education { margin-top: 8px; padding: 9px 10px; background: #f0eee8; break-inside: avoid; }
    .education h3 { margin: 0; font-size: 10.5px; }
    .education strong { display: block; margin-top: 2px; color: #3157f6; font-size: 7.4px; text-transform: uppercase; }
    .education p { margin: 4px 0 0; color: #505a6b; font-size: 8.2px; }
    .publication { display: grid; grid-template-columns: 34px 1fr; gap: 7px; padding: 7px 0; border-bottom: 1px solid #d5d7dc; break-inside: avoid; }
    .publication > span { color: #3157f6; font-size: 7.8px; font-weight: 700; }
    .publication h3 { margin: 0; font-size: 8.7px; line-height: 1.35; }
    .publication p { margin: 2px 0 0; color: #646c79; font-size: 7.2px; line-height: 1.35; }
    .audit { margin-top: 12px; padding: 8px 10px; border-left: 3px solid #3157f6; background: #f6f5f1; color: #596273; font-size: 7.4px; line-height: 1.45; }
    .socials { display: flex; flex-wrap: wrap; gap: 5px 12px; margin-top: 9px; }
    .social-link { font-size: 7.5px; }
  </style>
  <main>
    <div class="topline">
      <span>Software engineer | Applied researcher | ${escapeHtml(resume.profile.location)}</span>
      ${link(resume.profile.website.replace("https://", ""), resume.profile.website)}
    </div>
    <header class="identity">
      <div>
        <h1>${escapeHtml(resume.profile.name)}</h1>
        <h2>${escapeHtml(resume.profile.headline)}</h2>
      </div>
      <div class="contact">
        ${link(resume.profile.email, `mailto:${resume.profile.email}`)}
        ${link("github.com/Reidond", "https://github.com/Reidond")}
        ${link("ORCID 0009-0004-2445-8232", "https://orcid.org/0009-0004-2445-8232")}
      </div>
    </header>
    <p class="summary">${escapeHtml(resume.profile.summary)}</p>
    <div class="metrics">
      ${resume.metrics
        .map(
          (metric) => `<div class="metric"><strong>${escapeHtml(metric.value)}</strong><span>${escapeHtml(metric.label)}</span></div>`,
        )
        .join("")}
    </div>
    <div class="profile-tags">${tags(resume.capabilities)}</div>

    <section class="section">
      <div class="section-title">
        <h2>Selected professional experience</h2>
        <span>Evidence-backed feature ownership</span>
      </div>
      ${experience}
    </section>

    <section class="section two-column">
      <div>
        <div class="section-title"><h2>Selected projects</h2><span>Public work</span></div>
        ${projects}
        <div class="education">
          <h3>${escapeHtml(resume.education.institution)}</h3>
          <strong>${escapeHtml(resume.education.role)}</strong>
          <p>${escapeHtml(resume.education.description)}</p>
        </div>
      </div>
      <div>
        <div class="section-title"><h2>Research publications</h2><span>Selected</span></div>
        ${publications}
      </div>
    </section>

    <section class="section">
      <div class="section-title"><h2>Contact and profiles</h2><span>Open to meaningful work</span></div>
      <div class="socials">
        ${link(`Email: ${resume.profile.email}`, `mailto:${resume.profile.email}`, "social-link")}
        ${link(`Academic: ${resume.profile.academicEmail}`, `mailto:${resume.profile.academicEmail}`, "social-link")}
        ${socialLinks}
      </div>
      <div class="audit">${escapeHtml(resume.audit.summary)} ${escapeHtml(resume.audit.note)}</div>
    </section>
  </main>
`;

const pdf = await render(html, {
  size: "a4",
  margin: { top: 38, right: 42, bottom: 42, left: 42 },
  footer: `
    <div style="display:flex;width:100%;justify-content:space-between;color:#737b88;font-size:7px;letter-spacing:0.04em;">
      <span>ANDRII SHAFAR | ANDRIISHAFAR.XYZ</span>
      <span>PAGE <span class="pageNumber" /> OF <span class="totalPages" /></span>
    </div>
  `,
  outline: true,
  lang: "en",
  metadata: {
    title: "Andrii Shafar - Software Engineer and Applied Researcher",
    description: "Professional resume for Andrii Shafar",
    authors: ["Andrii Shafar"],
    keywords: ["software engineer", "product engineering", "Go", "Python", "TypeScript", "AI systems"],
    creator: "takumi-pdf 0.4.2",
    creationDate: "2026-08-08"
  }
});

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, pdf);
console.log(`Generated ${outputPath} (${pdf.byteLength.toLocaleString()} bytes)`);
