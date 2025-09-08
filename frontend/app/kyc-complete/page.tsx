"use client";

import { useEffect } from "react";

export default function KycCompletePage() {
  useEffect(() => {
    // Auto-close the tab after a few seconds for mobile users
    const timer = setTimeout(() => {
      if (window.opener) {
        // If opened from another window, close this tab
        window.close();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-offwhite w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden w-full max-w-lg">
        <div className="p-6 sm:p-8 space-y-6 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
            <svg className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>

          {/* Title and Message */}
          <div className="space-y-3">
            <h1 className="text-xl lg:text-2xl font-heading font-bold text-gray-700">
              Documents Captured Successfully!
            </h1>
            <p className="text-base lg:text-lg text-gray-600 font-body leading-relaxed">
              Your documents have been captured and uploaded. Please return to your web browser to complete the verification process.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-sm text-blue-700 font-medium">
              💡 Go back to the web browser where you scanned the QR code to review and submit your documents.
            </p>
          </div>

          {/* Auto-close message */}
          <p className="text-xs text-gray-500 font-body">
            You can close this page now and return to your web browser to continue.
          </p>

          {/* Return to homepage button */}
          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="inline-flex items-center px-6 py-3 bg-purple-primary text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}
