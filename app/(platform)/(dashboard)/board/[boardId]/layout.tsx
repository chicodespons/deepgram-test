import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';
import { notFound, redirect } from 'next/navigation';
import React from 'react'
import BoardNavBar from './_components/board-navbar';
import { defaultImages } from '@/constants/images';

export async function generateMetadata({
    params
}: {
    params: {boardId: string;};
}) {
    const {orgId} = auth();
    
    if(!orgId){
        return {
            title: "Board",
        }
    }

    const board = await db.board.findUnique({
        where: {
            id: params.boardId,
            organisationId: orgId
        }
    });

    return {
        title: board?.title || "Board"
    }

}

const BoardIdLayout = async ({
    children,
    params,
}: {
    children: React.ReactNode;
    params: {boardId: string; };
}) => {

    const {orgId} = auth();

    if(!orgId){
        redirect("/select-org");
    };

    const board = await db.board.findUnique({
        where: {
            id: params.boardId,
            organisationId: orgId
        }
    });

    if(!board){
        notFound();
    }

    const backgroundImage = board?.imageFullUrl || defaultImages[2].urls.full

  return (
    <div
    className='relative bg-no-repeat bg-cover bg-center min-h-screen'
    style={{backgroundImage : `url(${backgroundImage})`}}>
        <BoardNavBar data={board} />
        <div className='absolute inset-0 bg-black/10' />
        <main className='relative pt-28 '>
      {children}
      </main>
    </div>
  )
}

export default BoardIdLayout
