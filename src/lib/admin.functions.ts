import { apiGet, apiPost } from "@/lib/api";

export async function checkIsAdmin(): Promise<{ isAdmin: boolean }> {
  return apiGet("/api/admin/check");
}

export async function claimFirstAdmin(): Promise<{ claimed: boolean }> {
  return apiPost("/api/admin/claim-first-admin", {});
}

export async function listRfqs(): Promise<any[]> {
  return apiGet("/api/admin/rfqs");
}

export async function getRfq(input: { data: { id: string } }): Promise<any> {
  return apiGet(`/api/admin/rfqs/${encodeURIComponent(input.data.id)}`);
}

export async function updateRfqStatus(input: { data: { id: string; status: string } }): Promise<{ ok: true }> {
  return apiPost(`/api/admin/rfqs/${encodeURIComponent(input.data.id)}/status`, { status: input.data.status });
}

export async function signRfqFile(input: { data: { rfqId: string; path: string } }): Promise<{ url: string }> {
  return apiPost(`/api/admin/rfqs/${encodeURIComponent(input.data.rfqId)}/sign-file`, { path: input.data.path });
}

export async function listInquiries(): Promise<any[]> {
  return apiGet("/api/admin/inquiries");
}

export async function getInquiry(input: { data: { id: string } }): Promise<any> {
  return apiGet(`/api/admin/inquiries/${encodeURIComponent(input.data.id)}`);
}

export async function updateInquiryStatus(input: { data: { id: string; status: string } }): Promise<{ ok: true }> {
  return apiPost(`/api/admin/inquiries/${encodeURIComponent(input.data.id)}/status`, { status: input.data.status });
}
