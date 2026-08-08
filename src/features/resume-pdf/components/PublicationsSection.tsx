import type { Publication } from "../types";
import { ExternalLink } from "./ExternalLink";
import { SectionTitle } from "./SectionTitle";
import styles from "./PublicationsSection.module.css";

type PublicationsSectionProps = {
  publications: readonly Publication[];
};

export function PublicationsSection({ publications }: PublicationsSectionProps) {
  return (
    <div>
      <SectionTitle title="Research publications" eyebrow="Selected" />
      {publications.map((publication) => (
        <article className={styles.publication} key={publication.href}>
          <span>{publication.year}</span>
          <div>
            <h3>
              <ExternalLink href={publication.href}>{publication.title}</ExternalLink>
            </h3>
            <p>{publication.journal}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
