"use server"

import {supabase} from "@/lib/supabase";

export async function getTextAreasForBoardId(boardId: string) {
    const { data, error } = await supabase
        .from('Textareacomponent')
        .select('*')
        .eq('board_id', boardId)
        .order('row_index', {ascending: true});

    if (error){
        console.error(`Error fetching textareacomponents for boardId: ${boardId}`)
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