"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import {
  isPasswordValid,
  isSignUpPasswordReady,
  passwordRequirementsSummary,
  passwordsDoNotMatchMessage,
} from "@/lib/auth/password";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type AuthFormProps = React.ComponentPropsWithoutRef<"div">;

export function LoginForm({ className, ...props }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    router.push("/profile");
    router.refresh();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            Optional account to save progress, scores, and achievements as the playground rolls out.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function SignUpForm({ className, ...props }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!isPasswordValid(password)) {
      setError(passwordRequirementsSummary);
      setIsLoading(false);
      return;
    }

    if (!isSignUpPasswordReady(password, confirmPassword)) {
      setError(passwordsDoNotMatchMessage);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName.trim() || undefined,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  if (success) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>. Click it to
            activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild className="w-full">
            <Link href="/auth/login">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = isSignUpPasswordReady(password, confirmPassword);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Free to browse without an account — sign up when you want to save progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                type="text"
                autoComplete="nickname"
                placeholder="Victor"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                aria-describedby="password-requirements"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <PasswordRequirements password={password} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                aria-invalid={passwordsMismatch}
                aria-describedby={passwordsMismatch ? "confirm-password-error" : undefined}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              {passwordsMismatch ? (
                <p id="confirm-password-error" className="text-sm text-destructive">
                  {passwordsDoNotMatchMessage}
                </p>
              ) : null}
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={isLoading || !canSubmit}>
              {isLoading ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
