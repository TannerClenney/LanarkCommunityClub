import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Donate",
  description: "Support the Lanark Community Club through a one-time or recurring donation.",
};

export default function DonatePage() {
  const stripePublicKey = process.env.STRIPE_PUBLISHABLE_KEY;
  const stripeConfigured = !!stripePublicKey;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-4">Support the Lanark Community Club</h1>
      <p className="text-gray-600 mb-8">
        Your donations directly fund community projects, youth scholarships, and local
        events. Every dollar stays in Lanark and goes toward making our community a better
        place.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { amount: 25, label: "Supports one community event" },
          { amount: 50, label: "Helps fund a park improvement" },
          { amount: 100, label: "Contributes to a scholarship" },
        ].map((tier) => (
          <div key={tier.amount} className="border border-green-200 rounded-lg p-5 text-center bg-green-50">
            <p className="text-3xl font-bold text-green-700">${tier.amount}</p>
            <p className="text-sm text-gray-600 mt-1">{tier.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Make a Donation</h2>

        {stripeConfigured ? (
          <DonateForm />
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
            <p className="font-semibold mb-1">Online giving coming soon!</p>
            <p>
              We are setting up our secure online payment system. In the meantime, please{" "}
              <Link href="/contact" className="underline font-medium">contact us</Link>{" "}
              to make a donation by check or mail.
            </p>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-6 text-sm text-gray-600">
        <h3 className="font-semibold text-gray-800 mb-2">Other Ways to Give</h3>
        <ul className="space-y-2">
          <li>
            <strong>By mail:</strong> Send a check payable to &ldquo;Lanark Community Club&rdquo; to our
            mailing address.{" "}
            <Link href="/contact" className="text-green-700 underline">Contact us for address.</Link>
          </li>
          <li>
            <strong>Volunteer:</strong> Donate your time! We always need help at events and
            with projects.{" "}
            <Link href="/contact" className="text-green-700 underline">Get in touch.</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

function DonateForm() {
  return (
    <form action="/api/donate" method="POST" className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Donation Amount
        </label>
        <div className="flex gap-2 flex-wrap mb-2">
          {[25, 50, 100, 250].map((amt) => (
            <button
              key={amt}
              type="button"
              className="border border-green-300 text-green-700 px-4 py-2 rounded-lg text-sm hover:bg-green-50 focus:ring-2 focus:ring-green-400 transition-colors"
            >
              ${amt}
            </button>
          ))}
        </div>
        <input
          type="number"
          name="amount"
          min="1"
          step="1"
          placeholder="Or enter a custom amount"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (optional)</label>
        <input
          type="text"
          name="name"
          placeholder="Anonymous"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-yellow-500 text-green-900 font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors"
      >
        Donate Securely →
      </button>
      <p className="text-xs text-gray-400 text-center">
        Payments processed securely by Stripe. LCC does not store your payment information.
      </p>
    </form>
  );
}
