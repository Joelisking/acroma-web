/**
 * Direct browser → Cloudinary upload using an unsigned upload preset.
 * Shared by every image picker (single `ImageUploader` and the multi-image
 * catalog manager) so the cloud + preset + folder convention live in one
 * place. The backend never sees the file — it only stores the returned URL.
 */

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/** Accept attribute for image file inputs. */
export const IMAGE_ACCEPT = "image/png, image/jpeg, image/webp, image/avif";

/** Cloudinary folder; uploaded asset lives at `acroma/<kind>/…`. */
export type UploadKind = "logo" | "product" | "variant" | "catalog";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/** Thrown with a user-facing message; callers surface it via a toast. */
export class ImageUploadError extends Error {}

type CloudinaryResponse = { secure_url: string };

/**
 * Upload one image and resolve to its `secure_url`. Rejects with an
 * `ImageUploadError` carrying a message safe to show the merchant.
 */
export async function uploadImage(
  file: File,
  kind: UploadKind,
): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new ImageUploadError("Cloudinary is not configured");
  }
  if (file.size > MAX_BYTES) {
    throw new ImageUploadError("Image is over 5 MB");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("folder", `acroma/${kind}`);

  let res: Response;
  try {
    res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: form },
    );
  } catch {
    throw new ImageUploadError("Upload failed. Please try again");
  }

  if (!res.ok) {
    throw new ImageUploadError("Upload failed. Please try again");
  }

  const json = (await res.json()) as CloudinaryResponse;
  return json.secure_url;
}
