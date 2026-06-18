"use client";

import { User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useRef, useState } from "react";

import { deleteAccount, updateDisplayName, type ProfileActionState } from "@/app/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AVATAR_BUCKET, DELETE_ACCOUNT_CONFIRMATION } from "@/lib/profile/constants";
import { getAvatarStoragePath, isAvatarMimeType, validateAvatarFile } from "@/lib/profile/avatar";
import { createClient } from "@/lib/supabase/client";

type ProfileSettingsProps = {
  userId: string;
  email: string;
  memberSince: string;
  initialDisplayName: string;
  initialAvatarUrl: string | null;
  level: number;
  points: number;
};

const initialActionState: ProfileActionState = {};

export function ProfileSettings({
  userId,
  email,
  memberSince,
  initialDisplayName,
  initialAvatarUrl,
  level,
  points,
}: ProfileSettingsProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayNameState, displayNameAction, isDisplayNamePending] = useActionState(
    updateDisplayName,
    initialActionState,
  );

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setAvatarError(null);
    setAvatarMessage(null);

    const validationError = validateAvatarFile(file);
    if (validationError) {
      setAvatarError(validationError);
      return;
    }

    if (!isAvatarMimeType(file.type)) {
      setAvatarError("Unsupported image type.");
      return;
    }

    setIsAvatarLoading(true);

    const supabase = createClient();
    const storagePath = getAvatarStoragePath(userId, file.type);

    const { data: existingFiles } = await supabase.storage.from(AVATAR_BUCKET).list(userId);
    if (existingFiles?.length) {
      const pathsToRemove = existingFiles.map((entry) => `${userId}/${entry.name}`);
      await supabase.storage.from(AVATAR_BUCKET).remove(pathsToRemove);
    }

    const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(storagePath, file, {
      upsert: true,
      contentType: file.type,
    });

    if (uploadError) {
      setAvatarError(uploadError.message);
      setIsAvatarLoading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(storagePath);

    const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      avatar_url: cacheBustedUrl,
    });

    if (profileError) {
      setAvatarError(profileError.message);
      setIsAvatarLoading(false);
      return;
    }

    setAvatarUrl(cacheBustedUrl);
    setAvatarMessage("Avatar updated.");
    setIsAvatarLoading(false);
    router.refresh();
  };

  const handleAvatarRemove = async () => {
    setAvatarError(null);
    setAvatarMessage(null);
    setIsAvatarLoading(true);

    const supabase = createClient();
    const { data: existingFiles } = await supabase.storage.from(AVATAR_BUCKET).list(userId);

    if (existingFiles?.length) {
      const pathsToRemove = existingFiles.map((entry) => `${userId}/${entry.name}`);
      const { error: removeError } = await supabase.storage.from(AVATAR_BUCKET).remove(pathsToRemove);

      if (removeError) {
        setAvatarError(removeError.message);
        setIsAvatarLoading(false);
        return;
      }
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      avatar_url: null,
    });

    if (profileError) {
      setAvatarError(profileError.message);
      setIsAvatarLoading(false);
      return;
    }

    setAvatarUrl(null);
    setAvatarMessage("Avatar removed.");
    setIsAvatarLoading(false);
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== DELETE_ACCOUNT_CONFIRMATION) {
      setDeleteError(`Type ${DELETE_ACCOUNT_CONFIRMATION} to confirm account deletion.`);
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);

    const result = await deleteAccount();

    if (result?.error) {
      setDeleteError(result.error);
      setIsDeleting(false);
    }
  };

  const canDeleteAccount = deleteConfirmation === DELETE_ACCOUNT_CONFIRMATION;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">Level & points</h2>
          <p className="mt-4 text-3xl font-bold text-primary">Level {level}</p>
          <p className="mt-1 text-sm text-muted-foreground">{points} points</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Achievements and point earning roll out with the playground — your account is ready.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">Account</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Member since</dt>
              <dd className="font-medium">{memberSince}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">Update how you appear across the site.</p>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-start gap-3">
            <div className="relative flex size-24 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" fill unoptimized className="object-cover" sizes="96px" />
              ) : (
                <User className="size-10 text-muted-foreground" aria-hidden />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isAvatarLoading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isAvatarLoading ? "Saving…" : avatarUrl ? "Change avatar" : "Upload avatar"}
              </Button>
              {avatarUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isAvatarLoading}
                  onClick={() => void handleAvatarRemove()}
                >
                  Remove
                </Button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(event) => void handleAvatarUpload(event)}
            />
            <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, or GIF. Max 2 MB.</p>
            {avatarError ? <p className="text-sm text-destructive">{avatarError}</p> : null}
            {avatarMessage ? <p className="text-sm text-muted-foreground">{avatarMessage}</p> : null}
          </div>

          <form action={displayNameAction} className="min-w-0 flex-1 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="nickname"
                defaultValue={initialDisplayName}
                required
                minLength={2}
                maxLength={32}
              />
            </div>
            {displayNameState.error ? <p className="text-sm text-destructive">{displayNameState.error}</p> : null}
            {displayNameState.success ? (
              <p className="text-sm text-muted-foreground">{displayNameState.success}</p>
            ) : null}
            <Button type="submit" disabled={isDisplayNamePending}>
              {isDisplayNamePending ? "Saving…" : "Save display name"}
            </Button>
          </form>
        </div>
      </section>

      <section className="rounded-xl border border-destructive/40 bg-card p-6">
        <h2 className="font-semibold text-destructive">Delete account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently delete your account, profile, and avatar. This cannot be undone.
        </p>
        <div className="mt-4 grid max-w-md gap-3">
          <div className="grid gap-2">
            <Label htmlFor="deleteConfirmation">Type {DELETE_ACCOUNT_CONFIRMATION} to confirm</Label>
            <Input
              id="deleteConfirmation"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              autoComplete="off"
              placeholder={DELETE_ACCOUNT_CONFIRMATION}
            />
          </div>
          {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}
          <Button
            type="button"
            variant="destructive"
            disabled={!canDeleteAccount || isDeleting}
            onClick={() => void handleDeleteAccount()}
          >
            {isDeleting ? "Deleting account…" : "Delete account"}
          </Button>
        </div>
      </section>
    </div>
  );
}
