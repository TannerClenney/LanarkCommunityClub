import type { Metadata } from "next";
import RegisterForm from "@/components/forms/RegisterForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Lanark Community Club member account.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-green-800 text-center mb-2">Create Account</h1>
        <p className="text-gray-500 text-sm text-center mb-2">
          Sign up to request membership in the Lanark Community Club.
        </p>
        <p className="text-xs text-center text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2 mb-6">
          Accounts require officer approval before accessing the member area.
        </p>
        <RegisterForm />
        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-green-700 underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
