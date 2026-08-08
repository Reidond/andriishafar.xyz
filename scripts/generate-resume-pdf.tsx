import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import React, { type ReactNode } from "react";

import { render } from "takumi-pdf";

import resume from "../src/data/resume.json";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = join(root, "public", "andrii-shafar-resume.pdf");

const styles = `
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
`;

function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

function Tags({ items, className }: { items: string[]; className?: string }) {
  return (
    <div className={className ? `tags ${className}` : "tags"}>
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

function SectionTitle({ title, eyebrow }: { title: string; eyebrow: string }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      <span>{eyebrow}</span>
    </div>
  );
}

function ExperienceEntries() {
  return resume.experience.map((item, index) => (
    <article className={`experience${index === 2 ? " page-break" : ""}`} key={item.company}>
      <div className="experience-head">
        <div>
          <h3>{item.company}</h3>
          <p>{item.scope}</p>
        </div>
        <strong>{item.period}</strong>
      </div>
      <p className="experience-summary">{item.summary}</p>
      <ul>
        {item.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
      <Tags items={item.technologies} />
    </article>
  ));
}

function Projects() {
  return resume.projects.map((project) => (
    <article className="compact-card" key={project.name}>
      <div className="compact-title">
        <h3>
          <ExternalLink href={project.href}>{project.name}</ExternalLink>
        </h3>
        <span>{project.stack}</span>
      </div>
      <p>{project.description}</p>
    </article>
  ));
}

function Publications() {
  return resume.publications.map((publication) => (
    <article className="publication" key={publication.href}>
      <span>{publication.year}</span>
      <div>
        <h3>
          <ExternalLink href={publication.href}>{publication.title}</ExternalLink>
        </h3>
        <p>{publication.journal}</p>
      </div>
    </article>
  ));
}

function ResumeDocument() {
  return (
    <main>
      <div className="topline">
        <span>Software engineer | Applied researcher | {resume.profile.location}</span>
        <ExternalLink href={resume.profile.website}>{resume.profile.website.replace("https://", "")}</ExternalLink>
      </div>

      <header className="identity">
        <div>
          <h1>{resume.profile.name}</h1>
          <h2>{resume.profile.headline}</h2>
        </div>
        <div className="contact">
          <ExternalLink href={`mailto:${resume.profile.email}`}>{resume.profile.email}</ExternalLink>
          <ExternalLink href="https://github.com/Reidond">github.com/Reidond</ExternalLink>
          <ExternalLink href="https://orcid.org/0009-0004-2445-8232">ORCID 0009-0004-2445-8232</ExternalLink>
        </div>
      </header>

      <p className="summary">{resume.profile.summary}</p>

      <div className="metrics">
        {resume.metrics.map((metric) => (
          <div className="metric" key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </div>

      <Tags items={resume.capabilities} className="profile-tags" />

      <section className="section">
        <SectionTitle title="Selected professional experience" eyebrow="Evidence-backed feature ownership" />
        <ExperienceEntries />
      </section>

      <section className="section two-column">
        <div>
          <SectionTitle title="Selected projects" eyebrow="Public work" />
          <Projects />
          <div className="education">
            <h3>{resume.education.institution}</h3>
            <strong>{resume.education.role}</strong>
            <p>{resume.education.description}</p>
          </div>
        </div>
        <div>
          <SectionTitle title="Research publications" eyebrow="Selected" />
          <Publications />
        </div>
      </section>

      <section className="section">
        <SectionTitle title="Contact and profiles" eyebrow="Open to meaningful work" />
        <div className="socials">
          <ExternalLink className="social-link" href={`mailto:${resume.profile.email}`}>
            Email: {resume.profile.email}
          </ExternalLink>
          <ExternalLink className="social-link" href={`mailto:${resume.profile.academicEmail}`}>
            Academic: {resume.profile.academicEmail}
          </ExternalLink>
          {resume.socialLinks.map((social) => (
            <ExternalLink className="social-link" href={social.href} key={social.href}>
              {social.label}: {social.handle}
            </ExternalLink>
          ))}
        </div>
        <div className="audit">
          {resume.audit.summary} {resume.audit.note}
        </div>
      </section>
    </main>
  );
}

const pdf = await render(<ResumeDocument />, {
  size: "a4",
  margin: { top: 38, right: 42, bottom: 42, left: 42 },
  stylesheets: [styles],
  footer: (
    <div
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
        color: "#737b88",
        fontSize: 7,
        letterSpacing: "0.04em",
      }}
    >
      <span>ANDRII SHAFAR | ANDRIISHAFAR.XYZ</span>
      <span>
        PAGE <span className="pageNumber" /> OF <span className="totalPages" />
      </span>
    </div>
  ),
  outline: true,
  lang: "en",
  metadata: {
    title: "Andrii Shafar - Software Engineer and Applied Researcher",
    description: "Professional resume for Andrii Shafar",
    authors: ["Andrii Shafar"],
    keywords: ["software engineer", "product engineering", "Go", "Python", "TypeScript", "AI systems"],
    creator: "takumi-pdf 0.4.2 with React 19",
    creationDate: "2026-08-08",
  },
});

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, pdf);
console.log(`Generated ${outputPath} (${pdf.byteLength.toLocaleString()} bytes)`);
