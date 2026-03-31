import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from Lanark Community Club events, projects, and history.",
};

async function getGallery() {
  return db.galleryItem.findMany({
    where: { archived: false },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export default async function GalleryPage() {
  const items = await getGallery();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-4">Photo Gallery</h1>
      <p className="text-gray-600 mb-8">
        A look back at LCC events, community projects, and the people who make Lanark great.
      </p>

      {items.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-400">
          <p className="text-lg">Photos coming soon!</p>
          <p className="text-sm mt-2">Check back after our next event.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="break-inside-avoid rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full object-cover"
              />
              <div className="p-3">
                <p className="font-medium text-gray-800 text-sm">{item.title}</p>
                {item.caption && <p className="text-xs text-gray-500 mt-1">{item.caption}</p>}
                {item.category && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {item.category}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
