import { apiPost } from "@/lib/api";

export async function submitInquiry(input: {
  full_name: string;
  company_name?: string | null;
  email: string;
  phone?: string | null;
  inquiry_type?: string | null;
  message: string;
  hp?: string;
}) {
  return apiPost("/api/public/inquiry", input);
}

export async function submitRfq(input: {
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  requirement_type: string;
  product_name?: string | null;
  material?: string | null;
  quantity?: string | null;
  expected_delivery_date?: string | null;
  specifications?: string | null;
  additional_notes?: string | null;
  file_urls?: Array<{ name: string; path: string }>;
  hp?: string;
}) {
  return apiPost("/api/public/rfq", input);
}
