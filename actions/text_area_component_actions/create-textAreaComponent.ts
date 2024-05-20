"use server";

import { CreateTextAreaComponentSchema } from "@/lib/textareacomponent-types/types";
import { auth } from "@clerk/nextjs";
import {supabase} from "@/lib/supabase";
import {isTextAreaComponent} from "@/lib/textareacomponent-types/guards";

export async function createTextAreaComponent(newTextAreaComponent: unknown, boardId: string) {

    const {userId, orgId } = auth();

    if(!userId || !orgId) {
        return {
          error: "Unauthorized"
        }
    }

    const result = CreateTextAreaComponentSchema.safeParse(newTextAreaComponent);

    if(!result.success) {

      let errorMessage = "";

      result.error.issues.forEach((issue) => {
        errorMessage = errorMessage + issue.path[0] + ": " + issue.message + ". ";
      });

      return {
        error: errorMessage,
      };

    }


    const { row_index ,title, description, content} = result.data


    const { data, error } = await supabase
        .from('Textareacomponent')
        .insert([
            {
                row_index: row_index,
                title: title,
                description: description,
                board_id: boardId
            }
        ])
        .select()
        .single();

    if (error) {
        console.error("Error creating Textareacomponent: ", error);
        return {
            error: `database error creating Textareacomponent: ${error}`
        }
    }

    if (!data) {
        return {
            error: "Unexpected error: No data returned or data is invalid"
        };
    }

    if(isTextAreaComponent(data)) {
        return {
            succes: true
        }
    }


}