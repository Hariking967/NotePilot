"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FaGithub, FaGoogle } from "react-icons/fa";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { OctagonAlertIcon, OctagonIcon } from "lucide-react";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function SignInView() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);
    authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          setPending(false);
          router.push("/");
        },
        onError: ({ error }) => {
          setError(error.message);
        },
      }
    );
  };

  const onSocial = (provider: "google" | "github") => {
    setError(null);
    setPending(true);
    authClient.signIn.social(
      {
        provider: provider,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          setPending(false);
          // router.push('/')
        },
        onError: ({ error }) => {
          setError(error.message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="bg-black p-2 pb-1 rounded-2xl inline-block">
            <img
              src="/logo.png"
              alt="SliderAI"
              className="mx-auto h-[13.5rem] w-auto"
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-gray-400">Sign in to your account to continue</p>
        </div>

        <Card className="bg-black border-gray-800">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="me@gmail.com"
                          className="border-0 bg-white/5 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="********"
                          className="border-0 bg-white/5 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!!error && (
                  <Alert className="bg-destructive/10 border-0">
                    <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={pending}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  {pending ? "Signing in..." : "Sign In"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-black px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() => onSocial("google")}
                    className="bg-transparent border-gray-700 hover:bg-white/5 text-white"
                  >
                    <FaGoogle className="mr-2" />
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() => onSocial("github")}
                    className="bg-transparent border-gray-700 hover:bg-white/5 text-white"
                  >
                    <FaGithub className="mr-2" />
                    GitHub
                  </Button>
                </div>

                <div className="text-center">
                  <span className="text-gray-400">Don&apos;t have an account? </span>
                  <Link 
                    href="/auth/sign-up"
                    className="text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          By signing in, you agree to our{" "}
          <Link href="#" className="text-gray-400 hover:text-white underline underline-offset-4">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-gray-400 hover:text-white underline underline-offset-4">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
