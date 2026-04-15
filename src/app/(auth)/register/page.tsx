import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Membership Access",
  description: "Membership access for the Lanark Community Club is invite-only.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-green-800 text-center mb-2">Membership Access</h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          Membership is invite-only. Please contact the club if you need access.
        </p>
        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-green-700 underline font-medium">
            Sign in
          </Link>
        </p>
        <p className="text-sm text-center text-gray-500 mt-3">
          Need access?{" "}
          <Link href="/contact" className="text-green-700 underline font-medium">
            Contact the club
          </Link>
        </p>
      </div>
    </div>
  );
}
