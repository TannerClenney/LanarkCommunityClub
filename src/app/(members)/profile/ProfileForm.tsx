"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/profile";

type UserData = {
  id: string;
  name: string | null;
  email: string;
  bio: string | null;
  phone: string | null;
};

export default function ProfileForm({ user }: { user: UserData }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);
    if (result.success) {
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } else {
      setStatus("error");
      setErrorMessage(result.error ?? "Update failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          name="name"
          type="text"
          defaultValue={user.name ?? ""}
          maxLength={100}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          value={user.email}
          type="email"
          disabled
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
        />
        <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
        <input
          name="phone"
          type="tel"
          defaultValue={user.phone ?? ""}
          maxLength={20}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio (optional)</label>
        <textarea
          name="bio"
          defaultValue={user.bio ?? ""}
          maxLength={500}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-y"
        />
      </div>
      {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}
      {status === "success" && <p className="text-sm text-green-600">Profile updated!</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-green-700 text-white px-4 py-2 text-sm font-semibold rounded-lg hover:bg-green-600 disabled:opacity-60 transition-colors"
      >
        {status === "loading" ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
