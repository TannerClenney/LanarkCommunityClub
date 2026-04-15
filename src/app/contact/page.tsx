import type { Metadata } from "next";
import ContactForm from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Lanark Community Club.",
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-4">Contact Us</h1>
      <p className="text-gray-600 mb-8">
        Have a question, want to get involved, or just want to say hello? We&apos;d love to
        hear from you.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="font-semibold text-gray-800 mb-3">Send a Message</h2>
          <ContactForm />
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold text-gray-800 mb-2">Location</h2>
            <p className="text-gray-600 text-sm">Lanark, Illinois 61046</p>
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 mb-2">Connect</h2>
            <p className="text-gray-600 text-sm">
              Follow us on{" "}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline"
              >
                Facebook
              </a>{" "}
              for the latest news and event photos.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 mb-2">Membership</h2>
            <p className="text-gray-600 text-sm">
              Interested in joining the LCC? Membership is invite-only. Please contact the club for access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
