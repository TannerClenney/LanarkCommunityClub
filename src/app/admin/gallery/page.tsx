import type { Metadata } from "next";
import { db } from "@/lib/db";
import ArchiveButton from "@/components/ui/ArchiveButton";
import { archiveGalleryItem } from "@/app/actions/admin";
import GalleryFormModal from "./GalleryFormModal";

export const metadata: Metadata = { title: "Admin – Gallery" };

async function getItems() {
  return db.galleryItem.findMany({
    where: { archived: false },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminGalleryPage() {
  const items = await getItems();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-800">Gallery</h1>
        <GalleryFormModal />
      </div>

      {items.length === 0 ? (
        <p className="text-gray-400">No gallery items yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover" />
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
                {item.category && <p className="text-xs text-gray-400">{item.category}</p>}
                <div className="mt-2">
                  <ArchiveButton id={item.id} action={archiveGalleryItem} label="Remove" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
