import { STAFF_TOP_LEVEL, staffModuleBySlug } from "./staff-module-directory";

/**
 * Level 2 information-only handoffs. These are screen navigation suggestions,
 * NOT case routing, patient/client records, assignment, approval or real actions.
 * Review every edge for jurisdiction, authorization and human workflow design.
 */
export const STAFF_SCREEN_HANDOFFS: Readonly<Record<(typeof STAFF_TOP_LEVEL)[number]["slug"], readonly string[]>> = {
  inbox: ["triage","messages"],
  triage: ["matters","research"],
  matters: ["documents","calendar","audit"],
  calendar: ["matters","messages"],
  documents: ["pleadings","audit"],
  pleadings: ["research","judicial"],
  research: ["pleadings","judicial"],
  judicial: ["matters","audit"],
  ind: ["research","matters"],
  messages: ["inbox","matters"],
  billing: ["payables","audit"],
  payables: ["billing","audit"],
  reporting: ["audit","settings"],
  audit: ["reporting","settings"],
  people: ["settings","audit"],
  settings: ["people","audit"]
};

export type StaffHandoff = {
  slug: string;
  title: string;
  scope: string;
  href: string;
  status: "NAVIGATION_ONLY_NOT_AUTHORIZED";
};

export function staffScreenHandoffs(slug: string): StaffHandoff[] {
  if (!staffModuleBySlug(slug)) return [];
  return (STAFF_SCREEN_HANDOFFS[slug as keyof typeof STAFF_SCREEN_HANDOFFS] ?? [])
    .flatMap(next => {
      const module = staffModuleBySlug(next);
      return module ? [{
        slug: module.slug, title: module.title, scope: module.scope,
        href: "/personel/" + module.slug,
        status: "NAVIGATION_ONLY_NOT_AUTHORIZED" as const
      }] : [];
    });
}

export function validateStaffScreenHandoffs(): boolean {
  const slugs = STAFF_TOP_LEVEL.map(item => item.slug);
  if(slugs.length !== 16 || new Set(slugs).size !== 16 ||
     Object.keys(STAFF_SCREEN_HANDOFFS).length !== 16 ||
     Object.keys(STAFF_SCREEN_HANDOFFS).some(slug => !slugs.includes(slug))) return false;
  return slugs.every(slug => {
    const next = STAFF_SCREEN_HANDOFFS[slug as keyof typeof STAFF_SCREEN_HANDOFFS];
    return next.length > 0 && next.every(id => id !== slug && slugs.includes(id)) &&
      next.length === new Set(next).size;
  });
}
