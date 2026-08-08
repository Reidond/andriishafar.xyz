import type { ResumeData } from "./types";
import { ContactSection } from "./components/ContactSection";
import { ExperienceSection } from "./components/ExperienceSection";
import { ProjectsSection } from "./components/ProjectsSection";
import { PublicationsSection } from "./components/PublicationsSection";
import { ResumeHeader } from "./components/ResumeHeader";
import styles from "./ResumeDocument.module.css";

type ResumeDocumentProps = {
  resume: ResumeData;
};

export function ResumeDocument({ resume }: ResumeDocumentProps) {
  return (
    <main className={styles.document}>
      <ResumeHeader profile={resume.profile} metrics={resume.metrics} capabilities={resume.capabilities} />
      <ExperienceSection entries={resume.experience} />

      <section className={styles.supportingGrid}>
        <ProjectsSection projects={resume.projects} education={resume.education} />
        <PublicationsSection publications={resume.publications} />
      </section>

      <ContactSection profile={resume.profile} socialLinks={resume.socialLinks} audit={resume.audit} />
    </main>
  );
}
