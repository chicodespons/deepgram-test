"use server";

import { supabase } from "@/lib/supabase";
import {Board, CreateBoardSchema} from "@/lib/types";
import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import {isBoard} from "@/lib/guards";

export async function createBoard(newBoard: unknown) {

  const { userId, orgId } = auth();

  if(!userId || !orgId) {
    return {
      error: "Unauthorized"
    }
  }

  const result = CreateBoardSchema.safeParse(newBoard);

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

  const { title, image } = result.data
    const [
      imageId,
      imageThumbUrl,
      imageFullUrl,
      imageLinkHtml,
      imageUserName, 
    ] = image.split("|");

    if (!imageId || !imageThumbUrl || !imageFullUrl || !imageLinkHtml || !imageUserName || !title){
      return {
        error: "Missing fields. Failed to create board."
      }
    }

    const { data, error } = await supabase
          .from('Board')
          .insert([
            {
              organisation_id : orgId,
              title: title,
              image_id: imageId,
              image_thumb_url: imageThumbUrl,
              image_full_url: imageFullUrl,
              image_link_html: imageLinkHtml,
              image_user_name: imageUserName
            }
          ])
          .select()
          .single();

  if (error) {
    console.error("Error creating board: ", error);
    return {
      error: `database error creating board${error}`
    }
  }

  if (!data) {
    return {
      error: "Unexpected error: No data returned or data is invalid"
    };
  }

  if (isBoard(data)) {
    // @ts-ignore
    revalidatePath(`/board/${data.id}`);
    return {
      succes: true,
      // @ts-ignore
      boardId: data.id
    }
  }





    
  }