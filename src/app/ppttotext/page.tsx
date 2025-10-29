"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Alert, AlertTitle } from "@/components/ui/alert";

export default function PPTtoTextPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultText(null);
    setSummary(null);
    if (!file) return setError("Please choose a PPT file to upload.");

    setPending(true);
    try {
      // 1) Upload locally to get serverPath
      const formData = new FormData();
      formData.append("file", file as Blob, file.name);

      const uploadRes = await fetch("/api/uploads/local", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData?.serverPath) {
        throw new Error(uploadData?.error || "Upload failed");
      }

      // 2) Ask server-side API to convert PPT -> text
      const pptPath = uploadData.serverPath;
      const textRes = await fetch("/api/ppttotext", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ppt_path: pptPath }),
      });

      if (!textRes.ok) {
        const details = await textRes.text();
        throw new Error(details || "Failed to extract text from PPT");
      }

      const text = await textRes.text();
      setResultText(text);

      // Get summary of the extracted text
      const summaryRes = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!summaryRes.ok) {
        throw new Error("Failed to generate summary");
      }

      const summaryData = await summaryRes.json();
      setSummary(summaryData.summary);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || String(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-black to-neutral-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <Card className="overflow-hidden p-0">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-2">PPT → Text</h1>
            <p className="text-sm text-gray-400 mb-4">
              Upload a PowerPoint file and extract its slide text for review or
              further processing.
            </p>

            <form onSubmit={onSubmit} className="grid gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">File</label>
                <input
                  type="file"
                  accept=".ppt,.pptx"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-gray-900 bg-white/5 rounded p-2"
                />
              </div>

              {error && (
                <Alert className="bg-destructive/10 border-none">
                  <AlertTitle>{error}</AlertTitle>
                </Alert>
              )}

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={pending}>
                  {pending ? "Extracting..." : "Extract Text"}
                </Button>

                <Link href="/">
                  <Button type="button" variant="outline">
                    Back
                  </Button>
                </Link>
              </div>
            </form>

            {(resultText || summary) && (
              <div className="mt-6 space-y-6">
                {summary && (
                  <div className="bg-white border border-emerald-800 rounded-lg p-4">
                    <h3 className="font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                      Summary
                    </h3>
                    <div className="text-black text-sm leading-relaxed">
                      {summary}
                    </div>
                  </div>
                )}

                {resultText && (
                  <div className="bg-neutral-900 border border-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold text-emerald-200 mb-2 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <line x1="10" y1="9" x2="8" y2="9" />
                      </svg>
                      Full Text
                    </h3>
                    <pre className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">
                      {resultText}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
