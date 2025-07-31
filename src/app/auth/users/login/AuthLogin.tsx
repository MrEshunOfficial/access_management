"use client";
import { doSocialLogin } from "@/app/actions";
import { JSX, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import CredentialsLogin from "./CredentialsLogin";
import { TermsAndPrivacy } from "@/components/ui/auth-components/TermsandConditions";
import Link from "next/link";

function CreateAccountLink(): JSX.Element {
  return (
    <div className="text-center">
      <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base transition-colors duration-200">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/users/register"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 underline-offset-2 hover:underline"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}

function handleGoogleSignIn() {
  const formData = new FormData();
  formData.append("action", "google");
  doSocialLogin(formData);
}

export function GoogleSignIn(): JSX.Element {
  return (
    <div className="space-y-6 p-3 lg:p-4">
      {/* Google Sign-In Button */}
      <Button
        onClick={handleGoogleSignIn}
        variant="secondary"
        className="w-full flex items-center justify-center gap-3 py-5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 shadow-sm rounded-lg"
      >
        <FcGoogle className="h-5 w-5 lg:h-6 lg:w-6" />
        <span className="font-medium">Continue with Google</span>
      </Button>

      <CreateAccountLink />
      <TermsAndPrivacy />
    </div>
  );
}

export function ResendSignIn(): JSX.Element {
  return (
    <div className="space-y-5">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700 transition-colors duration-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 transition-colors duration-200">
            login with
          </span>
        </div>
      </div>
      <CredentialsLogin />
      <CreateAccountLink />
      <TermsAndPrivacy />
    </div>
  );
}

export default function AuthLogin(): JSX.Element {
  const [authMethod, setAuthMethod] = useState<"google" | "magic-link">(
    "magic-link"
  );

  return (
    <div className="bg-white dark:bg-gray-900 w-full max-w-md hide-scrollbar transition-colors duration-200">
      <div className="p-4 lg:p-6">
        <div className="flex flex-col justify-center items-center mb-4 lg:mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
            Welcome Back to{" "}
            <span className="text-teal-600 dark:text-teal-400 transition-colors duration-200">
              Errands Mate
            </span>
          </h2>
          <span className="text-gray-500 dark:text-gray-400 text-sm ml-2 transition-colors duration-200">
            Please choose your preferred sign-in method
          </span>
        </div>

        <div className="flex space-x-2 mb-4 lg:mb-6">
          <Button
            variant={authMethod === "magic-link" ? "default" : "outline"}
            className={`flex-1 ${
              authMethod === "magic-link"
                ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
                : "border-gray-300 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            } transition-colors duration-200`}
            onClick={() => setAuthMethod("magic-link")}
          >
            Email
          </Button>
          <Button
            variant={authMethod === "google" ? "default" : "outline"}
            className={`flex-1 ${
              authMethod === "google"
                ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
                : "border-gray-300 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            } transition-colors duration-200`}
            onClick={() => setAuthMethod("google")}
          >
            Google
          </Button>
        </div>

        {authMethod === "google" ? <GoogleSignIn /> : <ResendSignIn />}
      </div>
    </div>
  );
}
