import "dotenv/config";
import http from "node:http";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const PORT = Number(process.env.PORT || 3001);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase env vars");
}

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function text(res, status, body) {
  res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  res.end(body);
}

function getOrigin(req) {
  return req.headers.origin || "";
}

function originAllowed(req) {
  if (ALLOWED_ORIGINS.includes("*")) return true;
  const origin = getOrigin(req);
  return !!origin && ALLOWED_ORIGINS.includes(origin);
}

function corsHeaders(req) {
  const origin = getOrigin(req);
  if (!originAllowed(req)) return {};
  return {
    "access-control-allow-origin": origin || ALLOWED_ORIGINS[0] || "",
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "content-type, authorization, apikey, x-client-info",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    vary: "Origin",
  };
}

function assertOrigin(req) {
  if (!originAllowed(req)) throw new Error("Bad origin");
}

function supabaseForRequest(req) {
  const auth = req.headers.authorization || "";
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers ?? undefined);
        headers.set("apikey", SUPABASE_ANON_KEY);
        if (auth) headers.set("authorization", auth);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

function publicClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

function notFound(res) {
  json(res, 404, { error: "Not found" });
}

async function signPaths(sb, paths) {
  const unique = [...new Set((paths || []).filter(Boolean))];
  if (!unique.length) return {};
  const { data } = await sb.storage.from("site-media").createSignedUrls(unique, 60 * 60 * 24);
  const out = {};
  for (const item of data ?? []) {
    if (item?.path && item?.signedUrl) out[item.path] = item.signedUrl;
  }
  return out;
}

function normalizeProduct(row, urlMap) {
  const d = row.published ?? {};
  const path = d.imagePath ?? null;
  return {
    id: row.id,
    slug: row.slug,
    name: d.name ?? row.slug,
    blurb: d.blurb ?? "",
    applications: Array.isArray(d.applications) ? d.applications : [],
    imagePosition: d.imagePosition === "bottom" ? "bottom" : "top",
    imagePath: path,
    image: path ? urlMap[path] ?? "" : "",
    specs: d.specs && typeof d.specs === "object" ? d.specs : {},
  };
}

async function requireAdmin(req) {
  const sb = supabaseForRequest(req);
  const { data: userData } = await sb.auth.getUser();
  if (!userData?.user) throw new Error("Unauthorized");
  const { data, error } = await sb.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
  if (error || !data) throw new Error("Forbidden");
  return { sb, userId: userData.user.id };
}

async function handlePublicProducts(req, res) {
  const sb = publicClient();
  const { data, error } = await sb.from("products").select("id, slug, published, published_at, is_hidden, sort_order").not("published_at", "is", null).eq("is_hidden", false).order("sort_order", { ascending: true }).limit(200);
  if (error) throw error;
  const rows = data ?? [];
  const urls = await signPaths(sb, rows.map((r) => r.published?.imagePath).filter(Boolean));
  json(res, 200, rows.map((r) => normalizeProduct(r, urls)));
}

async function handlePublicProduct(req, res, slug) {
  const sb = publicClient();
  const { data: row, error } = await sb.from("products").select("id, slug, published, published_at, is_hidden").eq("slug", slug).not("published_at", "is", null).eq("is_hidden", false).maybeSingle();
  if (error) throw error;
  if (!row) return json(res, 200, null);
  const urls = await signPaths(sb, [(row.published ?? {}).imagePath].filter(Boolean));
  json(res, 200, normalizeProduct(row, urls));
}

async function handlePublicContent(req, res, body) {
  const sb = publicClient();
  const keys = Array.isArray(body.keys) ? body.keys : [];
  const { data: rows, error } = await sb.from("content_blocks").select("key, published").in("key", keys).not("published_at", "is", null);
  if (error) throw error;
  const out = {};
  for (const r of rows ?? []) out[r.key] = r.published;
  const paths = [];
  JSON.stringify(out, (_k, v) => {
    if (v && typeof v === "object" && typeof v.imagePath === "string") paths.push(v.imagePath);
    return v;
  });
  const urls = await signPaths(sb, paths);
  const attach = (node) => {
    if (Array.isArray(node)) return node.map(attach);
    if (node && typeof node === "object") {
      const copy = { ...node };
      if (typeof copy.imagePath === "string") copy.imageUrl = urls[copy.imagePath] ?? "";
      for (const k of Object.keys(copy)) copy[k] = attach(copy[k]);
      return copy;
    }
    return node;
  };
  for (const k of Object.keys(out)) out[k] = attach(out[k]);
  json(res, 200, out);
}

async function handlePublicCompany(req, res) {
  const sb = publicClient();
  const { data, error } = await sb.from("company_settings").select("published").eq("id", 1).maybeSingle();
  if (error) throw error;
  json(res, 200, data?.published ?? null);
}

async function handleInquirySubmit(req, res, body) {
  assertOrigin(req);
  if (body.hp) return json(res, 200, { ok: true });
  const sb = publicClient();
  const { error } = await sb.from("inquiries").insert({
    full_name: body.full_name,
    company_name: body.company_name ?? null,
    email: body.email,
    phone: body.phone ?? null,
    inquiry_type: body.inquiry_type ?? null,
    message: body.message,
  });
  if (error) throw error;
  json(res, 200, { ok: true });
}

async function handleRfqSubmit(req, res, body) {
  assertOrigin(req);
  if (body.hp) return json(res, 200, { ok: true });
  const sb = publicClient();
  const { error } = await sb.from("rfq_requests").insert({
    full_name: body.full_name,
    company_name: body.company_name,
    email: body.email,
    phone: body.phone,
    city: body.city ?? null,
    state: body.state ?? null,
    country: body.country ?? null,
    requirement_type: body.requirement_type,
    product_name: body.product_name ?? null,
    material: body.material ?? null,
    quantity: body.quantity ?? null,
    expected_delivery_date: body.expected_delivery_date || null,
    specifications: body.specifications ?? null,
    additional_notes: body.additional_notes ?? null,
    file_urls: body.file_urls ?? [],
  });
  if (error) throw error;
  json(res, 200, { ok: true });
}

async function handleCheckAdmin(req, res) {
  try {
    const { sb, userId } = await requireAdmin(req);
    const { data } = await sb.rpc("has_role", { _user_id: userId, _role: "admin" });
    json(res, 200, { isAdmin: !!data });
  } catch (e) {
    json(res, 200, { isAdmin: false });
  }
}

async function handleClaimFirstAdmin(req, res) {
  const { sb } = await requireAdmin(req);
  const { data, error } = await sb.rpc("claim_first_admin");
  if (error) throw error;
  json(res, 200, { claimed: !!data });
}

async function listRfqs(req, res) {
  const { sb } = await requireAdmin(req);
  const { data, error } = await sb.from("rfq_requests").select("id, full_name, company_name, email, phone, requirement_type, status, created_at, product_name").order("created_at", { ascending: false }).limit(500);
  if (error) throw error;
  json(res, 200, data ?? []);
}

async function getRfq(req, res, id) {
  const { sb } = await requireAdmin(req);
  const { data, error } = await sb.from("rfq_requests").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return json(res, 404, { error: "Not found" });
  json(res, 200, data);
}

async function updateRfqStatus(req, res, id, body) {
  const { sb } = await requireAdmin(req);
  const { error } = await sb.from("rfq_requests").update({ status: body.status }).eq("id", id);
  if (error) throw error;
  json(res, 200, { ok: true });
}

async function signRfqFile(req, res, id, body) {
  const { sb } = await requireAdmin(req);
  const path = body.path;
  const { data: row, error: rowErr } = await sb.from("rfq_requests").select("file_urls").eq("id", id).maybeSingle();
  if (rowErr) throw rowErr;
  if (!row) return json(res, 404, { error: "Not found" });
  const files = Array.isArray(row.file_urls) ? row.file_urls : [];
  if (!files.some((f) => f?.path === path)) return json(res, 400, { error: "File does not belong to this RFQ" });
  const { data, error } = await sb.storage.from("rfq-uploads").createSignedUrl(path, 300);
  if (error) throw error;
  json(res, 200, { url: data.signedUrl });
}

async function listInquiries(req, res) {
  const { sb } = await requireAdmin(req);
  const { data, error } = await sb.from("inquiries").select("id, full_name, company_name, email, phone, inquiry_type, status, created_at, message").order("created_at", { ascending: false }).limit(500);
  if (error) throw error;
  json(res, 200, data ?? []);
}

async function getInquiry(req, res, id) {
  const { sb } = await requireAdmin(req);
  const { data, error } = await sb.from("inquiries").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return json(res, 404, { error: "Not found" });
  json(res, 200, data);
}

async function updateInquiryStatus(req, res, id, body) {
  const { sb } = await requireAdmin(req);
  const { error } = await sb.from("inquiries").update({ status: body.status }).eq("id", id);
  if (error) throw error;
  json(res, 200, { ok: true });
}

async function publicCompanyAdmin(req, res) {
  const { sb } = await requireAdmin(req);
  const { data, error } = await sb.from("company_settings").select("draft, published, updated_at").eq("id", 1).maybeSingle();
  if (error) throw error;
  json(res, 200, data ?? { draft: {}, published: null });
}

async function saveCompanyDraft(req, res, body) {
  const { sb } = await requireAdmin(req);
  const { error } = await sb.from("company_settings").upsert({ id: 1, draft: body.draft });
  if (error) throw error;
  json(res, 200, { ok: true });
}

async function publishCompany(req, res) {
  const { sb } = await requireAdmin(req);
  const { data: row, error: rowErr } = await sb.from("company_settings").select("draft").eq("id", 1).maybeSingle();
  if (rowErr) throw rowErr;
  const { error } = await sb.from("company_settings").update({ published: row?.draft ?? {}, published_at: new Date().toISOString() }).eq("id", 1);
  if (error) throw error;
  json(res, 200, { ok: true });
}

async function listMedia(req, res) {
  const { sb } = await requireAdmin(req);
  const { data, error } = await sb.from("media_library").select("id, path, filename, mime, size, alt, created_at").order("created_at", { ascending: false });
  if (error) throw error;
  const urls = await signPaths(sb, (data ?? []).map((m) => m.path));
  json(res, 200, (data ?? []).map((m) => ({ ...m, url: urls[m.path] ?? "" })));
}

async function registerMedia(req, res, body) {
  const { sb } = await requireAdmin(req);
  const { error } = await sb.from("media_library").insert(body);
  if (error) throw error;
  json(res, 200, { ok: true });
}

async function deleteMedia(req, res, body) {
  const { sb } = await requireAdmin(req);
  const { error } = await sb.from("media_library").delete().eq("id", body.id);
  if (error) throw error;
  await sb.storage.from("site-media").remove([body.path].filter(Boolean));
  json(res, 200, { ok: true });
}

async function updateMediaAlt(req, res, body) {
  const { sb } = await requireAdmin(req);
  const { error } = await sb.from("media_library").update({ alt: body.alt }).eq("id", body.id);
  if (error) throw error;
  json(res, 200, { ok: true });
}

async function listProducts(req, res) {
  const { sb } = await requireAdmin(req);
  const { data, error } = await sb.from("products").select("id, slug, sort_order, is_hidden, published_at, draft, published, updated_at").order("sort_order", { ascending: true });
  if (error) throw error;
  const urls = await signPaths(sb, (data ?? []).flatMap((r) => [r.draft?.imagePath, r.published?.imagePath]).filter(Boolean));
  json(res, 200, (data ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    sort_order: r.sort_order,
    is_hidden: r.is_hidden,
    published_at: r.published_at,
    updated_at: r.updated_at,
    draft: r.draft ?? {},
    hasDraftChanges: JSON.stringify(r.draft ?? {}) !== JSON.stringify(r.published ?? {}),
    previewImage: r.draft?.imagePath ? urls[r.draft.imagePath] ?? null : null,
  })));
}

async function getProduct(req, res, id) {
  const { sb } = await requireAdmin(req);
  const { data, error } = await sb.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return json(res, 404, { error: "Not found" });
  const urls = await signPaths(sb, [(data.draft ?? {}).imagePath, (data.published ?? {}).imagePath].filter(Boolean));
  json(res, 200, { ...data, urls });
}

async function createProduct(req, res, body) {
  const { sb } = await requireAdmin(req);
  const { data: max } = await sb.from("products").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const nextOrder = ((max?.sort_order) ?? 0) + 10;
  const { data, error } = await sb.from("products").insert({ slug: body.slug, draft: body.draft, sort_order: nextOrder }).select("id").single();
  if (error) throw error;
  json(res, 200, { id: data.id });
}

async function updateProductDraft(req, res, body) {
  const { sb } = await requireAdmin(req);
  const patch = { draft: body.draft };
  if (typeof body.is_hidden === "boolean") patch.is_hidden = body.is_hidden;
  if (body.slug) patch.slug = body.slug;
  const { error } = await sb.from("products").update(patch).eq("id", body.id);
  if (error) throw error;
  json(res, 200, { ok: true });
}

async function publishProduct(req, res, body) {
  const { sb } = await requireAdmin(req);
  const { data: row, error: rowErr } = await sb.from("products").select("draft").eq("id", body.id).maybeSingle();
  if (rowErr) throw rowErr;
  const { error } = await sb.from("products").update({ published: row?.draft ?? {}, published_at: new Date().toISOString() }).eq("id", body.id);
  if (error) throw error;
  json(res, 200, { ok: true });
}

async function discardProductDraft(req, res, body) {
  const { sb } = await requireAdmin(req);
  const { error } = await sb.from("products").update({ draft: {} }).eq("id", body.id);
  if (error) throw error;
  json(res, 200, { ok: true });
}

async function deleteProduct(req, res, body) {
  const { sb } = await requireAdmin(req);
  const { error } = await sb.from("products").delete().eq("id", body.id);
  if (error) throw error;
  json(res, 200, { ok: true });
}

async function reorderProduct(req, res, body) {
  const { sb } = await requireAdmin(req);
  const { data: rows, error } = await sb.from("products").select("id, sort_order").order("sort_order", { ascending: true });
  if (error) throw error;
  const idx = (rows ?? []).findIndex((r) => r.id === body.id);
  if (idx < 0) return json(res, 404, { error: "Not found" });
  const swap = body.direction === "up" ? idx - 1 : idx + 1;
  if (swap < 0 || swap >= (rows ?? []).length) return json(res, 200, { ok: true });
  const a = rows[idx], b = rows[swap];
  await sb.from("products").update({ sort_order: b.sort_order }).eq("id", a.id);
  await sb.from("products").update({ sort_order: a.sort_order }).eq("id", b.id);
  json(res, 200, { ok: true });
}

async function listContent(req, res) {
  const { sb } = await requireAdmin(req);
  const { data, error } = await sb.from("content_blocks").select("key, label, draft, published, published_at, updated_at").order("key", { ascending: true });
  if (error) throw error;
  json(res, 200, data ?? []);
}

async function getContent(req, res, key) {
  const { sb } = await requireAdmin(req);
  const { data, error } = await sb.from("content_blocks").select("*").eq("key", key).maybeSingle();
  if (error) throw error;
  if (!data) return json(res, 404, { error: "Not found" });
  json(res, 200, data);
}

async function saveContentDraft(req, res, body) {
  const { sb } = await requireAdmin(req);
  const { error } = await sb.from("content_blocks").update({ draft: body.draft }).eq("key", body.key);
  if (error) throw error;
  json(res, 200, { ok: true });
}

async function publishContent(req, res, body) {
  const { sb } = await requireAdmin(req);
  const { data: row, error: rowErr } = await sb.from("content_blocks").select("draft").eq("key", body.key).maybeSingle();
  if (rowErr) throw rowErr;
  const { error } = await sb.from("content_blocks").update({ published: row?.draft ?? {}, published_at: new Date().toISOString() }).eq("key", body.key);
  if (error) throw error;
  json(res, 200, { ok: true });
}

async function discardContentDraft(req, res, body) {
  const { sb } = await requireAdmin(req);
  const { error } = await sb.from("content_blocks").update({ draft: {} }).eq("key", body.key);
  if (error) throw error;
  json(res, 200, { ok: true });
}

async function handle(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const { pathname } = url;

    for (const [key, value] of Object.entries(corsHeaders(req))) {
      res.setHeader(key, value);
    }

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === "GET" && pathname === "/api/public/products") return await handlePublicProducts(req, res);
    if (req.method === "GET" && pathname.startsWith("/api/public/products/")) return await handlePublicProduct(req, res, decodeURIComponent(pathname.slice("/api/public/products/".length)));
    if (req.method === "POST" && pathname === "/api/public/content") return await handlePublicContent(req, res, await readJson(req));
    if (req.method === "GET" && pathname === "/api/public/company") return await handlePublicCompany(req, res);
    if (req.method === "POST" && pathname === "/api/public/inquiry") return await handleInquirySubmit(req, res, await readJson(req));
    if (req.method === "POST" && pathname === "/api/public/rfq") return await handleRfqSubmit(req, res, await readJson(req));

    if (req.method === "GET" && pathname === "/api/admin/check") return await handleCheckAdmin(req, res);
    if (req.method === "POST" && pathname === "/api/admin/claim-first-admin") return await handleClaimFirstAdmin(req, res);
    if (req.method === "GET" && pathname === "/api/admin/rfqs") return await listRfqs(req, res);
    if (req.method === "GET" && pathname.startsWith("/api/admin/rfqs/")) {
      const rest = pathname.slice("/api/admin/rfqs/".length);
      if (rest.endsWith("/status")) return await updateRfqStatus(req, res, rest.replace(/\/status$/, ""), await readJson(req));
      if (rest.endsWith("/sign-file")) return await signRfqFile(req, res, rest.replace(/\/sign-file$/, ""), await readJson(req));
      return await getRfq(req, res, rest);
    }
    if (req.method === "POST" && pathname.startsWith("/api/admin/rfqs/") && pathname.endsWith("/status")) return await updateRfqStatus(req, res, pathname.slice("/api/admin/rfqs/".length, -"/status".length), await readJson(req));
    if (req.method === "POST" && pathname.startsWith("/api/admin/rfqs/") && pathname.endsWith("/sign-file")) return await signRfqFile(req, res, pathname.slice("/api/admin/rfqs/".length, -"/sign-file".length), await readJson(req));

    if (req.method === "GET" && pathname === "/api/admin/inquiries") return await listInquiries(req, res);
    if (req.method === "GET" && pathname.startsWith("/api/admin/inquiries/")) {
      const rest = pathname.slice("/api/admin/inquiries/".length);
      if (rest.endsWith("/status")) return await updateInquiryStatus(req, res, rest.replace(/\/status$/, ""), await readJson(req));
      return await getInquiry(req, res, rest);
    }
    if (req.method === "POST" && pathname.startsWith("/api/admin/inquiries/") && pathname.endsWith("/status")) return await updateInquiryStatus(req, res, pathname.slice("/api/admin/inquiries/".length, -"/status".length), await readJson(req));

    if (req.method === "GET" && pathname === "/api/admin/company") return await publicCompanyAdmin(req, res);
    if (req.method === "POST" && pathname === "/api/admin/company/draft") return await saveCompanyDraft(req, res, await readJson(req));
    if (req.method === "POST" && pathname === "/api/admin/company/publish") return await publishCompany(req, res);

    if (req.method === "GET" && pathname === "/api/admin/media") return await listMedia(req, res);
    if (req.method === "POST" && pathname === "/api/admin/media/register") return await registerMedia(req, res, await readJson(req));
    if (req.method === "POST" && pathname === "/api/admin/media/delete") return await deleteMedia(req, res, await readJson(req));
    if (req.method === "POST" && pathname === "/api/admin/media/alt") return await updateMediaAlt(req, res, await readJson(req));

    if (req.method === "GET" && pathname === "/api/admin/products") return await listProducts(req, res);
    if (req.method === "GET" && pathname.startsWith("/api/admin/products/") && !pathname.endsWith("/publish") && !pathname.endsWith("/discard") && !pathname.endsWith("/reorder")) return await getProduct(req, res, pathname.slice("/api/admin/products/".length));
    if (req.method === "POST" && pathname === "/api/admin/products/create") return await createProduct(req, res, await readJson(req));
    if (req.method === "POST" && pathname === "/api/admin/products/update") return await updateProductDraft(req, res, await readJson(req));
    if (req.method === "POST" && pathname === "/api/admin/products/publish") return await publishProduct(req, res, await readJson(req));
    if (req.method === "POST" && pathname === "/api/admin/products/discard") return await discardProductDraft(req, res, await readJson(req));
    if (req.method === "POST" && pathname === "/api/admin/products/delete") return await deleteProduct(req, res, await readJson(req));
    if (req.method === "POST" && pathname === "/api/admin/products/reorder") return await reorderProduct(req, res, await readJson(req));

    if (req.method === "GET" && pathname === "/api/admin/content") return await listContent(req, res);
    if (req.method === "GET" && pathname.startsWith("/api/admin/content/")) return await getContent(req, res, pathname.slice("/api/admin/content/".length));
    if (req.method === "POST" && pathname === "/api/admin/content/draft") return await saveContentDraft(req, res, await readJson(req));
    if (req.method === "POST" && pathname === "/api/admin/content/publish") return await publishContent(req, res, await readJson(req));
    if (req.method === "POST" && pathname === "/api/admin/content/discard") return await discardContentDraft(req, res, await readJson(req));

    if (req.method === "GET" && pathname === "/api/public/company") return await handlePublicCompany(req, res);
    if (req.method === "GET" && pathname === "/api/public/products") return await handlePublicProducts(req, res);

    notFound(res);
  } catch (error) {
    console.error(error);
    json(res, 500, { error: error?.message || "Internal server error" });
  }
}

http.createServer(handle).listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
