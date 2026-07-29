import type { Comment, Database } from "~/types/database.types";

export interface PostCommentPayload {
  tripId: string;
  authorName: string;
  body: string;
  token: string;
}

export function useComments() {
  const supabase = useSupabaseClient<Database>();

  async function fetchComments(tripId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data!;
  }

  // Tous les commentaires (modération admin)
  async function fetchAllComments(): Promise<Comment[]> {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data!;
  }

  // Insertion via la route serveur (vérification Turnstile + service role)
  async function postComment(payload: PostCommentPayload): Promise<Comment> {
    return await $fetch<Comment>("/api/comments", {
      method: "POST",
      body: payload,
    });
  }

  async function deleteComment(id: string): Promise<void> {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) throw error;
  }

  return { fetchComments, fetchAllComments, postComment, deleteComment };
}
