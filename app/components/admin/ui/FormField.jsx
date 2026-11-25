"use client";

import { useId } from "react";

const BASE_INPUT =
  "w-full px-4 py-2.5 bg-white/5 border rounded-lg text-white text-sm placeholder-gray-500 " +
  "focus:outline-none focus:ring-2 transition-colors";

const stateClasses = (error) =>
  error
    ? "border-red-500 focus:ring-red-500/50"
    : "border-white/10 focus:ring-[#9033FF]/50 focus:border-[#9033FF]";

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder,
  hint,
  autoComplete,
  disabled = false,
  ...inputProps
}) {
  const id = useId();
  return (
    <FormField.Group label={label} id={id} required={required} error={error} hint={hint}>
      <input
        id={id}
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={`${BASE_INPUT} ${stateClasses(error)} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        {...inputProps}
      />
    </FormField.Group>
  );
}

FormField.Group = function FormFieldGroup({ label, id, required, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={id ? `${id}-err` : undefined} className="text-xs text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={id ? `${id}-hint` : undefined} className="text-xs text-gray-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

export default FormField;
export { BASE_INPUT, stateClasses };