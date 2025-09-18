import AdminPageClient from "./AdminPageClient";

export default async function AdminPage() {
  // Prefer NEXT_PUBLIC_BASE_URL if defined, else fallback to localhost
  const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const [sectionsRes, itemsRes] = await Promise.all([
  fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/sections`, { cache: "no-store" }),
  fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/items`, { cache: "no-store" })
]);


  if (!sectionsRes.ok || !itemsRes.ok) {
    throw new Error("Failed to fetch sections or items");
  }

  const [sectionsData, itemsData] = await Promise.all([
    sectionsRes.json(),
    itemsRes.json()
  ]);

  return (
    <AdminPageClient
      initialSections={sectionsData.sections || []}
      initialItems={itemsData.items || []}
    />
  );
}