import Link from "next/link";
import React from "react";

export default function PPTTemplatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-black to-neutral-900 text-white flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-gradient-to-r from-green-900 to-black border border-gray-800 rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-emerald-300 mb-4">
          PPT Templates
        </h1>
        <p className="text-gray-300 mb-6">
          Choose from designer templates to change the tone and style of your
          slides.
        </p>
        <div className="flex gap-4">
          <Link
            href="/"
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-semibold"
          >
            Back
          </Link>
          <button className="px-4 py-2 rounded border border-gray-700 text-gray-200">
            Browse Templates (coming)
          </button>
        </div>
      </div>
    </div>
  );
}
