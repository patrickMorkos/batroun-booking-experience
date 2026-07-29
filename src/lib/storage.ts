import { ADMIN_TOKEN_KEY } from "@/lib/supabase";

const BASE_URL = import.meta.env.VITE_SUPABASE_URL;

function getToken() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) throw new Error("Not authenticated");
  return token;
}

export function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  contentType: string,
  onProgress?: (pct: number) => void
): Promise<void> {
  const token = getToken();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/storage/v1/object/${bucket}/${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(xhr.responseText || `Upload failed (${xhr.status})`));
    });
    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));
    xhr.send(file);
  });
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/storage/v1/object/${bucket}/${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Delete failed (${res.status})`);
}
