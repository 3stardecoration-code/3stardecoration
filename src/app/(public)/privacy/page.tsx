import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDataService } from "@/lib/services";
import { LegalPageView } from "@/components/legal/LegalPageView";

export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getDataService().legal.getBySlug("privacy");
  return {
    title: page?.title ?? "Privacy Policy",
    description: "How 3 Star Decoration collects and uses your information.",
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPage() {
  const page = await getDataService().legal.getBySlug("privacy");
  if (!page) notFound();
  return <LegalPageView page={page} />;
}
