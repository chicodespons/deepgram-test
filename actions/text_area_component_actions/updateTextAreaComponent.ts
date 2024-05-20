"use server";

import {auth} from "@clerk/nextjs";
import {UpdateTextAreaSchema} from "@/lib/textareacomponent-types/types";
import {supabase} from "@/lib/supabase";

export async function updateTextAreaComponent(updatedTextArea: unknown, boardId: string,row_index: number) {

    const { userId, orgId } = auth();

    if (!userId || !orgId) {
        return {
            error: "Unauthorized"
        }
    }

    const result = UpdateTextAreaSchema.safeParse(updatedTextArea);

    if (!result.success) {

        let errorMessage = "";

        result.error.issues.forEach((issue) => {
            errorMessage = errorMessage + issue.path[0] + ": " + issue.message + ". ";
        });

        return {
            error: errorMessage,
        };
    }

    const { title, description, content } = result.data

    const { data, error } = await supabase
        .from("Textareacomponent")
        .update({
            ...(title && { title }),
            ...(description && { description }),
            ...(content && { content })
        })
        .eq('board_id', boardId)
        .eq("row_index", row_index)
        .select()
        .single();

    if (error) {
        console.error("Error updating Textareacomponent: ", error);
        return {
            error: `Error updating Textareacomponent: ${error}`,
        };
    }

    return {
        success: true,
        data : data
    };
}