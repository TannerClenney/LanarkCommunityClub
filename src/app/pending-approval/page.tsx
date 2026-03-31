import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Account Pending Approval" };

export default function PendingApprovalPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Account Pending Approval</h1>
        <p className="text-gray-600 mb-6">
          Your account has been created and is awaiting approval from a club officer.
          You&apos;ll have full access to the member area once approved.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Questions? <Link href="/contact" className="text-green-700 underline">Contact us.</Link>
        </p>
        <Link href="/" className="text-green-700 font-medium hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
