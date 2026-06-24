import type {
  Database,
  Trip,
  TripInsert,
  TripUpdate,
} from "~/types/database.types";

/** Voyage allégé pour le globe d'accueil (sans blocs ni résumé). */
export type TripMapPoint = Pick<
  Trip,
  | "id"
  | "slug"
  | "title"
  | "summary"
  | "country"
  | "destination"
  | "latitude"
  | "longitude"
  | "thumbnail_url"
  | "trip_date"
>;

export function useTrips() {
  const supabase = useSupabaseClient<Database>();

  async function fetchTrips(): Promise<Trip[]> {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .order("trip_date", { ascending: false });
    if (error) throw error;
    return data!;
  }

  async function fetchPublishedTrips(limit = 6): Promise<Trip[]> {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("published", true)
      .order("trip_date", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data!;
  }

  // Tous les voyages publiés ayant des coordonnées — pour le globe d'accueil
  async function fetchPublishedTripsForMap(): Promise<TripMapPoint[]> {
    const { data, error } = await supabase
      .from("trips")
      .select(
        "id, slug, title, summary, country, destination, latitude, longitude, thumbnail_url, trip_date",
      )
      .eq("published", true)
      .order("trip_date", { ascending: false });
    if (error) throw error;
    return data!;
  }

  async function fetchTripBySlug(slug: string): Promise<Trip> {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();
    if (error) throw error;
    return data!;
  }

  async function fetchTrip(id: string): Promise<Trip> {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data!;
  }

  async function createTrip(tripData: TripInsert): Promise<Trip> {
    const { data, error } = await supabase
      .from("trips")
      .insert(tripData)
      .select()
      .single();
    if (error) throw error;
    return data!;
  }

  async function updateTrip(id: string, tripData: TripUpdate): Promise<Trip> {
    const { data, error } = await supabase
      .from("trips")
      .update(tripData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data!;
  }

  async function deleteTrip(id: string): Promise<void> {
    // Fetch thumbnail URL before deleting to clean up storage
    const { data: trip } = await supabase
      .from("trips")
      .select("thumbnail_url")
      .eq("id", id)
      .single();

    if (trip?.thumbnail_url) {
      const path = trip.thumbnail_url.split("/travel-blog-images/")[1];
      if (path) {
        await supabase.storage.from("travel-blog-images").remove([path]);
      }
    }

    const { error } = await supabase.from("trips").delete().eq("id", id);
    if (error) throw error;
  }

  return {
    fetchTrips,
    fetchPublishedTrips,
    fetchPublishedTripsForMap,
    fetchTripBySlug,
    fetchTrip,
    createTrip,
    updateTrip,
    deleteTrip,
  };
}
