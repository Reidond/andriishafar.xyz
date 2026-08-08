import type { Experience } from "../types";
import { SectionTitle } from "./SectionTitle";
import { Tags } from "./Tags";
import styles from "./ExperienceSection.module.css";

type ExperienceSectionProps = {
  entries: readonly Experience[];
};

export function ExperienceSection({ entries }: ExperienceSectionProps) {
  return (
    <section className={styles.section}>
      <SectionTitle title="Selected professional experience" eyebrow="Evidence-backed feature ownership" />
      {entries.map((entry, index) => (
        <article
          className={[styles.entry, index === 2 ? styles.pageBreak : undefined].filter(Boolean).join(" ")}
          key={entry.company}
        >
          <div className={styles.heading}>
            <div>
              <h3>{entry.company}</h3>
              <p>{entry.scope}</p>
            </div>
            <strong>{entry.period}</strong>
          </div>
          <p className={styles.summary}>{entry.summary}</p>
          <ul className={styles.highlights}>
            {entry.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
          <Tags items={entry.technologies} />
        </article>
      ))}
    </section>
  );
}
