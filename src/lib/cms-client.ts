import { queryOptions, useQuery } from "@tanstack/react-query";
import { getPublishedCompany, getPublishedContent, getPublishedProducts } from "@/lib/cms.functions";
import {
  COMPANY,
  PRODUCTS,
  CAPABILITIES,
  INDUSTRIES,
  WHY_US,
  PROCESS_STEPS,
  type Product,
} from "@/lib/company";

// -------- Company --------
export type SiteCompany = {
  name: string;
  tagline: string;
  contactPerson: string;
  phone: string;
  phoneDigits: string;
  email: string;
  website: string;
  address: string;
  hours: string;
};

const COMPANY_FALLBACK: SiteCompany = {
  name: COMPANY.name,
  tagline: COMPANY.tagline,
  contactPerson: COMPANY.contactPerson,
  phone: COMPANY.phone,
  phoneDigits: COMPANY.phoneDigits,
  email: COMPANY.email,
  website: COMPANY.website,
  address: "",
  hours: "",
};

export const companyQueryOptions = queryOptions({
  queryKey: ["site", "company"],
  queryFn: async () => {
    const data = await getPublishedCompany();
    return { ...COMPANY_FALLBACK, ...(data as Partial<SiteCompany> | null ?? {}) };
  },
  staleTime: 5 * 60_000,
});

export function useSiteCompany(): SiteCompany {
  const q = useQuery({ ...companyQueryOptions, initialData: COMPANY_FALLBACK, initialDataUpdatedAt: 0 });
  return q.data;
}

export const whatsappHrefFor = (
  digits: string,
  msg = "Hello Kotadiya Industries, I would like to discuss a manufacturing requirement.",
) => `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;

// -------- Products --------
const PRODUCTS_FALLBACK: Product[] = PRODUCTS.map((p) => ({ ...p }));

export const productsQueryOptions = queryOptions({
  queryKey: ["site", "products"],
  queryFn: async () => {
    const rows = await getPublishedProducts();
    if (!rows || rows.length === 0) return PRODUCTS_FALLBACK;
    // Merge: prefer CMS row; if imageUrl empty and slug matches fallback, use fallback image.
    return rows.map((r) => {
      const fb = PRODUCTS_FALLBACK.find((p) => p.slug === r.slug);
      return {
        slug: r.slug,
        name: r.name || fb?.name || r.slug,
        blurb: r.blurb || fb?.blurb || "",
        applications: r.applications?.length ? r.applications : fb?.applications ?? [],
        imagePosition: r.imagePosition ?? fb?.imagePosition ?? "top",
        image: r.image || fb?.image || "",
      } satisfies Product;
    });
  },
  staleTime: 60_000,
});

export function useSiteProducts(): Product[] {
  const q = useQuery({ ...productsQueryOptions, initialData: PRODUCTS_FALLBACK, initialDataUpdatedAt: 0 });
  return q.data;
}

// -------- Content blocks --------
export const CONTENT_KEYS = [
  "home.hero",
  "home.intro",
  "home.capabilities",
  "home.process",
  "home.industries",
  "home.why",
  "about.intro",
  "quality.intro",
  "contact.intro",
] as const;
export type ContentKey = (typeof CONTENT_KEYS)[number];

export const CONTENT_FALLBACKS: Record<ContentKey, any> = {
  "home.hero": {
    eyebrow: "Precision Engineering • Est. 2026",
    title: "Precision Engineered. Built for Performance.",
    subtitle:
      "Kotadiya Industries delivers precision-manufactured CNC components and custom engineering solutions with a strong focus on quality, accuracy, and dependable service.",
    ctaPrimary: "Request a Quote",
    ctaSecondary: "Explore Our Capabilities",
  },
  "home.intro": {
    eyebrow: "Who We Are",
    title: "Engineering Precision Into Every Component",
    body:
      "Kotadiya Industries is a manufacturer of precision-engineered CNC components. Our work is built on accuracy, consistent quality, and a commitment to understanding each customer's requirement — from single prototypes to production batches.",
  },
  "home.capabilities": {
    eyebrow: "Capabilities",
    title: "Built Around Manufacturing Capability",
    items: CAPABILITIES.map((c) => ({ title: c.title, body: c.body })),
  },
  "home.process": {
    eyebrow: "Process",
    title: "From Requirement to Finished Component",
    items: PROCESS_STEPS.map((s) => ({ n: s.n, title: s.title, body: s.body })),
  },
  "home.industries": {
    eyebrow: "Industries",
    title: "Supporting Diverse Industrial Requirements",
    items: INDUSTRIES.map((i) => ({ name: i.name, body: i.body })),
  },
  "home.why": {
    eyebrow: "Why Us",
    title: "Why Work With Kotadiya Industries?",
    items: WHY_US.map((w) => ({ title: w.title, body: w.body })),
  },
  "about.intro": {
    eyebrow: "About Us",
    title: "A New Manufacturing Company Built With a Precision-First Approach",
    body:
      "Kotadiya Industries is a trusted manufacturer of precision-engineered CNC components, dedicated to delivering high-quality machining solutions across a range of industries.",
  },
  "quality.intro": {
    eyebrow: "Quality",
    title: "Quality at Every Stage",
    body: "Inspection and process controls at incoming material, in-process, and final stages hold accuracy across every batch.",
  },
  "contact.intro": {
    eyebrow: "Contact",
    title: "Talk to Our Team",
    body: "Send us your drawing or requirement — we respond quickly with feasibility, quotation, and lead time.",
  },
};

export const contentQueryOptions = queryOptions({
  queryKey: ["site", "content"],
  queryFn: async () => {
    const rows = await getPublishedContent({ data: { keys: [...CONTENT_KEYS] } });
    return rows as Record<string, any>;
  },
  staleTime: 60_000,
});

export function useSiteContent<K extends ContentKey>(key: K): any {
  const q = useQuery({ ...contentQueryOptions, initialData: {} as Record<string, any>, initialDataUpdatedAt: 0 });
  const published = q.data?.[key];
  const fallback = CONTENT_FALLBACKS[key];
  if (!published) return fallback;
  // Merge shallow so missing fields fall back
  if (Array.isArray(published) || typeof published !== "object") return published;
  return { ...fallback, ...published };
}
