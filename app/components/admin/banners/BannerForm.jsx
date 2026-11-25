"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "../../../../lib/api";
import { ENDPOINTS } from "../../../../lib/endpoints";
import Button from "../ui/Button";
import FormField, { BASE_INPUT, stateClasses } from "../ui/FormField";
import DateTimePicker from "../jobs/DateTimePicker";

function formatError(err) {
  if (err?.error) return err.error;
  if (err?.detail) return err.detail;
  if (err?.details && typeof err.details === "string") return err.details;
  if (err?.details && typeof err.details === "object") {
    const firstKey = Object.keys(err.details)[0];
    const val = err.details[firstKey];
    return Array.isArray(val) ? val[0] : val;
  }
  return "Something went wrong. Please try again.";
}

function isoToLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localToIso(value) {
  if (!value) return "";
  return new Date(value).toISOString();
}

export default function BannerForm({ banner, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    link: "",
    location: 1,
    active_from: "",
    active_until: "",
    ordering: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    if (name === "name" && !value?.trim()) return "Banner name is required";
    if (name === "link" && value?.trim()) {
      const url = value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
      try { new URL(url); } catch { return "Enter a valid URL"; }
    }
    if (name === "active_until" && formData.active_from && value && value < formData.active_from) {
      return "Must be on or after the start date";
    }
    return null;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setFieldErrors((errs) => ({ ...errs, [name]: validateField(name, value) }));
  };

  useEffect(() => {
    if (banner) {
      setFormData({
        name: banner.name || "",
        link: banner.link || "",
        location: banner.location ?? 1,
        active_from: isoToLocal(banner.active_from),
        active_until: isoToLocal(banner.active_until),
        ordering: banner.ordering ?? 0,
      });
      setImagePreview(banner.image || null);
    }
  }, [banner]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setFieldErrors((errs) => ({ ...errs, [name]: validateField(name, value) }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {
      name: validateField("name", formData.name),
      link: validateField("link", formData.link),
      active_until: validateField("active_until", formData.active_until),
    };
    setFieldErrors(errs);
    setTouched({ name: true, link: true, active_until: true });
    if (Object.values(errs).some(Boolean)) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const isMultipart = !!imageFile;
      let body;
      if (isMultipart) {
        const fd = new FormData();
        fd.append("name", formData.name.trim());
        if (formData.link.trim()) fd.append("link", formData.link.trim());
        fd.append("location", String(formData.location));
        if (formData.active_from) fd.append("active_from", localToIso(formData.active_from));
        if (formData.active_until) fd.append("active_until", localToIso(formData.active_until));
        fd.append("ordering", String(formData.ordering));
        fd.append("image", imageFile);
        body = fd;
      } else {
        body = JSON.stringify({
          name: formData.name.trim(),
          link: formData.link.trim() || undefined,
          location: Number(formData.location),
          active_from: formData.active_from ? localToIso(formData.active_from) : undefined,
          active_until: formData.active_until ? localToIso(formData.active_until) : undefined,
          ordering: Number(formData.ordering),
        });
      }

      const saved = banner
        ? await apiFetch(ENDPOINTS.ADMIN.BANNER(banner.uuid), { method: "PATCH", body })
        : await apiFetch(ENDPOINTS.ADMIN.BANNERS, { method: "POST", body });

      onSuccess?.(banner ? "update" : "create", saved);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0b1e]/90 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          {banner ? 'Edit Banner' : 'Create New Banner'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          label="Banner Title"
          name="name"
          required
          value={formData.name}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={touched.name ? fieldErrors.name : undefined}
          placeholder="e.g. Summer Campaign Banner"
        />

        <FormField
          label="Target Link (URL)"
          name="link"
          value={formData.link}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={touched.link ? fieldErrors.link : undefined}
          placeholder="https://campaign.influencerpro.com"
        />

        <FormField.Group label="Placement Location" required>
          <select
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            className={`${BASE_INPUT} ${stateClasses(null)} cursor-pointer`}
          >
            <option value={1}>Home Banner</option>
            <option value={2}>Event Banner</option>
            <option value={3}>Post of the Day</option>
          </select>
        </FormField.Group>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField.Group label="Active From">
            <DateTimePicker
              value={formData.active_from}
              onChange={(val) => setFormData((prev) => ({ ...prev, active_from: val }))}
            />
          </FormField.Group>
          <FormField.Group label="Active Until" error={touched.active_until ? fieldErrors.active_until : undefined}>
            <DateTimePicker
              value={formData.active_until}
              onChange={(val) => setFormData((prev) => ({ ...prev, active_until: val }))}
              minDate={formData.active_from}
            />
          </FormField.Group>
        </div>

        <FormField
          label="Ordering"
          name="ordering"
          type="number"
          min="0"
          value={formData.ordering}
          onChange={handleInputChange}
          hint="Lower numbers show first."
        />

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Banner Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[#9033FF] file:text-white file:font-semibold hover:file:bg-[#7825DC] cursor-pointer"
          />
          {imagePreview && (
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Preview:</p>
              <img
                src={imagePreview}
                alt="Banner preview"
                className="w-full max-w-md h-40 object-cover rounded border border-white/10"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" size="md" loading={isSubmitting}>
            {banner ? 'Update Banner' : 'Create Banner'}
          </Button>
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
