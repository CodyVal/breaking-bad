"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { fetchReleaseNotesTask } from "@repo/triggers";
import { tasks } from "@trigger.dev/sdk/v3";
import { Database } from "@repo/types/database";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = createClient<Database>();
  const origin = headers().get("origin");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link."
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient<Database>();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = createClient<Database>();
  const origin = headers().get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = createClient<Database>();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = createClient<Database>();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const trackPackageAction = async (formData: FormData) => {
  const pkgName = (formData.get("pkgName") as string) || "";
  const pkgScope = (formData.get("pkgScope") as string) || "";
  const pkgRepository = (formData.get("pkgRepository") as string) || "";
  const supabase = createClient<Database>();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: pkg, error: pkgError } = await supabase
    .from("packages")
    .upsert(
      {
        name: pkgName,
        scope: pkgScope,
        repository: pkgRepository,
      },
      { onConflict: "name,scope" }
    )
    .select()
    .single();

  if (pkgError) {
    return false;
  }

  const { data: pkgUser, error: pkgUserError } = await supabase
    .from("package_user")
    .upsert(
      {
        package_id: pkg.id,
        user_id: user?.id,
      },
      {
        onConflict: "package_id,user_id",
      }
    );

  if (pkgUserError) {
    return false;
  }

  await fetchReleaseNotes(pkg);
  revalidatePath("/protected");
  revalidatePath("/protected/tracked");
};

export const untrackPackageAction = async (formData: FormData) => {
  const pkgName = (formData.get("pkgName") as string) || "";
  const pkgScope = (formData.get("pkgScope") as string) || "";
  const supabase = createClient<Database>();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: pkg, error: pkgError } = await supabase
    .from("packages")
    .select("id")
    .eq("name", pkgName)
    .eq("scope", pkgScope)
    .single();

  if (pkgError) {
    return false;
  }

  const { data: pkgUser, error: pkgUserError } = await supabase
    .from("package_user")
    .delete()
    .eq("package_id", pkg.id)
    .eq("user_id", user?.id);

  if (pkgUserError) {
    return false;
  }

  revalidatePath("/protected");
  revalidatePath("/protected/tracked");
};

export const fetchReleaseNotes = async (pkg: any) => {
  try {
    const handle = await tasks.trigger<typeof fetchReleaseNotesTask>(
      "fetch-release-notes",
      pkg
    );

    return { handle };
  } catch (error) {
    console.error(error);
    return {
      error: "something went wrong",
    };
  }
};

export const checkNPM = async (pkg: string) => {
  const response = await fetch(`https://registry.npmjs.org/${pkg}/latest`);

  if (!response.ok) {
    return "Package not found";
  }

  const data = await response.json();
  return data;
};

export const checkForSimilarPackages = async (pkg: string) => {
  const supabase = createClient<Database>();

  const { data, error } = await supabase
    .from("packages")
    .select()
    .ilike("name", `%${pkg}%`);

  if (error) {
    throw error;
  }

  console.log(data);

  return data;
};

export const fetchReleases = async (
  pkg: string
): Promise<{ releases: any[] }> => {
  const supabase = createClient<Database>();

  const { data: pkgRecord, error: errorPkg } = await supabase
    .from("packages")
    .select("id")
    .eq("name", pkg)
    .single();

  if (!pkgRecord) {
    return { releases: [] };
  }

  const { data, error } = await supabase
    .from("releases")
    .select("id,version,packages:package_id(name)")
    .eq("package_id", pkgRecord.id)
    .limit(10);

  if (error) throw error;

  console.log(data);
  return { releases: data };
};

export const matchReleases = async (message: string) => {
  const supabase = createClient<Database>();

  try {
    // Generate embedding for the message
    const { embedding: embeddingResponse } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: message,
    });

    const embedding = embeddingResponse;

    // Call the match_releases RPC function
    const { data, error } = await supabase.rpc("match_releases", {
      query_embedding: JSON.stringify(embedding),
      match_threshold: 0.5, // Adjust this threshold as needed
      match_count: 10,
    });

    if (error) throw error;

    console.log("Embeddings", data);

    return data;
  } catch (error) {
    console.error("Error in matchReleases:", error);
    throw error;
  }
};
