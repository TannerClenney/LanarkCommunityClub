"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setStatus("error");
      setErrorMessage("Invalid email or password. Please try again.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {errorMessage}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-green-700 text-white font-semibold py-2 rounded-lg hover:bg-green-600 disabled:opacity-60 transition-colors"
      >
        {status === "loading" ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
