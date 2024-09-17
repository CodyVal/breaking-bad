import { createClient } from "@/utils/supabase/server";

// interface FetchOptions extends RequestInit {
//   headers?: HeadersInit;
// }

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const HEADERS: Record<string, any> = {
  'Content-Type': 'application/json',
};

const getAuthHeader = async (): Promise<any> => {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if(!session || !session.access_token || error) {
    console.error('Fetch Error:', error || 'No session');
    return {};
  }

  return { Authorization: `Bearer ${session.access_token}` };
}


export async function apiClient<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  // Merge the default headers with any headers provided in options
  const headers: any = { ...HEADERS, ...options.headers, ...(await getAuthHeader()) };

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

