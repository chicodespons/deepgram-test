"use server";

import {supabase} from "@/lib/supabase";
import {auth} from "@clerk/nextjs";
import {SaveFullTranscriptionSchema} from "@/lib/textrecordcomponent-types/types";

export async function saveFullTranscription(fullTranscription: string, boardId: string) {

    const { userId, orgId } = auth();

    if(!userId || !orgId) {
        return {
            error: "Unauthorized"
        }
    }
    const fullTranscriptionObject = {
        boardId: boardId,
        fullTranscription: fullTranscription
    }

    const result = SaveFullTranscriptionSchema.safeParse(fullTranscriptionObject);

    if (!result.success) {

        let errorMessage = "";

        result.error.issues.forEach((issue) => {
            errorMessage = errorMessage + issue.path[0] + ': ' + issue.message + '. ';
        });

        return {
            error : errorMessage,
        };
    }


    const { data, error } = await supabase
        .from('Transcriptions')
        .upsert([result.data], { onConflict: 'boardId'})
        .select()
        .single();

    if (error) {
        console.error("Error saving full transcription: ", error);
        return {
            error: "Database error: Failed to save full transcription"
        };
    }

    return {
        data
    }


}