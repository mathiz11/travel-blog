import imageCompression from "browser-image-compression";
import type { Database } from "~/types/database.types";

export function useStorageUpload() {
  const supabase = useSupabaseClient<Database>();
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function upload(file: File, path: string) {
    loading.value = true;
    error.value = null;
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.82,
      });

      const fileName = `${Date.now()}-${crypto.randomUUID()}.webp`;
      const filePath = `${path}/${fileName}`;

      const { error: err } = await supabase.storage
        .from("travel-blog-images")
        .upload(filePath, compressed, { upsert: true });

      if (err) throw err;

      const { data } = supabase.storage
        .from("travel-blog-images")
        .getPublicUrl(filePath);
      return { path: filePath, url: data.publicUrl };
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Erreur inconnue";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return { upload, loading, error };
}
