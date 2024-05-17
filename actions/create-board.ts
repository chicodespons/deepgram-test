"use server";

import { db } from "@/lib/db";
import { CreateBoardSchema } from "@/lib/types";
import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

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

  try {

    board = await db.board.create({
      data: {
        organisationId : orgId,
        title : title,
        imageId : imageId,
        imageThumbUrl : imageThumbUrl,
        imageFullUrl : imageFullUrl,
        imageLinkHTML : imageLinkHtml,
        imageUserName : imageUserName
      }
    });

    revalidatePath(`/board/${board.id}`)
    return {
      succes: true,
      boardId: board.id
    };
  } catch (error) {
    console.error("Error creating board: ", error);
    return {
      error: "database error creating board"
    }
    
  }

    
  }