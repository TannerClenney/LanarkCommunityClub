import type { Metadata } from "next";
import LoginForm from "@/components/forms/LoginForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Lanark Community Club member account.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-green-800 text-center mb-2">Member Sign In</h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          Access your Lanark Community Club member area.
        </p>
        <LoginForm />
        <p className="text-sm text-center text-gray-500 mt-6">
          New member?{" "}
          <Link href="/register" className="text-green-700 underline font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
