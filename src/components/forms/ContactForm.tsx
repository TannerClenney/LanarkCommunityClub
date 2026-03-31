"use client";

import { useState } from "react";
import { submitContact } from "@/app/actions/contact";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    const formData = new FormData(e.currentTarget);
    const result = await submitContact(formData);
    if (result.success) {
      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } else {
      setStatus("error");
      setErrorMessage(result.error ?? "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <p className="text-green-800 font-semibold">Message sent!</p>
        <p className="text-sm text-green-700 mt-1">
          Thank you for reaching out. We&apos;ll get back to you soon.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm text-green-700 underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={100}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          maxLength={200}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-y"
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
        {status === "loading" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
