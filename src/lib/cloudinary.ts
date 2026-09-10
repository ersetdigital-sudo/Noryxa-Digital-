export const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dqjh7utdb";
export const UPLOAD_PRESET = "noryxa_unsigned";

export async function uploadImage(file: File): Promise<string | null> {
  try {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", UPLOAD_PRESET);
    const r = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: form }
    );
    const j = await r.json();
    if (j.secure_url) return j.secure_url as string;
    console.warn("[cloudinary] upload failed:", j.error?.message);
    return null;
  } catch (e) {
    console.warn("[cloudinary] error:", e);
    return null;
  }
}
