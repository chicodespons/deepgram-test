"use server";

import {supabase} from "@/lib/supabase";

export async function getBoards(orgId: string) {
    const { data, error } = await supabase
        .from('Board')
        .select('*')
        .eq('organisation_id', orgId)
        .order('created_at', {ascending: false});

    if (error) {
        console.error("Error fetching boards: ", error);
        return {
            data: null,
            error: error
        }
    }

    return {
        data,
        error: null
    }

}