"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, Upload, Star } from "lucide-react";
// Supabase and auth removed for local-file MVP

const formSchema = z.object({
  file: z.any().refine((file) => file?.name, "Please select a PPT file"),
  criteria: z
    .array(
      z.object({
        text: z.string().min(1, "Evaluation field is required"),
      })
    )
    .min(1, "Add at least one evaluation field"),
});

type FormValues = z.infer<typeof formSchema>;

export default function PPTScoreView() {
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [jsonPayload, setJsonPayload] = useState<string | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  // Style for the white overlay
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "white",
    zIndex: 100,
    pointerEvents: "none", // Allows clicking through the overlay
  };
  // auth removed for MVP; this is a local-file only flow

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { criteria: [{ text: "Overall clarity" }] },
  });

  const { control, handleSubmit } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "criteria",
  });

  const onSubmit = async (values: FormValues) => {
    const criteria = values.criteria; // array of { text: string }
    const texts = criteria.map((c) => c.text); // ['Overall clarity', '...']
    setError(null);
    setScore(null);
    setPending(true);
    try {
      // 1) Upload file to get server path
      const file = values.file;
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/uploads/local", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData?.serverPath) {
        throw new Error(uploadData?.error || "Upload failed");
      }

      // Normalize field text to ensure consistent comparison
      const normalizeText = (text: string) => text.toLowerCase().trim();

      // Get unique fields while preserving order of first appearance
      const seenFields = new Set<string>();
      const uniqueFields = values.criteria.filter((field) => {
        const normalizedText = normalizeText(field.text);
        if (seenFields.has(normalizedText)) {
          return false;
        }
        seenFields.add(normalizedText);
        return true;
      });

      const payload = {
        fields: uniqueFields.map((f) => ({
          Pillar_Title: f.text,
          Critique: "",
        })),
        filePath: uploadData.serverPath,
      };
      // store the request payload for display/debugging
      setJsonPayload(JSON.stringify(payload, null, 2));
      // Call our server proxy which runs ppt->text then evaluate (avoids CORS)
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: payload.filePath,
          fields: payload.fields,
        }),
      });

      if (!res.ok) {
        // try to parse JSON error body, then fallback to text
        let bodyText = "";
        try {
          bodyText = await res.text();
        } catch (e) {
          bodyText = String(e);
        }
        throw new Error(
          `Evaluation proxy error: ${res.status} ${res.statusText} ${bodyText}`
        );
      }

      const evalJson = await res.json();
      console.log("Evaluation response:", evalJson); // For debugging

      // Define interfaces for type safety
      interface PillarEvaluation {
        Pillar_Title?: string;
        title?: string;
        name?: string;
        Score?: number;
        Pillar_Score?: number;
        score?: number;
        Critique?: string;
        critique?: string;
        feedback?: string;
      }

      // Ensure we have the correct structure for display
      // First, get the original pillars array
      const originalPillars = (evalJson.Pillars_of_Evaluation ||
        evalJson.pillars ||
        []) as PillarEvaluation[];

      // Create a map of normalized titles to their evaluations
      const pillarMap = new Map<string, PillarEvaluation>(
        originalPillars.map((p) => [
          normalizeText(p.Pillar_Title || p.title || p.name || ""),
          p,
        ])
      );

      // Ensure all user-specified fields are included
      const formattedPillars = uniqueFields.map((field) => {
        const normalizedTitle = normalizeText(field.text);
        const existingPillar = pillarMap.get(normalizedTitle);

        return {
          Pillar_Title: field.text, // Use original user input
          Score:
            existingPillar?.Score ??
            existingPillar?.Pillar_Score ??
            existingPillar?.score ??
            0,
          Critique:
            existingPillar?.Critique ??
            existingPillar?.critique ??
            existingPillar?.feedback ??
            "No feedback available",
        };
      });

      const formattedResponse = {
        ...evalJson,
        Pillars_of_Evaluation: formattedPillars,
        Overall_Presentation_Rating: evalJson.Overall_Presentation_Rating || {
          Average_Score: evalJson.overall_score,
          Score_Percentage: evalJson.score_percentage,
          Justification: evalJson.justification,
        },
      };

      setEvaluationResult(formattedResponse);

      // If overall score exists, display it
      const overall = (evalJson as any)?.Overall_Presentation_Rating
        ?.Average_Score;
      if (typeof overall === "number") setScore(Math.round(overall));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Submission failed. Please try again.");
    } finally {
      setPending(false);
    }
  };

  const formattedResult = evaluationResult?.result ?? evaluationResult;

  const copyToClipboard = async (text: string | null) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      // small UX hint could be added (toast). For now we just silently copy.
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-black to-neutral-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        {/* Fullscreen evaluating overlay */}
        {pending ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="flex flex-col items-center gap-4">
              <svg
                className="animate-spin h-12 w-12 text-emerald-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <div className="text-lg font-medium">Evaluating…</div>
            </div>
          </div>
        ) : null}
        <Card className="overflow-hidden p-0">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
                <div>
                  <h1 className="text-2xl font-bold">PPT Evaluation</h1>
                  <p className="text-sm text-gray-400">
                    Upload a PPT/X presentation and add evaluation fields. Click
                    Evaluate to get a score out of 10.
                  </p>
                </div>

                <FormField
                  control={control}
                  name="file"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Upload className="h-4 w-4" /> Select PPT/PPTX File
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".ppt,.pptx"
                          onChange={(e) => onChange(e.target.files?.[0])}
                          className="bg-neutral-800 border-neutral-700 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  {/* Evaluation result will appear below the form to keep the form compact */}
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="m-0">Evaluation Fields</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => append({ text: "" })}
                      className="flex items-center gap-2"
                    >
                      <PlusCircle className="h-4 w-4" /> Add field
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {fields.map((f, idx) => (
                      <FormField
                        key={f.id}
                        control={control}
                        name={`criteria.${idx}.text` as const}
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-2">
                            <FormControl className="flex-1">
                              <Input
                                {...field}
                                placeholder={`Field ${idx + 1}`}
                              />
                            </FormControl>
                            <div className="flex flex-col gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(idx)}
                              >
                                Remove
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>

                {!!error && (
                  <Alert className="bg-destructive/10 border-none">
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}

                <div className="flex items-center gap-4">
                  <Button type="submit" disabled={pending}>
                    {pending ? "Evaluating..." : "Evaluate"}
                  </Button>

                  {score !== null && (
                    <div className="ml-auto text-right">
                      <div className="text-sm text-gray-400">Score</div>
                      <div className="text-3xl font-bold text-emerald-300">
                        {score}/10
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Formatted evaluation output placed below the form for clarity */}
        {formattedResult ? (
          <div className="mt-6">
            <Card>
              <CardContent>
                <h2 className="text-xl font-semibold">Evaluation Result</h2>
                <div className="mt-4 space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 ring-1 ring-neutral-800 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-900/20 rounded-full">
                        <Star className="h-6 w-6 text-emerald-300" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Overall</div>
                        <div className="flex items-baseline gap-3">
                          <div className="text-4xl font-extrabold text-emerald-300">
                            {formattedResult.Overall_Presentation_Rating
                              ?.Average_Score ?? "N/A"}
                            <span className="text-lg font-medium text-gray-300">
                              /10
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">
                            {formattedResult.Overall_Presentation_Rating
                              ?.Score_Percentage
                              ? `${formattedResult.Overall_Presentation_Rating.Score_Percentage}%`
                              : null}
                          </div>
                        </div>
                        {formattedResult.Overall_Presentation_Rating
                          ?.Justification ? (
                          <p className="mt-2 text-sm text-gray-300 max-w-prose">
                            {
                              formattedResult.Overall_Presentation_Rating
                                .Justification
                            }
                          </p>
                        ) : null}
                      </div>
                      <div className="ml-auto text-right">
                        {score !== null ? (
                          <div>
                            <div className="text-xs text-gray-400">
                              Your Score
                            </div>
                            <div className="text-2xl font-bold text-emerald-300">
                              {score}/10
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Pillars</div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(formattedResult.Pillars_of_Evaluation || []).map(
                        (p: any, i: number) => (
                          <div
                            key={i}
                            className="transform hover:-translate-y-1 transition rounded-lg bg-neutral-900/60 p-4 ring-1 ring-neutral-800 shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-900/10">
                                <div className="text-lg font-extrabold text-emerald-300">
                                  {p.Score ?? p.Pillar_Score ?? p.score ?? "-"}
                                </div>
                                <div className="text-xs text-gray-400">/10</div>
                              </div>
                              <div className="flex-1">
                                <div className="mt-0 bg-neutral-800 p-2 rounded text-sm font-semibold text-gray-100">
                                  {p.Pillar_Title ??
                                    p.title ??
                                    p.name ??
                                    "Unknown"}
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 text-sm text-gray-300">
                              {p.Critique ??
                                p.critique ??
                                p.feedback ??
                                "No feedback available"}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="mt-6">
          <Link
            href="/"
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-semibold"
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  );
}
