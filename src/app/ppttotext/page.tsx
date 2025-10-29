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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultText(null);
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

            {resultText && (
              <div className="mt-6 bg-neutral-900 border border-gray-800 rounded p-4 text-sm whitespace-pre-wrap">
                <h3 className="font-semibold text-emerald-200 mb-2">
                  Extracted Text
                </h3>
                <pre className="text-gray-200">{resultText}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
