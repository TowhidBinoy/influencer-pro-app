"use client";

export default function ErrorDisplay({ error }) {
  if (!error) return null;

  const getErrorMessage = (err) => {
    if (!err.status || err.status === 0) {
      return "Network error. Please check your internet connection.";
    }

    if (err.data) {
      if (typeof err.data === "string") return err.data;
      if (err.data.detail) return err.data.detail;
      if (err.data.details) return err.data.details;
      if (err.data.error) return err.data.error;
      if (err.data.message) return err.data.message;

      if (typeof err.data === "object") {
        const fieldErrors = [];
        for (const [field, messages] of Object.entries(err.data)) {
          if (Array.isArray(messages)) {
            fieldErrors.push(`${field}: ${messages.join(", ")}`);
          } else if (typeof messages === "string") {
            fieldErrors.push(`${field}: ${messages}`);
          }
        }
        if (fieldErrors.length > 0) {
          return fieldErrors.join("\n");
        }
      }
    }

    switch (err.status) {
      case 400:
        return "Invalid request. Please check your submitted details.";
      case 401:
        return "Authentication expired. Please log in again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested record was not found.";
      case 408:
        return "Request timeout. Please try again.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return err.message || "An unexpected error occurred.";
    }
  };

  return (
    <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-medium flex items-start gap-2.5">
      <span className="text-sm shrink-0">⚠️</span>
      <p className="whitespace-pre-line leading-relaxed">{getErrorMessage(error)}</p>
    </div>
  );
}