"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import type { helloWorldTask } from "@repo/triggers";
import { tasks } from "@trigger.dev/sdk/v3";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = createClient();
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
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

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
  const supabase = createClient();
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
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const trackPackageAction = async (formData: FormData) => {
  const pkgName = formData.get("pkgName") as string;
  const pkgScope = formData.get("pkgScope") as string|null;
  const supabase = createClient();
  const { data: { user }} = await supabase.auth.getUser();

  const { data: pkg, error: pkgError } = await supabase.from('packages').upsert({
    name: pkgName,
    scope: pkgScope
  }, { onConflict: 'name,scope' }).select().single();


  if (pkgError) {
    return false;
  }

  const { data: pkgUser, error: pkgUserError } = await supabase.from('package_user').upsert({
    package_id: pkg.id,
    user_id: user?.id
  }, {
    onConflict: 'package_id,user_id'
  });

  if (pkgUserError) {
    return false;
  }

  myTask();
  revalidatePath('/protected');
  revalidatePath('/protected/tracked');
};

export const untrackPackageAction = async (formData: FormData) => {
  const pkgName = formData.get("pkgName") as string;
  const pkgScope = formData.get("pkgScope") as string|null;
  const supabase = createClient();
  const { data: { user }} = await supabase.auth.getUser();

  const { data: pkg, error: pkgError } = await supabase.from('packages').select('id').eq('name', pkgName).eq('scope', pkgScope).single();

  if (pkgError) {
    return false;
  }

  const { data: pkgUser, error: pkgUserError } = await supabase.from('package_user').delete().eq('package_id', pkg.id).eq('user_id', user?.id);

  if (pkgUserError) {
    return false;
  }

  revalidatePath('/protected');
  revalidatePath('/protected/tracked');
}



export async function myTask() {
  try {
    const handle = await tasks.trigger<typeof helloWorldTask>(
      "hello-world",
      "James"
    );

    return { handle };
  } catch (error) {
    console.error(error);
    return {
      error: "something went wrong",
    };
  }
}