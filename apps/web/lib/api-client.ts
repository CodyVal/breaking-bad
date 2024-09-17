import { createClient } from "@/utils/supabase/client";

interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const HEADERS: HeadersInit = {
  'Content-Type': 'application/json',
};
const getAuthHeader = async () => {
  const supabase = createClient();
  const session = await supabase.auth.getSession()

  console.log(session)

  return { Authorization: `Bearer sdfsdfsfdsf` };
}


export async function apiClient<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  // Merge the default headers with any headers provided in options
  const headers = { ...HEADERS, ...getAuthHeader(), ...options.headers };

  try {
      const response = await fetch(url, { ...options, headers });
      const data: T = await response.json();

      // Check if the response was successful
      if (!response.ok) {
          throw new Error(data && typeof data === 'object' ? (data as any).message : 'Error fetching data');
      }

      return data;
  } catch (error) {
      console.error('Fetch Error:', error);
      throw error;
  }
}

