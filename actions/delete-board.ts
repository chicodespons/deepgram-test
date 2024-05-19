"use server";

import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteBoard(id:string) {

    const { userId, orgId } = auth();

    if(!userId || !orgId){
        return {
            error: "Unauthorized",
        }
    }

    const { data, error } = await supabase
        .from('Board')
        .delete()
        .eq('id', id)
        .eq('organisation_id', orgId)
        .single();

    if (error) {
        console.error("Error deleting board: ", error);
        return {
            error: "Database error: Failed to delete board."
        };
    }

    revalidatePath(`/organization/${orgId}`);
    redirect(`/organization/${orgId}`);

}