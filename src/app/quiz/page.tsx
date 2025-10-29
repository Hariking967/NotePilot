"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Upload, Brain } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
}

const formSchema = z.object({
  file: z.any().refine((file) => file?.name, "Please select a PPT file"),
});

type FormValues = z.infer<typeof formSchema>;

export default function QuizFromPPT() {
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: FormValues) => {
    const file = values.file;
    if (!file) return setError("Please select a PPT file.");

    setError(null);
    setQuiz([]);
    setScore(null);
    setPending(true);

    try {
      // Step 1️⃣ — Upload PPT to Flask for text extraction
      const formData = new FormData();
      formData.append("file", file);

      const extractRes = await fetch("/api/evaluate_ppt", {
        method: "POST",
        body: formData,
      });
      const extractData = await extractRes.json();

      if (!extractRes.ok || !extractData.ppt_text) {
        throw new Error(
          extractData.error || "Failed to extract text from PPT."
        );
      }

      // Step 2️⃣ — Send extracted text to Flask for quiz generation
      const quizRes = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractData.ppt_text }),
      });

      const quizData = await quizRes.json();
      if (!quizRes.ok || !quizData.quiz || !Array.isArray(quizData.quiz)) {
        throw new Error("Failed to generate quiz from extracted text.");
      }

      setQuiz(quizData.quiz);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  const handleAnswer = useCallback((qIndex: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: answer }));
  }, []);

  const handleSubmitQuiz = () => {
    let correct = 0;
    quiz.forEach((q, i) => {
      if (answers[i] === q.correct_answer) correct++;
    });
    setScore(correct);
  };

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
              <div className="text-lg font-medium">Generating Quiz…</div>
            </div>
          </div>
        )}

        <Card className="overflow-hidden p-0">
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-6"
              >
                <div>
                  <h1 className="text-2xl font-bold">PPT Quiz Generator</h1>
                  <p className="text-sm text-gray-400">
                    Upload your PowerPoint presentation and we'll generate a
                    quiz automatically.
                  </p>
                </div>

                <FormField
                  control={form.control}
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

                {!!error && (
                  <Alert className="bg-destructive/10 border-none">
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}

                <div className="flex items-center gap-4">
                  <Button type="submit" disabled={pending}>
                    {pending ? "Generating..." : "Generate Quiz"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Quiz Display */}
        {quiz.length > 0 && (
          <div className="mt-6">
            <Card>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="h-6 w-6 text-emerald-300" />
                  <h2 className="text-xl font-semibold">Generated Quiz</h2>
                </div>

                {quiz.map((q, index) => (
                  <div key={index} className="mb-6">
                    <div className="font-medium mb-2">
                      {index + 1}. {q.question}
                    </div>
                    {q.options.map((opt, optIdx) => (
                      <label
                        key={optIdx}
                        className={`block cursor-pointer p-3 rounded border mb-2 ${
                          answers[index] === opt
                            ? "border-emerald-500 bg-emerald-900/20"
                            : "border-neutral-700 bg-neutral-800/40 hover:border-emerald-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${index}`}
                          value={opt}
                          checked={answers[index] === opt}
                          onChange={() => handleAnswer(index, opt)}
                          className="mr-2 accent-emerald-500"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ))}

                <Button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(answers).length < quiz.length}
                  className="w-full"
                >
                  Submit Quiz
                </Button>

                {score !== null && (
                  <div className="mt-4 text-center text-emerald-300 text-lg">
                    You scored {score} / {quiz.length} (
                    {Math.round((score / quiz.length) * 100)}%)
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
