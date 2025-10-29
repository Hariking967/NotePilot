"use client";

import React, { useState, useRef } from "react";
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
import { PlusCircle, Upload } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  // file is handled via the input element; zod can't validate FileList easily here
  file: z.any().optional(),
  criteria: z
    .array(
      z.object({
        text: z.string().min(1, "Evaluation field is required"),
      })
    )
    .min(1, "Add at least one evaluation field"),
});

type FormValues = z.infer<typeof formSchema>;

export default function PPTScorePage() {
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [fileName, setFileName] = useState<string>("No file chosen");
  const { data: session } = authClient.useSession();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { criteria: [{ text: "Overall clarity" }] },
  });

  const { control, handleSubmit, register } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "criteria",
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setScore(null);
    setPending(true);

    try {
      const fileList = (values as any).file as FileList | undefined;
      const file = fileList?.[0];
      if (!file) {
        setError("Please upload a PPT file to evaluate.");
        setPending(false);
        return;
      }

      // Mock evaluation logic: compute a score from 1 to 10 based on file size and number of criteria.
      const sizeFactor = Math.min(6, Math.round(file.size / 200_000)); // 0..6
      const criteriaFactor = Math.min(4, fields.length); // 0..4
      const raw = sizeFactor + criteriaFactor; // 0..10
      const computed = Math.max(1, Math.min(10, raw));

      // small artificial delay to simulate processing
      await new Promise((r) => setTimeout(r, 700));

      setScore(computed);

      // Optionally: send data to server / trpc here
      // e.g., await trpc.ppt.evaluate.mutateAsync({ ... })
    } catch (err) {
      console.error(err);
      setError("Evaluation failed. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-black to-neutral-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
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
                  render={() => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Upload className="h-4 w-4" /> Upload PPT
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <div className="relative w-full">
                            <input
                              type="file"
                              accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                              {...register("file", {
                                onChange: (e) => {
                                  const file = e.target.files?.[0];
                                  setFileName(file ? file.name : "No file chosen");
                                }
                              })}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            />
                            <div className="flex items-center gap-2 text-sm">
                              <Button type="button" variant="outline" size="sm">Choose File</Button>
                              <span className="text-gray-500">{fileName}</span>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
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
                              <Input {...field} placeholder={`Field ${idx + 1}`} />
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
                      <div className="text-3xl font-bold text-emerald-300">{score}/10</div>
                    </div>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

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
