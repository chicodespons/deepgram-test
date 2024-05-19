import {supabase} from "@/lib/supabase";

export async function findUniqueBoard(boardId: String, orgId: String) {
    const { data, error } = await supabase
        .from('Board')
        .select('*')
        .eq('id', boardId)
        .eq('organisation_id', orgId)
        .single()

    if (error){
        console.error("Error fetching board: ", error);
        throw new Error("Database error: Failed to fetch UniqueBoard")
    }

    return data;
}