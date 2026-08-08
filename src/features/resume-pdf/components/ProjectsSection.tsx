import type { Education, Project } from "../types";
import { ExternalLink } from "./ExternalLink";
import { SectionTitle } from "./SectionTitle";
import styles from "./ProjectsSection.module.css";

type ProjectsSectionProps = {
  projects: readonly Project[];
  education: Education;
};

export function ProjectsSection({ projects, education }: ProjectsSectionProps) {
  return (
    <div>
      <SectionTitle title="Selected projects" eyebrow="Public work" />
      {projects.map((project) => (
        <article className={styles.project} key={project.name}>
          <div className={styles.heading}>
            <h3>
              <ExternalLink href={project.href}>{project.name}</ExternalLink>
            </h3>
            <span>{project.stack}</span>
          </div>
          <p>{project.description}</p>
        </article>
      ))}

      <div className={styles.education}>
        <h3>{education.institution}</h3>
        <strong>{education.role}</strong>
        <p>{education.description}</p>
      </div>
    </div>
  );
}
