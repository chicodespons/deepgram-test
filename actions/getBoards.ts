import {supabase} from "@/lib/supabase";

export async function getBoards(orgId: String) {
    const { data, error } = await supabase
        .from('Board')
        .select('*')
        .eq('organisation_id', orgId)
        .order('created_at', {ascending: false});

    if (error) {
        console.error("Error fetching boards: ", error);
        throw new Error("Database error: Failed to fetch boards");
    }

    return data;
}