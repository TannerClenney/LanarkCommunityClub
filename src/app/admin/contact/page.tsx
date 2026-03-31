import type { Metadata } from "next";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import MarkReadButton from "./MarkReadButton";

export const metadata: Metadata = { title: "Admin – Contact Inbox" };

async function getMessages() {
  return db.contactSubmission.findMany({
    orderBy: [{ read: "asc" }, { createdAt: "desc" }],
  });
}

export default async function AdminContactPage() {
  const messages = await getMessages();

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-800 mb-6">Contact Inbox</h1>

      {messages.length === 0 ? (
        <p className="text-gray-400">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}
              className={`border rounded-lg p-5 ${msg.read ? "bg-gray-50 border-gray-200" : "bg-white border-green-300 shadow-sm"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{msg.name}</p>
                  <p className="text-sm text-gray-500">{msg.email}</p>
                  <p className="text-xs text-gray-400">{formatDateTime(msg.createdAt)}</p>
                  <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                </div>
                {!msg.read && <MarkReadButton id={msg.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
