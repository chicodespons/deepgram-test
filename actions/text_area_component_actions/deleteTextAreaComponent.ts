"use server";

import {auth} from "@clerk/nextjs";
import {supabase} from "@/lib/supabase";

export async function deleteTextAreaComponent(row_index: number, boardId: string) {

    const { userId, orgId } = auth();

    if(!userId || !orgId) {
        return {
            error: "Unauthorized"
        }
    }

    const { data, error } = await supabase
        .from('Textareacomponent')
        .delete()
        .eq('board_id', boardId)
        .eq('row_index', row_index)
        .single();

    if ( error) {
        console.error("Error deleting Textareacomponent: ", error);
        return {
            error: "Database error: Failed to delete Textareacomponent."
        }
    }
}