import styles from './custom-checkbox.module.css';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function CustomCheckbox({ checked, onChange, className, disabled }: CustomCheckboxProps) {
  return (
    <label className={`${styles.checkbox} ${className || ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={styles.input}
      />
      <span className={styles.checkmark} />
    </label>
  );
}
