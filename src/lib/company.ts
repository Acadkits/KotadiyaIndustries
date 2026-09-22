import productsA from "@/assets/products/page5.jpg";
import productsB from "@/assets/products/page6.jpg";
import productsC from "@/assets/products/page7.jpg";

export const COMPANY = {
  name: "Kotadiya Industries",
  tagline: "Precision in Manufacturing. Excellence in Every Component.",
  contactPerson: "Dhrumil Kotadiya",
  phone: "+91 6351588010",
  phoneDigits: "916351588010",
  email: "info@kotadiyaindustries.com",
  website: "www.kotadiyaindustries.com",
  // Not provided in company profile — replace once confirmed
  addressPlaceholder: "Address to be confirmed — please share office / factory location",
  hoursPlaceholder: "Business hours to be confirmed",
} as const;

export const whatsappHref = (msg = "Hello Kotadiya Industries, I would like to discuss a manufacturing requirement.") =>
  `https://wa.me/${COMPANY.phoneDigits}?text=${encodeURIComponent(msg)}`;

export type Product = {
  slug: string;
  name: string;
  image: string;
  imagePosition: "top" | "bottom";
  blurb: string;
  applications: string[];
};

export const PRODUCTS: Product[] = [
  {
    slug: "rebar-coupler",
    name: "Rebar Coupler",
    image: productsA,
    imagePosition: "top",
    blurb:
      "Precision-machined cylindrical couplers with internal threading, engineered for reliable rebar splicing in structural applications.",
    applications: ["Construction & infrastructure", "Structural rebar splicing", "Civil engineering projects"],
  },
  {
    slug: "shaft",
    name: "Shaft",
    image: productsA,
    imagePosition: "bottom",
    blurb:
      "Turned and milled precision shaft with threaded end and keyway, suited to power transmission and mechanical assemblies.",
    applications: ["Power transmission assemblies", "Mechanical drive systems", "OEM component supply"],
  },
  {
    slug: "ss-nozzle",
    name: "S S Nozzle",
    image: productsB,
    imagePosition: "top",
    blurb:
      "Stainless steel nozzle machined for hose and pipe fittings, delivering consistent flow-path geometry and thread quality.",
    applications: ["Fluid handling systems", "Hose & pipe assemblies", "Industrial fittings"],
  },
  {
    slug: "rivet-nut",
    name: "Rivet Nut",
    image: productsB,
    imagePosition: "bottom",
    blurb:
      "Precision-produced threaded rivet nuts used to create load-bearing threads in sheet metal and hollow sections.",
    applications: ["Sheet-metal fastening", "Automotive sub-assemblies", "General fabrication"],
  },
  {
    slug: "flange",
    name: "Flange",
    image: productsC,
    imagePosition: "top",
    blurb:
      "Machined flanges for pipe and equipment connections, produced to consistent bolt-hole patterns and sealing faces.",
    applications: ["Pipe & pipeline assemblies", "Pumps & valves", "Process equipment"],
  },
  {
    slug: "brass-bush",
    name: "Brass Bush",
    image: productsC,
    imagePosition: "bottom",
    blurb:
      "Precision-turned brass bushes offering smooth bearing surfaces and dimensional consistency across production batches.",
    applications: ["Bearings & bushings", "Mechanical assemblies", "Wear-resistant applications"],
  },
];

export const CAPABILITIES = [
  {
    title: "CNC Turning",
    body: "Cylindrical precision components produced on CNC lathes with tight dimensional control and consistent surface finish.",
  },
  {
    title: "CNC Milling",
    body: "Prismatic components, slots, pockets, and profiles machined to drawing on CNC milling centres.",
  },
  {
    title: "Custom Components",
    body: "Build-to-print manufacturing from your drawings and specifications — one-off prototypes through production batches.",
  },
  {
    title: "Quality Control",
    body: "Dimensional inspection and process controls at every stage to hold accuracy across every batch.",
  },
  {
    title: "OEM Manufacturing",
    body: "Reliable component supply for OEMs, sub-assemblies, and B2B partners requiring dependable batch consistency.",
  },
  {
    title: "Precision Engineering",
    body: "Engineering-led approach focused on accuracy, repeatability, and long-term component performance.",
  },
] as const;

export const PROCESS_STEPS = [
  { n: "01", title: "Share Your Requirement", body: "Send drawings, specifications, material, and quantity." },
  { n: "02", title: "Technical Review", body: "Our team reviews feasibility, material fit, and tolerances." },
  { n: "03", title: "Quotation", body: "Transparent quotation covering cost, lead time and terms." },
  { n: "04", title: "Manufacturing", body: "Precision machining on CNC equipment with process controls." },
  { n: "05", title: "Quality Inspection", body: "Dimensional checks and final review against your drawing." },
  { n: "06", title: "Delivery", body: "Packed and dispatched with documentation for traceability." },
] as const;

// Industries — kept generic to actual CNC-component applications. Placeholder-flagged.
export const INDUSTRIES = [
  { name: "Construction", body: "Rebar couplers and structural components for civil projects." },
  { name: "Automotive", body: "Machined sub-components for automotive assemblies." },
  { name: "General Engineering", body: "Precision parts for engineering workshops and OEMs." },
  { name: "Fluid Handling", body: "Nozzles, flanges and fittings for fluid systems." },
  { name: "Process Equipment", body: "Machined components for pumps, valves, and equipment." },
  { name: "Mechanical Assemblies", body: "Bushes, shafts, and fasteners for mechanical builds." },
] as const;

export const WHY_US = [
  { title: "Precision-Focused Manufacturing", body: "Every component is produced with a focus on dimensional accuracy and repeatability." },
  { title: "Custom Component Support", body: "Build-to-print manufacturing for one-off prototypes through production batches." },
  { title: "Quality-Conscious Processes", body: "Strict quality control procedures across every stage of manufacturing." },
  { title: "Responsive Communication", body: "Fast, transparent response on inquiries, quotations, and updates." },
  { title: "Competitive Manufacturing Solutions", body: "Cost-effective machining without compromising on quality." },
  { title: "Commitment to Customer Requirements", body: "Long-term partnerships built on understanding and delivering to your needs." },
] as const;
