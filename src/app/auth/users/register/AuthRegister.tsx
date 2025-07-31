"use client";
import { doSocialLogin } from "@/app/actions";
import { JSX, useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import CredentialsRegister from "./CredentialsRegister";
import { TermsAndPrivacy } from "@/components/ui/auth-components/TermsandConditions";

// Shared Account Creation link component
function CreateAccountLink(): JSX.Element {
  return (
    <div className="text-center">
      <p className="text-gray-600 dark:text-white/80 text-sm lg:text-base">
        have an account already?{" "}
        <a
          href="/auth/users/login"
          className="text-blue-600 dark:text-white hover:text-blue-800 dark:hover:text-blue-200 font-medium transition-colors duration-200 underline-offset-2 hover:underline"
        >
          login instead
        </a>
      </p>
    </div>
  );
}

// Shared Google Sign-In handler
function handleGoogleSignIn() {
  const formData = new FormData();
  formData.append("action", "google");
  doSocialLogin(formData);
}

// Google Sign-In Component with enhanced UI and functionality
export function GoogleSignIn(): JSX.Element {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Google Sign-In Button */}
      <Button
        onClick={handleGoogleSignIn}
        variant="secondary"
        className="w-full flex items-center justify-center gap-3 py-6 bg-white text-gray-800 hover:bg-gray-100 transition-all duration-200 shadow-sm rounded-lg"
      >
        <FcGoogle className="h-5 w-5 lg:h-6 lg:w-6" />
        <span className="font-medium">Continue with Google</span>
      </Button>

      <CreateAccountLink />
      <TermsAndPrivacy />
    </div>
  );
}

// Enhanced Resend Magic Link Component with email validation and improved UI
export function ResendSignIn(): JSX.Element {
  return (
    <div className="space-y-6 w-full">
      <CredentialsRegister />
    </div>
  );
}

// Enhanced Header Component
function EnhancedHeader(): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="text-center relative overflow-hidden">
      <div
        className={`space-y-2 transform ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        } transition-all duration-1000`}
      >
        <h2 className="flex item-center gap-1 text-lg lg:text-xl font-extrabold text-gray-900 dark:text-white">
          <span>Connect & Access</span>
          <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-400 dark:to-cyan-600">
            Essential Services
            <svg
              className="absolute -bottom-1 left-0 w-full"
              height="6"
              viewBox="0 0 200 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 3C50 3 50 3 100 3C150 3 150 3 200 3"
                stroke="url(#paint0_linear)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient
                  id="paint0_linear"
                  x1="0"
                  y1="3"
                  x2="200"
                  y2="3"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#0D9488" stopOpacity="0" />
                  <stop offset="0.5" stopColor="#0D9488" />
                  <stop offset="1" stopColor="#0891B2" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </h2>

        {/* <h3 className="lg:text-lg font-semibold text-gray-800 dark:text-gray-200 tracking-wide">
          Join the{" "}
          <span className="dark:text-teal-400 bg-gradient-to-r from-teal-500 to-emerald-400 bg-clip-text text-transparent">
            Kayaye
          </span>
          <span></span> Network
        </h3> */}
      </div>
    </div>
  );
}

// Combined auth component that can be used as a unified solution
export default function AuthRegister(): JSX.Element {
  const [authMethod, setAuthMethod] = useState<"google" | "magic-link">(
    "magic-link"
  );

  return (
    <div className="bg-white dark:bg-gray-900 w-full max-w-md overflow-y-scroll hide-scrollbar">
      <div className="p-4 lg:p-6">
        {/* Replacing the original header with the enhanced version */}
        <EnhancedHeader />

        <div className="flex space-x-2 mt-6 mb-6">
          <Button
            variant={authMethod === "magic-link" ? "default" : "outline"}
            className={`flex-1 ${
              authMethod === "magic-link"
                ? "bg-blue-600 hover:bg-blue-700"
                : "border-gray-300 dark:border-white/30 bg-transparent text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
            }`}
            onClick={() => setAuthMethod("magic-link")}
          >
            Email
          </Button>
          <Button
            variant={authMethod === "google" ? "default" : "outline"}
            className={`flex-1 ${
              authMethod === "google"
                ? "bg-blue-600 hover:bg-blue-700"
                : "border-gray-300 dark:border-white/30 bg-transparent text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
            }`}
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
