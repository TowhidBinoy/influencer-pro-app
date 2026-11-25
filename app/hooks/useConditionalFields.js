import { useState, useCallback } from 'react';

/**
 * Hook for managing conditional field visibility and values
 * Automatically clears values when fields are dynamically hidden.
 */
export function useConditionalFields(config = {}) {
  const [visibleFields, setVisibleFields] = useState({});
  const [fieldValues, setFieldValues] = useState({});

  const updateFieldVisibility = useCallback((triggerField, triggerValue) => {
    const conditions = config[triggerField];
    if (!conditions || !Array.isArray(conditions)) return;

    const newVisibility = {};
    const fieldsToHide = [];

    conditions.forEach((condition) => {
      const isVisible = Boolean(condition?.showWhen?.includes(triggerValue));
      newVisibility[condition.field] = isVisible;

      if (!isVisible) {
        fieldsToHide.push(condition.field);
      }
    });

    setVisibleFields((prev) => ({ ...prev, ...newVisibility }));

    if (fieldsToHide.length > 0) {
      setFieldValues((prev) => {
        const updated = { ...prev };
        fieldsToHide.forEach((field) => {
          delete updated[field];
        });
        return updated;
      });
    }
  }, [config]);

  return {
    visibleFields,
    updateFieldVisibility,
    fieldValues,
    setFieldValues,
  };
}