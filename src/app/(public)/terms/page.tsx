import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDataService } from "@/lib/services";
import { LegalPageView } from "@/components/legal/LegalPageView";

export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getDataService().legal.getBySlug("terms");
  return {
    title: page?.title ?? "Terms & Conditions",
    description: "The terms that apply when you enquire about or book with 3 Star Decoration.",
    robots: { index: true, follow: true },
  };
}

export default async function TermsPage() {
  const page = await getDataService().legal.getBySlug("terms");
  if (!page) notFound();
  return <LegalPageView page={page} />;
}
