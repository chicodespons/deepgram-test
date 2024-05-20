"use client";

import { updateBoard } from "@/actions/board_actions/update-board";
import { FormInput } from "@/components/form/form-input";
import { Button } from "@/components/ui/button";
import { UpdateBoardSchema } from "@/lib/board-types/types";
import { useAuth } from "@clerk/nextjs";
import { Board } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ElementRef, useRef, useState } from "react";
import toast from "react-hot-toast";

interface BoardTitleFormProps {
    data: Board;
}

const BoardTitleForm = ({
    data
} : BoardTitleFormProps) => {

  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);
  const { isLoaded, orgId, userId } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(data.title);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    })
  }

  const disableEditing = () => {
    setIsEditing(false);
  }

  const onSubmit = async(formData: FormData) => {

    const updatedTitle = formData.get("title")?.toString();

    if (updatedTitle === title) {
      disableEditing();
      return;
    }

    const updatedBoard = {
      title: updatedTitle,
      id : data.id,
    }

    const result = UpdateBoardSchema.safeParse(updatedBoard);

    if(!result.success) {
      let errorMessage = "";
      result.error.issues.forEach((issue) => {
        errorMessage = errorMessage + issue.path[0] + ": " + issue.message + ". ";
      })
      toast.error(errorMessage);
      return
    }

    if (isLoaded && orgId && userId) {
      const response = await updateBoard(result.data);
      
      if (response.error){
        toast.error(response.error);
      }

      if (response.succes && response.data){
        toast.success(`Board "${response.data.title}" updated!`);
        setTitle(response.data.title);
        disableEditing();
      }
    } else {
      toast.error("No organization chosen");
      router.push("/select-org");
    }
  }

  const onBlur = () => {
    formRef.current?.requestSubmit();
  }

  if (isEditing){
    return(
      <form action={onSubmit} ref={formRef} className="flex items-center gap-x-2">
        <FormInput 
        ref={inputRef}
        id="title"
        onBlur={onBlur}
        defaultValue={title}
        className="text-lg font-bold px-[7px] py-1 h-7 bg-transparent
        focus-visible:outline-none focus-visible:ring-transparent border-none" />
      </form>
    )
  }

  return (
    <Button 
    onClick={enableEditing}
    variant="transparent"
    className="font-bold text-lg h-auto w-auto p-1 px-2">
        {title}
    </Button>
  )
}

export default BoardTitleForm;
