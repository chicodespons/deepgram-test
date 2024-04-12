"use server";

import { db } from "@/lib/db";
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

    let board;

    try {
        board =  await db.board.delete({
            where: {
                id: id,
                organisationId: orgId
            }
        });
    } catch (error) {
        return {
            error: "database error : Failed to delete board."
        }
    }

    revalidatePath(`/organization/${orgId}`);
    redirect(`/organization/${orgId}`);

}