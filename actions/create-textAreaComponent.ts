"use server";

import { CreateTextAreaComponentSchema } from "@/lib/types";
import { auth } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export async function createTextAreaComponent(newTextAreaComponent: unknown) {

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

    let textAreaComponent;

    const { title, description, content} = result.data

    if (!title || !description) {
      return {
        error: "Missing fields. Failed to create board."
      }
    }

    // try {
    //
    //   textAreaComponent = await db.textAreaComponent.create({
    //     data: {
    //       title: title,
    //       description: description,
    //       content : content,
    //       boardId :
    //     }
    //   });
    // }

    

    


}