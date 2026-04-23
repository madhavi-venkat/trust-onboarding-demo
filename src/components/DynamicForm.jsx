import { useState } from 'react';

function validate(schema, values) {
  const errors = {};
  schema.forEach((field) => {
    if (field.required) {
      const val = values[field.id];
      if (!val || (typeof val === 'string' && val.trim() === '')) {
        errors[field.id] = `${field.label} is required`;
      }
    }
  });
  return errors;
}

function Field({ field, value, error, onChange, onBlur }) {
  const inputClass = `input${error ? ' has-error' : ''}`;
  const commonProps = {
    id: field.id,
    className: inputClass,
    value: value || '',
    onChange: (e) => onChange(field.id, e.target.value),
    onBlur: () => onBlur(field.id),
    placeholder: field.placeholder,
  };

  let control;
  if (field.type === 'select') {
    control = (
      <select {...commonProps}>
        <option value="">Select…</option>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  } else if (field.type === 'textarea') {
    control = <textarea {...commonProps} rows={3} />;
  } else {
    control = <input type={field.type} {...commonProps} />;
  }

  return (
    <div className={`form-group${field.fullWidth ? ' full-width' : ''}`}>
      <label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="required-star">*</span>}
      </label>
      {control}
      {error && <span className="error-msg">{error}</span>}
    </div>
  );
}

export default function DynamicForm({ schema, initialValues = {}, onSave }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saved, setSaved] = useState(false);

  const handleChange = (id, value) => {
    const next = { ...values, [id]: value };
    setValues(next);
    setSaved(false);
    if (touched[id]) {
      const nextErrors = validate(schema, next);
      setErrors((prev) => ({ ...prev, [id]: nextErrors[id] }));
    }
  };

  const handleBlur = (id) => {
    setTouched((prev) => ({ ...prev, [id]: true }));
    const nextErrors = validate(schema, values);
    setErrors((prev) => ({ ...prev, [id]: nextErrors[id] }));
  };

  const handleSave = () => {
    const allTouched = {};
    schema.forEach((f) => {
      allTouched[f.id] = true;
    });
    setTouched(allTouched);

    const nextErrors = validate(schema, values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      onSave?.(values);
      setSaved(true);
    }
  };

  return (
    <div>
      <div className="form-grid">
        {schema.map((field) => (
          <Field
            key={field.id}
            field={field}
            value={values[field.id]}
            error={errors[field.id]}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        ))}
        <div className="form-actions">
          <button className="btn-primary" onClick={handleSave}>
            Save
          </button>
          {saved && <span className="save-success">Saved successfully</span>}
        </div>
      </div>
    </div>
  );
}
