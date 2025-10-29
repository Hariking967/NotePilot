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

// ====================
// 🧩 Schema
// ====================
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

// ====================
// 🧠 Component
// ====================
export default function PPTScoreView() {
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { criteria: [{ text: "Overall clarity" }] },
  });

  const { control, handleSubmit } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "criteria",
  });

  // 🚀 Submit
  const onSubmit = async (values: FormValues) => {
    setError(null);
    setScore(null);
    setPending(true);

    try {
      // 1️⃣ Upload file
      const file = values.file;
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/uploads/local", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData?.serverPath)
        throw new Error(uploadData?.error || "File upload failed.");

      // 2️⃣ Prepare field list (merge defaults + user-added)
      const baseFields = [
        "Core Relevance & Narrative Hook",
        "Central Thesis or Problem Definition",
        "Unique Value Proposition (UVP) & Novelty",
        "Stakeholder Impact & Broad Application",
        "Methodology and Technical Authority",
        "Quantifiable Value & ROI",
        "Limitations, Risks, and Mitigation Strategy",
        "Delivery, Authority, and Credibility",
        "Overall clarity",
        "Deployment Scalability",
        "Ethical AI Use",
      ];

      const userFields = values.criteria.map((c) => c.text.trim());
      const allFields = Array.from(new Set([...baseFields, ...userFields]));

      // 3️⃣ Send to backend
      const payload = {
        filePath: uploadData.serverPath,
        fields: allFields.map((f) => ({ Pillar_Title: f, Critique: "" })),
      };

      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      const evalJson = await res.json();
      const fullResult = evalJson.result || evalJson;

      setEvaluationResult(fullResult);

      // 4️⃣ Compute overall score
      const overall = fullResult?.Overall_Presentation_Rating?.Average_Score;
      if (typeof overall === "number") setScore(Math.round(overall));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Evaluation failed.");
    } finally {
      setPending(false);
    }
  };

  const formattedResult = evaluationResult;

  // ====================
  // 🧾 UI
  // ====================
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-black to-neutral-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        {pending && (
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
        )}

        <Card className="overflow-hidden p-0">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
                <h1 className="text-2xl font-bold">PPT Evaluation</h1>
                <p className="text-sm text-gray-400">
                  Upload your presentation and add custom evaluation pillars.
                  The AI will score all fields.
                </p>

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

                {/* User Fields */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel>Evaluation Fields</FormLabel>
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

                  {fields.map((f, idx) => (
                    <FormField
                      key={f.id}
                      control={control}
                      name={`criteria.${idx}.text`}
                      render={({ field }) => (
                        <FormItem className="flex items-start gap-2">
                          <FormControl className="flex-1">
                            <Input
                              {...field}
                              placeholder={`Field ${idx + 1}`}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(idx)}
                          >
                            Remove
                          </Button>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                {error && (
                  <Alert className="bg-destructive/10 border-none">
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}

                <div className="flex items-center gap-4">
                  <Button type="submit" disabled={pending}>
                    {pending ? "Evaluating..." : "Evaluate"}
                  </Button>
                  <Link href="/">
                    <Button variant="outline">Back</Button>
                  </Link>

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

        {/* Results */}
        {formattedResult && (
          <div className="mt-6">
            <Card>
              <CardContent>
                <h2 className="text-xl font-semibold">Evaluation Result</h2>

                <div className="mt-4 space-y-4">
                  {/* Overall */}
                  <div className="p-4 rounded-lg bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 ring-1 ring-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-900/20 rounded-full">
                        <Star className="h-6 w-6 text-emerald-300" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Overall</div>
                        <div className="flex items-baseline gap-3">
                          <div className="text-4xl font-extrabold text-emerald-300">
                            {
                              formattedResult.Overall_Presentation_Rating
                                ?.Average_Score
                            }
                            <span className="text-lg text-gray-400">/10</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            {
                              formattedResult.Overall_Presentation_Rating
                                ?.Score_Percentage
                            }
                            %
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-300">
                          {
                            formattedResult.Overall_Presentation_Rating
                              ?.Justification
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pillars */}
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Pillars</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(formattedResult.Pillars_of_Evaluation || []).map(
                        (p: any, i: number) => (
                          <div
                            key={i}
                            className="p-4 rounded-lg ring-1 ring-emerald-800 bg-black transition"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center h-12 w-12 rounded-full ring-1 ring-emerald-700 bg-black">
                                <div className="text-lg font-bold text-white">
                                  {p.Score ?? "-"}
                                </div>
                                <div className="text-xs text-white/60">/10</div>
                              </div>
                              <div className="flex-1">
                                <div className="p-2 rounded text-sm font-semibold bg-black ring-1 ring-emerald-800 text-white">
                                  {p.Pillar_Title}
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 text-sm text-gray-300">
                              {p.Critique}
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
        )}
      </div>
    </div>
  );
}
