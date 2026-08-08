import styles from "./PageFooter.module.css";

export function PageFooter() {
  return (
    <div className={styles.footer}>
      <span>ANDRII SHAFAR | ANDRIISHAFAR.XYZ</span>
      <span>
        PAGE <span className="pageNumber" /> OF <span className="totalPages" />
      </span>
    </div>
  );
}
