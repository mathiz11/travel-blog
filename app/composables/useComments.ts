import type { Comment, Database } from "~/types/database.types";

export interface PostCommentPayload {
  tripId: string;
  authorName: string;
  body: string;
  token: string;
}

/** Commentaire enrichi du voyage lié (pour la modération admin). */
export type CommentWithTrip = Comment & {
  trips: { title: string; slug: string } | null;
};

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

  // Tous les commentaires + titre/slug du voyage lié (modération admin)
  async function fetchAllComments(): Promise<CommentWithTrip[]> {
    const { data, error } = await supabase
      .from("comments")
      .select("*, trips(title, slug)")
      .order("created_at", { ascending: false })
      .returns<CommentWithTrip[]>();
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
    const { data, error } = await supabase
      .from("comments")
      .delete()
      .eq("id", id)
      .select("id");
    if (error) throw error;
    // Sous RLS, un delete non autorisé supprime 0 ligne sans erreur.
    if (!data || data.length === 0) {
      throw new Error("Suppression refusée (policy RLS DELETE manquante ?)");
    }
  }

  return { fetchComments, fetchAllComments, postComment, deleteComment };
}
