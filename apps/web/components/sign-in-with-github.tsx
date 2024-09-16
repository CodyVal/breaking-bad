"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";

export function SignInWithGithubButton({ ...props }: React.ComponentProps<typeof Button>) {
  const supabase = createClient();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      }
    });
  };

  return <Button onClick={handleLogin} {...props}>Sign in with Github</Button>;
}