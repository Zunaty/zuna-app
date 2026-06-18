"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { normalizeDisplayName, validateDisplayName } from "@/lib/profile/display-name";
import { createClient } from "@/lib/supabase/server";

export type ProfileActionState = {
  error?: string;
  success?: string;
};

export async function updateDisplayName(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const rawDisplayName = formData.get("displayName");

  if (typeof rawDisplayName !== "string") {
    return { error: "Display name is required." };
  }

  const validationError = validateDisplayName(rawDisplayName);
  if (validationError) {
    return { error: validationError };
  }

  const displayName = normalizeDisplayName(rawDisplayName);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to update your profile." };
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: displayName,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: { display_name: displayName },
  });

  if (authError) {
    return { error: authError.message };
  }

  revalidatePath("/profile");
  return { success: "Display name updated." };
}

export async function deleteAccount(): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to delete your account." };
  }

  const { error } = await supabase.rpc("delete_own_account");

  if (error) {
    return { error: error.message };
  }

  await supabase.auth.signOut();
  redirect("/");
}
