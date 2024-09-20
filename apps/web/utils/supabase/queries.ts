import { User } from "@supabase/supabase-js";
import { createClient } from "./server";
import { Database } from "@repo/types/database";

export const getUser = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user || {} as User;
};

export const getTrackedPackages = async (userId: string) => {
  const supabase = createClient<Database>();

  return supabase
    .from("package_user")
    .select("*, package:packages(name, scope)")
    .eq("user_id", userId);
};