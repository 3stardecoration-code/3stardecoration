import { notFound } from "next/navigation";
import { getDataService } from "@/lib/services";
import { TestimonialForm } from "@/components/admin/testimonials/TestimonialForm";

export const dynamic = "force-dynamic";

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDataService();
  const [testimonial, mediaAssets] = await Promise.all([db.testimonials.getById(id), db.media.listForAdmin()]);
  if (!testimonial) notFound();

  return <TestimonialForm testimonial={testimonial} mediaAssets={mediaAssets} />;
}
