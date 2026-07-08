"use client";

import type { SupportRequestDetails } from "@/lib/supportRequests";

interface SupportRequestModalProps {
  request: SupportRequestDetails;
  onClose: () => void;
}

export default function SupportRequestModal({
  request,
  onClose,
}: SupportRequestModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{request.issue}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-xl leading-none text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Client
            </p>
            <p className="mt-1 text-gray-900">{request.clientName}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Website
            </p>
            <p className="mt-1 text-gray-900">{request.websiteUrl}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Submitted
            </p>
            <p className="mt-1 text-gray-900">
              {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Description
            </p>
            <p className="mt-1 whitespace-pre-wrap text-gray-900">
              {request.description}
            </p>
          </div>

          {request.images.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Screenshots
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {request.images.map((image, index) => (
                  // eslint-disable-next-line @next/next/no-img-element -- base64 data URI, not a static asset
                  <img
                    key={index}
                    src={image.dataUrl}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full rounded-md border border-gray-200 object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
