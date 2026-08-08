import type { ResumeMetric, ResumeProfile } from "../types";
import { ExternalLink } from "./ExternalLink";
import { Tags } from "./Tags";
import styles from "./ResumeHeader.module.css";

type ResumeHeaderProps = {
  profile: ResumeProfile;
  metrics: readonly ResumeMetric[];
  capabilities: readonly string[];
};

export function ResumeHeader({ profile, metrics, capabilities }: ResumeHeaderProps) {
  return (
    <>
      <div className={styles.topline}>
        <span>Software engineer | Applied researcher | {profile.location}</span>
        <ExternalLink href={profile.website}>{profile.website.replace("https://", "")}</ExternalLink>
      </div>

      <header className={styles.identity}>
        <div>
          <h1>{profile.name}</h1>
          <h2>{profile.headline}</h2>
        </div>
        <div className={styles.contact}>
          <ExternalLink href={`mailto:${profile.email}`}>{profile.email}</ExternalLink>
          <ExternalLink href="https://github.com/Reidond">github.com/Reidond</ExternalLink>
          <ExternalLink href="https://orcid.org/0009-0004-2445-8232">ORCID 0009-0004-2445-8232</ExternalLink>
        </div>
      </header>

      <p className={styles.summary}>{profile.summary}</p>

      <div className={styles.metrics}>
        {metrics.map((metric) => (
          <div className={styles.metric} key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </div>

      <Tags items={capabilities} className={styles.capabilities} />
    </>
  );
}
