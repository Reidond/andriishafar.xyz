import type { ResumeData, ResumeProfile, SocialLink } from "../types";
import { ExternalLink } from "./ExternalLink";
import { SectionTitle } from "./SectionTitle";
import styles from "./ContactSection.module.css";

type ContactSectionProps = {
  profile: ResumeProfile;
  socialLinks: readonly SocialLink[];
  audit: ResumeData["audit"];
};

export function ContactSection({ profile, socialLinks, audit }: ContactSectionProps) {
  return (
    <section className={styles.section}>
      <SectionTitle title="Contact and profiles" eyebrow="Open to meaningful work" />
      <div className={styles.socials}>
        <ExternalLink className={styles.socialLink} href={`mailto:${profile.email}`}>
          Email: {profile.email}
        </ExternalLink>
        <ExternalLink className={styles.socialLink} href={`mailto:${profile.academicEmail}`}>
          Academic: {profile.academicEmail}
        </ExternalLink>
        {socialLinks.map((social) => (
          <ExternalLink className={styles.socialLink} href={social.href} key={social.href}>
            {social.label}: {social.handle}
          </ExternalLink>
        ))}
      </div>
      <div className={styles.audit}>
        {audit.summary} {audit.note}
      </div>
    </section>
  );
}
