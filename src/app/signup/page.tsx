"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiUser, FiCheck } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { FaSeedling } from "react-icons/fa6";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/lib/types";
import { AuthShell } from "@/components/AuthShell";
import { GoogleButton } from "@/components/GoogleButton";
import { ImageUpload } from "@/components/ImageUpload";
import { Alert, Button, Field, TextInput } from "@/components/ui";
import { generatedAvatar } from "@/lib/imgbb";
import {
  cx,
  emailValid,
  friendlyAuthError,
  passwordIssues,
} from "@/lib/utils";

const roleOptions: { value: Extract<Role, "supporter" | "creator">; title: string; blurb: string; credits: number; icon: typeof FaSeedling }[] = [
  {
    value: "supporter",
    title: "Supporter",
    blurb: "Back campaigns you believe in.",
    credits: 50,
    icon: HiOutlineSparkles,
  },
  {
    value: "creator",
    title: "Creator",
    blurb: "Launch and fund your own project.",
    credits: 20,
    icon: FaSeedling,
  },
];

export default function SignupPage() {
  const { register, logInWithGoogle } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"supporter" | "creator">("supporter");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const pwIssues = useMemo(() => passwordIssues(password), [password]);
  const pwStrong = password.length > 0 && pwIssues.length === 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Please enter your full name.");
    if (!emailValid(email)) return setError("Please enter a valid email address.");
    if (pwIssues.length > 0)
      return setError(`Password needs ${pwIssues.join(", ")}.`);

    setLoading(true);
    try {
      const finalPhoto = photoUrl || generatedAvatar(name);
      await register({ name: name.trim(), email, password, role, photoURL: finalPhoto });
      router.push("/dashboard");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      await logInWithGoogle(role);
      router.push("/dashboard");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join FundSpring and get free starter credits the moment you sign up."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Role selector */}
        <div>
          <span className="text-sm font-semibold text-label">I&apos;m joining as a…</span>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {roleOptions.map((opt) => {
              const active = role === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setRole(opt.value)}
                  className={cx(
                    "relative flex flex-col gap-1 rounded-2xl border-2 p-4 text-left transition-colors",
                    active
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-border-strong",
                  )}
                >
                  {active && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                      <FiCheck className="text-xs" />
                    </span>
                  )}
                  <opt.icon className="text-xl text-accent" />
                  <span className="font-semibold text-heading">{opt.title}</span>
                  <span className="text-xs text-muted">{opt.blurb}</span>
                  <span className="mt-1 text-xs font-semibold text-accent">
                    +{opt.credits} credits
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ImageUpload
            shape="circle"
            onChange={setPhotoUrl}
            onUploadingChange={setUploading}
          />
          <div className="flex-1 text-sm text-muted">
            <p className="font-medium text-label">Profile picture</p>
            <p className="mt-0.5">
              Optional. Upload a photo or we&apos;ll generate one for you.
            </p>
          </div>
        </div>

        <Field label="Full name" htmlFor="name">
          <div className="relative">
            <FiUser className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <TextInput
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
              className="pl-10"
              autoComplete="name"
            />
          </div>
        </Field>

        <Field label="Email" htmlFor="email">
          <div className="relative">
            <FiMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <TextInput
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="pl-10"
              autoComplete="email"
            />
          </div>
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          hint={
            password.length === 0
              ? "Use 6+ characters with upper, lower, and a number."
              : undefined
          }
        >
          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <TextInput
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="pl-10"
              autoComplete="new-password"
            />
          </div>
        </Field>

        {password.length > 0 && (
          <p className={cx("text-xs font-medium", pwStrong ? "text-emerald-500" : "text-amber-500")}>
            {pwStrong ? "Strong password ✓" : `Still needs ${pwIssues.join(", ")}.`}
          </p>
        )}

        {error && <Alert tone="error">{error}</Alert>}

        <Button type="submit" loading={loading} disabled={uploading} className="w-full">
          {uploading ? "Uploading image…" : "Create account"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-sm text-muted">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton
        onClick={handleGoogle}
        loading={googleLoading}
        disabled={loading}
        label={`Sign up with Google as ${role === "creator" ? "Creator" : "Supporter"}`}
      />

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
