/** AV-044/045/051: a closed, non-binding public navigation skeleton. */
export type StageTwoAudience = {
  slug: string; title: string; journeyIds: readonly string[]; serviceSlugs: readonly string[];
};
export type StageTwoJourney = {
  id: string; title: string; serviceSlugs: readonly string[];
};
export type StageTwoService = { slug: string; title: string };

export function validateStageTwoNavigation(
  audiences: readonly StageTwoAudience[],
  journeys: readonly StageTwoJourney[],
  services: readonly StageTwoService[]
): void {
  const unique = (values: readonly string[]) => new Set(values).size === values.length;
  const a = audiences.map(item => item.slug);
  const j = journeys.map(item => item.id);
  const s = services.map(item => item.slug);
  if (a.length !== 14 || j.length !== 12 || s.length !== 17 ||
      !unique(a) || !unique(j) || !unique(s)) {
    throw new Error("STAGE_TWO_CANONICAL_COUNT_OR_DUPLICATE");
  }
  for (const audience of audiences) {
    if (!audience.title || !audience.journeyIds.length || !audience.serviceSlugs.length ||
        !unique(audience.journeyIds) || !unique(audience.serviceSlugs) ||
        audience.journeyIds.some(id => !j.includes(id)) ||
        audience.serviceSlugs.some(slug => !s.includes(slug))) {
      throw new Error("STAGE_TWO_AUDIENCE_LINK_INVALID");
    }
  }
  if (journeys.some(item => !item.title || !item.serviceSlugs.length ||
      !unique(item.serviceSlugs) || item.serviceSlugs.some(slug => !s.includes(slug)))) {
    throw new Error("STAGE_TWO_JOURNEY_LINK_INVALID");
  }
  if (new Set(audiences.flatMap(item => item.journeyIds)).size !== 12 ||
      new Set(audiences.flatMap(item => item.serviceSlugs)).size !== 17) {
    throw new Error("STAGE_TWO_COVERAGE_GAP");
  }
}

export function stageTwoJourneyIds(
  audienceSlug: string, audiences: readonly StageTwoAudience[]
): readonly string[] {
  return audiences.find(item => item.slug === audienceSlug)?.journeyIds ?? [];
}

/** A forged ID cannot generate a customer action, external URL or unauthorized service link. */
export function stageTwoRelatedServices(
  audienceSlug: string,
  journeyId: string,
  audiences: readonly StageTwoAudience[],
  journeys: readonly StageTwoJourney[],
  services: readonly StageTwoService[]
): StageTwoService[] {
  const audience = audiences.find(item => item.slug === audienceSlug);
  if (!audience || !audience.journeyIds.includes(journeyId)) return [];
  const journey = journeys.find(item => item.id === journeyId);
  if (!journey) return [];
  const permitted = new Set([...audience.serviceSlugs, ...journey.serviceSlugs]);
  return services.filter(item => permitted.has(item.slug));
}
