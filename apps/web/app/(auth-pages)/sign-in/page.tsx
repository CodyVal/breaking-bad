import { FormMessage, Message } from "@/components/form-message";
import { SignInWithGithubButton } from "@/components/sign-in-with-github";
import Link from "next/link";

export default function Login({ searchParams }: { searchParams: Message }) {
  return (
    <form className="flex-1 flex flex-col min-w-64">
      <h1 className="text-2xl font-medium text-center">Sign in</h1>
      <p className="hidden text-sm text-foreground">
        Don't have an account?{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          Sign up
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <SignInWithGithubButton />
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
