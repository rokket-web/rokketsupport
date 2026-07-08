"use client";

import { useRef, useState } from "react";
import { submitSupportRequestAction } from "@/app/actions/support";
import type { SupportRequestSummary } from "@/lib/supportRequests";

interface SupportRequestSectionProps {
  clientName: string;
  websiteUrl: string;
  initialRequests: SupportRequestSummary[];
}

const MAX_IMAGES = 4;

export default function SupportRequestSection({
  clientName,
  websiteUrl,
  initialRequests,
}: SupportRequestSectionProps) {
  const [requests, setRequests] = useState<SupportRequestSummary[]>(initialRequests);
  const [showPanel, setShowPanel] = useState(false);
  const [issue, setIssue] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    setIssue("");
    setDescription("");
    setImages([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function openPanel() {
    resetForm();
    setShowPanel(true);
  }

  function closePanel() {
    setShowPanel(false);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length > MAX_IMAGES) {
      setError(`You can attach up to ${MAX_IMAGES} images.`);
      setImages(files.slice(0, MAX_IMAGES));
    } else {
      setError(null);
      setImages(files);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("issue", issue);
      formData.set("description", description);
      images.forEach((file) => formData.append("images", file));

      const result = await submitSupportRequestAction(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setRequests((prev) => [result.request, ...prev]);
      closePanel();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Current Support Items
        </h2>
        <button
          type="button"
          onClick={openPanel}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Submit Support Request
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-400">
          No open support requests.
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {requests.map((request) => (
            <li key={request.id} className="px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{request.issue}</p>
              <p className="mt-1 text-xs text-gray-500">
                Submitted {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Overlay */}
      <div
        aria-hidden={!showPanel}
        onClick={closePanel}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
          showPanel ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Slide-over panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          showPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Submit Support Request
            </h3>
            <button
              type="button"
              onClick={closePanel}
              aria-label="Close"
              className="text-xl leading-none text-gray-400 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Client Name
            </label>
            <input
              value={clientName}
              disabled
              className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Website URL
            </label>
            <input
              value={websiteUrl}
              disabled
              className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600"
            />
          </div>

          <div>
            <input
              required
              placeholder="Website Issue"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none"
            />
          </div>

          <div>
            <textarea
              required
              placeholder="Please briefly describe your website issue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Upload screen shots of issue
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 file:mr-3 file:rounded-md file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
            />
            {images.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {images.length} image{images.length > 1 ? "s" : ""} selected
                (max {MAX_IMAGES})
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="mt-2 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
            <button
              type="button"
              onClick={closePanel}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
