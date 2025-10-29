"use client";

import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function SliderAIHome() {
  const { data } = authClient.useSession();

  return (
    <main className="min-h-screen bg-neutral-950 text-white py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              SliderAI
            </h1>
            <span className="hidden md:inline-block text-sm text-gray-400">
              Create better slides, faster
            </span>
          </div>

          <div className="flex items-center gap-3">
            {data?.user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">
                  {data.user.name ?? data.user.email ?? "User"}
                </span>
                <Button
                  variant="ghost"
                  onClick={() =>
                    authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          window.location.href = "/";
                        },
                      },
                    })
                  }
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  className="px-4 py-2 rounded-md bg-emerald-400 text-black font-semibold hover:bg-emerald-300 transition"
                >
                  SignIN
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="px-4 py-2 rounded-md bg-black text-emerald-300 border border-emerald-600 font-semibold hover:bg-emerald-900 transition"
                >
                  SignUP
                </Link>
              </>
            )}
          </div>
        </nav>

        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              SliderAI
            </h2>
            <p className="mt-2 text-lg text-gray-300 max-w-xl">
              Turn ideas and documents into beautiful slide decks instantly.
              Fast, modern, and focused on great-looking slides.
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            title="PPT Score"
            href="/pptscore"
            emoji="📊"
            description="Analyze a presentation and get a score + suggestions to improve slides, design and clarity."
          />

          <FeatureCard
            title="PPT → Text"
            href="/ppttotext"
            emoji="📄"
            description="Extract plain text from uploaded PowerPoint slides for editing, quoting, or generating study material."
          />

          <FeatureCard
            title="Quiz from PPT"
            href="/quiz"
            emoji="🧠"
            description="Create quizzes from slide content to help learners retain key points."
          />
        </section>

        <section className="mt-12">
          <div className="rounded-xl p-6 bg-gray-900/60 backdrop-blur-sm shadow-sm border border-gray-800">
            <h2 className="text-2xl font-semibold text-emerald-300">Tips</h2>
            <ul className="mt-3 text-gray-300 list-disc list-inside">
              <li>Use concise bullet points for best slide generation.</li>
              <li>Upload or paste outlines to quickly produce a full deck.</li>
              <li>
                Try different templates for different tones: pitch, education,
                or report.
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-8 bg-transparent">
          <div className="rounded-xl p-6 bg-gray-900/40 border border-gray-800">
            <h2 className="text-2xl font-semibold text-white">
              About SliderAI
            </h2>
            <p className="mt-3 text-gray-300 max-w-3xl">
              SliderAI helps you turn ideas, notes, or documents into clear,
              attractive slide decks without wrestling with layout or design. It
              focuses on practical outcomes: a clean structure, readable
              visuals, and templates that fit your purpose.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-emerald-200">
                  What you'll find
                </h3>
                <ul className="mt-2 text-gray-300 list-disc list-inside">
                  <li>Quick Text → PPT conversion from outlines or notes.</li>
                  <li>
                    Automated suggestions with PPT Score to improve clarity.
                  </li>
                  <li>Designer templates you can apply with one click.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-emerald-200">
                  How it works
                </h3>
                <ul className="mt-2 text-gray-300 list-disc list-inside">
                  <li>Paste or upload content, pick a template, get slides.</li>
                  <li>Fine-tune content and export to PPTX when ready.</li>
                  <li>
                    Generate quizzes to help learners remember key points.
                  </li>
                </ul>
              </div>
            </div>

            <p className="mt-4 text-gray-400">
              Built to be friendly, fast, and practical — like a helpful
              teammate.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  href,
  emoji,
  description,
}: {
  title: string;
  href: string;
  emoji: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl p-6 bg-gray-900 border border-gray-800 hover:scale-[1.01] transition transform shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl leading-none">{emoji}</div>
        <div>
          <h3 className="text-xl font-semibold text-white group-hover:text-emerald-200">
            {title}
          </h3>
          <p className="mt-2 text-sm text-gray-300">{description}</p>
        </div>
      </div>
      <div className="mt-4 text-sm text-emerald-300 font-medium">Try it →</div>
    </Link>
  );
}
