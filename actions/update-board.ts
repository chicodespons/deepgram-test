"use server";

import { supabase } from "@/lib/supabase";
import { UpdateBoardSchema } from "@/lib/types";
import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

export async function updateBoard(updatedBoard: unknown) {

  const { userId, orgId } = auth();

  if(!userId || !orgId) {
    return {
      error: "Unauthorized"
    }
  }

  const result = UpdateBoardSchema.safeParse(updatedBoard);

  if (!result.success) {

      let errorMessage = "";

      result.error.issues.forEach((issue) => {
          errorMessage = errorMessage + issue.path[0] + ': ' + issue.message + '. ';
      });

      return {
        error : errorMessage,
      };
  }

  let board;

  const { title, id } = result.data

    const { data, error } = await supabase
        .from('Board')
        .update({ title })
        .eq('id', id)
        .eq('organisation_id', orgId)
        .single();

    if (error) {
        console.error("Error updating board: ", error);
        return {
            error: "Database error: Failed to update board title"
        };
    }

    revalidatePath(`/board/${id}`);
    return {
        success: true,
        data
    };

  }