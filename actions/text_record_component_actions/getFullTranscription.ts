"use server";

import {supabase} from "@/lib/supabase";

export async function getFullTranscription(boardId: string){
    const { data, error } = await supabase
        .from('Transcriptions')
        .select('fullTranscription')
        .eq('boardId', boardId)
        .single()

    if (error && error.code !=='PGRST116') {
        console.log(error.code)
        console.error(`Error fetching Transcription for boardId: ${boardId}`)
        return {
            error: error.message
        }
    }

    return {
        data: data
    }
}