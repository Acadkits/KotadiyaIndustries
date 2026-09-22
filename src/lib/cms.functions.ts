import { apiGet, apiPost } from "@/lib/api";

export type PublicProduct = {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  applications: string[];
  imagePosition: "top" | "bottom";
  image: string;
  imagePath: string | null;
  specs: Record<string, string>;
};

export async function getPublishedProducts(): Promise<PublicProduct[]> {
  return apiGet("/api/public/products");
}

export async function getPublishedProductBySlug(input: { data: { slug: string } }): Promise<PublicProduct | null> {
  return apiGet(`/api/public/products/${encodeURIComponent(input.data.slug)}`);
}

export async function getPublishedContent(input: { data: { keys: string[] } }): Promise<Record<string, any>> {
  return apiPost("/api/public/content", input.data);
}

export async function getPublishedCompany(): Promise<any> {
  return apiGet("/api/public/company");
}

export async function listProductsAdmin(): Promise<any[]> {
  return apiGet("/api/admin/products");
}

export async function getProductAdmin(input: { data: { id: string } }): Promise<any> {
  return apiGet(`/api/admin/products/${encodeURIComponent(input.data.id)}`);
}

export async function createProduct(input: { data: { slug: string; draft: any } }): Promise<{ id: string }> {
  return apiPost("/api/admin/products/create", input.data);
}

export async function updateProductDraft(input: { data: { id: string; draft: any; is_hidden?: boolean; slug?: string } }): Promise<{ ok: true }> {
  return apiPost("/api/admin/products/update", input.data);
}

export async function publishProduct(input: { data: { id: string } }): Promise<{ ok: true }> {
  return apiPost("/api/admin/products/publish", input.data);
}

export async function discardProductDraft(input: { data: { id: string } }): Promise<{ ok: true }> {
  return apiPost("/api/admin/products/discard", input.data);
}

export async function deleteProduct(input: { data: { id: string } }): Promise<{ ok: true }> {
  return apiPost("/api/admin/products/delete", input.data);
}

export async function reorderProduct(input: { data: { id: string; direction: "up" | "down" } }): Promise<{ ok: true }> {
  return apiPost("/api/admin/products/reorder", input.data);
}

export async function listContentAdmin(): Promise<any[]> {
  return apiGet("/api/admin/content");
}

export async function getContentAdmin(input: { data: { key: string } }): Promise<any> {
  return apiGet(`/api/admin/content/${encodeURIComponent(input.data.key)}`);
}

export async function saveContentDraft(input: { data: { key: string; draft: any } }): Promise<{ ok: true }> {
  return apiPost("/api/admin/content/draft", input.data);
}

export async function publishContent(input: { data: { key: string } }): Promise<{ ok: true }> {
  return apiPost("/api/admin/content/publish", input.data);
}

export async function discardContentDraft(input: { data: { key: string } }): Promise<{ ok: true }> {
  return apiPost("/api/admin/content/discard", input.data);
}

export async function getCompanyAdmin(): Promise<any> {
  return apiGet("/api/admin/company");
}

export async function saveCompanyDraft(input: { data: { draft: any } }): Promise<{ ok: true }> {
  return apiPost("/api/admin/company/draft", input.data);
}

export async function publishCompany(): Promise<{ ok: true }> {
  return apiPost("/api/admin/company/publish", {});
}

export async function listMedia(): Promise<any[]> {
  return apiGet("/api/admin/media");
}

export async function registerMedia(input: { data: any }): Promise<{ ok: true }> {
  return apiPost("/api/admin/media/register", input.data);
}

export async function deleteMedia(input: { data: { id: string; path?: string } }): Promise<{ ok: true }> {
  return apiPost("/api/admin/media/delete", input.data);
}

export async function updateMediaAlt(input: { data: { id: string; alt: string } }): Promise<{ ok: true }> {
  return apiPost("/api/admin/media/alt", input.data);
}
