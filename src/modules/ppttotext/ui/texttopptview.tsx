"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Upload } from "lucide-react";

const formSchema = z.object({
  fileType: z.enum(["text", "ppt", "pdf"], {
    required_error: "Please select a file type",
  }),
  file: z.any().refine((file) => file?.length === 1, "Please upload a file"),
});

type FormValues = z.infer<typeof formSchema>;

const fileTypeConfig = {
  text: {
    accept: ".txt,text/plain",
    label: "Text File",
  },
  ppt: {
    accept:
      ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
    label: "PowerPoint",
  },
  pdf: {
    accept: ".pdf,application/pdf",
    label: "PDF Document",
  },
};

export default function TextToPPTView() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [fileName, setFileName] = useState<string>("No file chosen");
  const [selectedFileType, setSelectedFileType] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setPending(true);

    try {
      const fileList = values.file as FileList;
      const file = fileList?.[0];

      if (!file) {
        setError("Please upload a file to convert");
        setPending(false);
        return;
      }

      // Validate file type matches selection
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const isValidType = fileTypeConfig[
        values.fileType as keyof typeof fileTypeConfig
      ].accept
        .toLowerCase()
        .includes(fileExt || "");

      if (!isValidType) {
        setError(
          `Please upload a valid ${
            fileTypeConfig[values.fileType as keyof typeof fileTypeConfig].label
          } file`
        );
        setPending(false);
        return;
      }

      // Mock conversion process
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Implement actual conversion logic here
      console.log("Converting:", {
        fileType: values.fileType,
        fileName: file.name,
        size: file.size,
      });

      // Reset form after successful conversion
      setFileName("No file chosen");
      form.reset();
      setSelectedFileType(null);
    } catch (err) {
      console.error(err);
      setError("Conversion failed. Please try again.");
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
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-6"
              >
                <div>
                  <h1 className="text-2xl font-bold">Text → PPT Converter</h1>
                  <p className="text-sm text-gray-600">
                    Select your file type and upload to convert into a
                    PowerPoint presentation.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="fileType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedFileType(value);
                          setFileName("No file chosen");
                          setError(null);
                          form.setValue("file", null);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-0 bg-white hover:bg-gray-100">
                            <SelectValue
                              placeholder="Select file type"
                              className="text-black"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem
                            value="text"
                            className="text-black hover:bg-gray-100 focus:bg-gray-100 focus:text-black"
                          >
                            Text File
                          </SelectItem>
                          <SelectItem
                            value="ppt"
                            className="text-black hover:bg-gray-100 focus:bg-gray-100 focus:text-black"
                          >
                            PowerPoint
                          </SelectItem>
                          <SelectItem
                            value="pdf"
                            className="text-black hover:bg-gray-100 focus:bg-gray-100 focus:text-black"
                          >
                            PDF Document
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Upload className="h-4 w-4" /> Upload File
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <div className="relative w-full">
                            <input
                              type="file"
                              disabled={!selectedFileType}
                              accept={
                                selectedFileType
                                  ? fileTypeConfig[
                                      selectedFileType as keyof typeof fileTypeConfig
                                    ].accept
                                  : undefined
                              }
                              onChange={(e) => {
                                const files = e.target.files;
                                onChange(files);
                                setFileName(
                                  files?.[0]?.name || "No file chosen"
                                );
                              }}
                              {...field}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
                            />
                            <div className="flex items-center gap-2 text-sm">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={!selectedFileType}
                                className="bg-white/5 border-gray-700 hover:bg-white/10"
                              >
                                Choose File
                              </Button>
                              <span className="text-gray-500">{fileName}</span>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <Alert className="bg-destructive/10 border-none">
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}

                <div className="flex items-center gap-4">
                  <Button
                    type="submit"
                    disabled={pending}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    {pending ? "Converting..." : "Convert to PPT"}
                  </Button>

                  <Link href="/">
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-white text-black border-gray-200 hover:bg-gray-100"
                    >
                      Back
                    </Button>
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
