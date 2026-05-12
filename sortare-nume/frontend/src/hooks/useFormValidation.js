import { useState } from "react";

// Hook custom pentru validarea unui formular generic.
// Primește un obiect `rules` care descrie regulile per câmp.
// Returnează: errors (obiect), validate (funcție), clearErrors
export function useFormValidation(rules) {
  const [errors, setErrors] = useState({});

  function validate(data) {
    const newErrors = {};

    for (const field in rules) {
      const value = (data[field] || "").trim();
      const rule  = rules[field];

      if (rule.required && !value) {
        newErrors[field] = rule.requiredMsg || `Câmpul este obligatoriu.`;
        continue;
      }
      if (rule.minLength && value.length < rule.minLength) {
        newErrors[field] = rule.minLengthMsg ||
          `Minim ${rule.minLength} caractere.`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        newErrors[field] = rule.maxLengthMsg ||
          `Maxim ${rule.maxLength} caractere.`;
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        newErrors[field] = rule.patternMsg || `Valoare invalidă.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function clearErrors() {
    setErrors({});
  }

  return { errors, validate, clearErrors };
}
