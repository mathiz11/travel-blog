import type {
  Database,
  Trip,
  TripInsert,
  TripUpdate,
} from "~/types/database.types";

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
    // Fetch cover URL before deleting to clean up storage
    const { data: trip } = await supabase
      .from("trips")
      .select("cover_image_url")
      .eq("id", id)
      .single();

    if (trip?.cover_image_url) {
      const path = trip.cover_image_url.split("/travel-blog-images/")[1];
      if (path) {
        await supabase.storage.from("travel-blog-images").remove([path]);
      }
    }

    const { error } = await supabase.from("trips").delete().eq("id", id);
    if (error) throw error;
  }

  return {
    fetchTrips,
    fetchTrip,
    createTrip,
    updateTrip,
    deleteTrip,
  };
}
