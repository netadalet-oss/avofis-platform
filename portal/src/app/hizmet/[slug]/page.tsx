import { PortalServicePage } from "@/components/public-portal";

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  return <PortalServicePage slug={params.slug} />;
}
