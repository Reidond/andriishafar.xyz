import styles from "./SectionTitle.module.css";

type SectionTitleProps = {
  title: string;
  eyebrow: string;
};

export function SectionTitle({ title, eyebrow }: SectionTitleProps) {
  return (
    <div className={styles.root}>
      <h2>{title}</h2>
      <span>{eyebrow}</span>
    </div>
  );
}
