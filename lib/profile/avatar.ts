import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_MAX_BYTES,
  AVATAR_MIME_TO_EXT,
  type AvatarMimeType,
} from "@/lib/profile/constants";

export function getAvatarStoragePath(userId: string, mimeType: AvatarMimeType): string {
  return `${userId}/avatar.${AVATAR_MIME_TO_EXT[mimeType]}`;
}

export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_ALLOWED_MIME_TYPES.includes(file.type as AvatarMimeType)) {
    return "Use a JPEG, PNG, WebP, or GIF image.";
  }

  if (file.size > AVATAR_MAX_BYTES) {
    return "Image must be 2 MB or smaller.";
  }

  return null;
}

export function isAvatarMimeType(value: string): value is AvatarMimeType {
  return AVATAR_ALLOWED_MIME_TYPES.includes(value as AvatarMimeType);
}
