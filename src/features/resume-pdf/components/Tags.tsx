import styles from "./Tags.module.css";

type TagsProps = {
  items: readonly string[];
  className?: string;
};

export function Tags({ items, className }: TagsProps) {
  return (
    <div className={[styles.list, className].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}
