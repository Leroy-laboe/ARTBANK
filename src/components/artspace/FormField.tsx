import { useId } from 'react';
import { Icon } from '../ui/Icon';
import styles from './FormField.module.css';

/** A labelled form control for the profile editor.
 *
 *  The control is rendered here rather than passed as children so every input,
 *  select and textarea on the screen shares one set of styles.
 *
 *  Works either way round: pass `onChange` for a controlled field (Add
 *  Artwork, which validates as you type), or leave it off and give the field a
 *  `name` for the surrounding <form> to read on submit (Profile Details). */
export function FormField({
  label,
  name,
  required = false,
  as = 'input',
  value,
  options,
  rows = 3,
  type = 'text',
  className = '',
  onChange,
  placeholder,
  hint,
  error,
}: {
  label: string;
  /** Form field name, so a submitting <form> can read the value back. */
  name?: string;
  required?: boolean;
  as?: 'input' | 'select' | 'textarea';
  value: string;
  options?: string[];
  rows?: number;
  type?: string;
  className?: string;
  /** Supply to make the field controlled. */
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Quiet helper text under the control. */
  hint?: string;
  /** Replaces the hint and turns the control red when set. */
  error?: string;
}) {
  // A controlled field takes `value`; an uncontrolled one seeds `defaultValue`
  // once and then leaves the DOM to own it.
  const binding = onChange
    ? { value, onChange: (e: { target: { value: string } }) => onChange(e.target.value) }
    : { defaultValue: value };
  const id = useId();

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      {as === 'select' ? (
        <span className={styles.selectWrap}>
          <select
            id={id}
            name={name}
            className={[styles.select, error && styles.invalid].filter(Boolean).join(' ')}
            {...binding}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {(options ?? [value]).map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <Icon name="chevron-down" size={15} className={styles.caret} />
        </span>
      ) : as === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          className={[styles.textarea, error && styles.invalid].filter(Boolean).join(' ')}
          rows={rows}
          placeholder={placeholder}
          {...binding}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          className={[styles.input, error && styles.invalid].filter(Boolean).join(' ')}
          placeholder={placeholder}
          {...binding}
        />
      )}

      {error ? <p className={styles.error}>{error}</p> : hint ? <p className={styles.hint}>{hint}</p> : null}
    </div>
  );
}
