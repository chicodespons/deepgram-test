"use server";

import { db } from "@/lib/db";
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

  try {
    board = await db.board.update({
        where: {
            id : id,
            organisationId : orgId,
        },
        data: {
            title : title
        }
    }) 

    revalidatePath(`/board/${id}`)
    return {
      succes: true,
      data: board
    };
  } catch (error) {
    return {
      error: "database error : Failed to update board title"
    }
  }

  }