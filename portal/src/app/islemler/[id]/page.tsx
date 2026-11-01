import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { journeys, getJourney } from "@/lib/journeys";
import { JourneyPreparationView } from "@/components/JourneyPreparationView";

type Props = { params: { id: string } };
export const dynamicParams = false;

export function generateStaticParams() {
  return journeys.map(item => ({ id: item.id }));
}
export function generateMetadata({ params }: Props): Metadata {
  const item = getJourney(params.id);
  return {
    title: item ? item.title.tr + " | AVOfis" : "İşlem bulunamadı | AVOfis",
    description: item?.preparation.tr ?? "AVOfis işlem hazırlığı",
    robots: { index: false, follow: false }
  };
}
export default function JourneyDetailPage({ params }: Props) {
  const item = getJourney(params.id);
  if (!item) notFound();
  return <JourneyPreparationView journey={item} />;
}
