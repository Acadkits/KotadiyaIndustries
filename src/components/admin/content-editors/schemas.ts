export type FieldDef = {
  name: string;
  label: string;
  hint?: string;
  type: "text" | "textarea";
  required?: boolean;
  maxLength?: number;
};

export type SectionSchema =
  | {
      kind: "object";
      fields: FieldDef[];
    }
  | {
      kind: "objectWithList";
      fields: FieldDef[]; // top-level fields (eyebrow, title, …)
      listKey: string; // e.g. "items"
      listLabel: string; // e.g. "Items"
      itemLabel: string; // e.g. "Item"
      itemFields: FieldDef[];
      autoNumberField?: string; // e.g. "n" → auto-fills "01", "02" on add
    };

const EYEBROW: FieldDef = {
  name: "eyebrow",
  label: "Eyebrow",
  hint: "Small uppercase label shown above the title.",
  type: "text",
  maxLength: 80,
};
const TITLE: FieldDef = {
  name: "title",
  label: "Title",
  type: "text",
  required: true,
  maxLength: 160,
};
const BODY: FieldDef = {
  name: "body",
  label: "Body",
  type: "textarea",
  maxLength: 800,
};

export const CONTENT_SCHEMAS: Record<string, SectionSchema> = {
  "home.hero": {
    kind: "object",
    fields: [
      EYEBROW,
      {
        name: "title",
        label: "Title",
        hint: "Use a line break (Enter) to split the accent line, e.g. 'Precision Engineered.' then 'Built for Performance.'",
        type: "textarea",
        required: true,
        maxLength: 200,
      },
      { name: "subtitle", label: "Subtitle", type: "textarea", maxLength: 400 },
      { name: "ctaPrimary", label: "Primary button label", type: "text", maxLength: 40 },
      { name: "ctaSecondary", label: "Secondary button label", type: "text", maxLength: 40 },
    ],
  },
  "home.intro": { kind: "object", fields: [EYEBROW, TITLE, BODY] },
  "about.intro": { kind: "object", fields: [EYEBROW, TITLE, BODY] },
  "quality.intro": { kind: "object", fields: [EYEBROW, TITLE, BODY] },
  "contact.intro": { kind: "object", fields: [EYEBROW, TITLE, BODY] },
  "home.capabilities": {
    kind: "objectWithList",
    fields: [EYEBROW, TITLE],
    listKey: "items",
    listLabel: "Capabilities",
    itemLabel: "Capability",
    itemFields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 80 },
      { name: "body", label: "Description", type: "textarea", maxLength: 400 },
    ],
  },
  "home.process": {
    kind: "objectWithList",
    fields: [EYEBROW, TITLE],
    listKey: "items",
    listLabel: "Steps",
    itemLabel: "Step",
    autoNumberField: "n",
    itemFields: [
      { name: "n", label: "Number", hint: "e.g. 01, 02…", type: "text", maxLength: 4 },
      { name: "title", label: "Title", type: "text", required: true, maxLength: 80 },
      { name: "body", label: "Description", type: "textarea", maxLength: 400 },
    ],
  },
  "home.industries": {
    kind: "objectWithList",
    fields: [EYEBROW, TITLE],
    listKey: "items",
    listLabel: "Industries",
    itemLabel: "Industry",
    itemFields: [
      { name: "name", label: "Name", type: "text", required: true, maxLength: 80 },
      { name: "body", label: "Description", type: "textarea", maxLength: 400 },
    ],
  },
  "home.why": {
    kind: "objectWithList",
    fields: [EYEBROW, TITLE],
    listKey: "items",
    listLabel: "Points",
    itemLabel: "Point",
    itemFields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 80 },
      { name: "body", label: "Description", type: "textarea", maxLength: 400 },
    ],
  },
};

export function schemaDefault(key: string): any {
  const s = CONTENT_SCHEMAS[key];
  if (!s) return {};
  const obj: any = {};
  for (const f of s.kind === "object" ? s.fields : s.fields) obj[f.name] = "";
  if (s.kind === "objectWithList") obj[s.listKey] = [];
  return obj;
}

export function normalize(schema: SectionSchema, value: any): any {
  const out: any = {};
  for (const f of schema.fields) {
    const v = value?.[f.name];
    if (typeof v === "string") out[f.name] = v.trim();
    else if (v != null) out[f.name] = v;
  }
  if (schema.kind === "objectWithList") {
    const list = Array.isArray(value?.[schema.listKey]) ? value[schema.listKey] : [];
    out[schema.listKey] = list
      .map((it: any) => {
        const row: any = {};
        for (const f of schema.itemFields) {
          const v = it?.[f.name];
          if (typeof v === "string") row[f.name] = v.trim();
          else if (v != null) row[f.name] = v;
        }
        return row;
      })
      .filter((row: any) => schema.itemFields.some((f) => (row[f.name] ?? "") !== ""));
  }
  return out;
}

export function validate(schema: SectionSchema, value: any): string[] {
  const errs: string[] = [];
  for (const f of schema.fields) {
    if (f.required && !((value?.[f.name] ?? "").toString().trim())) {
      errs.push(`${f.label} is required.`);
    }
  }
  if (schema.kind === "objectWithList") {
    const list: any[] = value?.[schema.listKey] ?? [];
    list.forEach((it, i) => {
      for (const f of schema.itemFields) {
        if (f.required && !((it?.[f.name] ?? "").toString().trim())) {
          errs.push(`${schema.itemLabel} ${i + 1}: ${f.label} is required.`);
        }
      }
    });
  }
  return errs;
}
