"use client";

import {Popover, PopoverClose, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import { createBoard } from "@/actions/create-board";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FormInput } from "@/components/form/form-input";
import { FormSubmit } from "@/components/form/form-submit";
import { CreateBoardSchema } from "@/lib/types";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ElementRef, useRef, useState } from "react";
import FormPicker from "./form-picker";

interface FormPopoverProps {
    children: React.ReactNode;
    side?: "left" | "right" | "top" | "bottom";
    align?: "start" | "center" | "end";
    sideOffset?: number;
};


const FormPopover = ({
    children,
    side = "bottom",
    align,
    sideOffset = 0,
}: FormPopoverProps) => {

    const {isLoaded, orgId, userId} = useAuth();
    const closeRef = useRef<ElementRef<"button">>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const router = useRouter();

    const handleImageSelect = (imageData: string) => {
        setSelectedImage(imageData)
    }

    const addBoard = async(formdata: FormData) => {
        const newBoard = {
            title: formdata.get("title"),
            image: selectedImage,
        };


       const result = CreateBoardSchema.safeParse(newBoard);

       if (!result.success) {
        let errorMessage = "";
        result.error.issues.forEach((issue) => {
            errorMessage = errorMessage + issue.path[0] + ": " + issue.message + ". ";
        })
        
        toast.error(errorMessage);
        return;
       }
       
       if (isLoaded && orgId && userId) {
        const response = await createBoard(result.data);
        if(response.error) {
            toast.error(response.error);
        }

        if(response.succes && response.boardId) {
            toast.success("Board created!");
            closeRef.current?.click();
            router.push(`/board/${response.boardId}`);
        }
        
       } else {
        toast.error("No organization chosen");
        router.push("/select-org");
       }

        
    }
  return (
    <Popover>
        <PopoverTrigger asChild>
          <div 
            role='button'>
            {children}
          </div>
        </PopoverTrigger>
        <PopoverContent
        align={align}
        className="w-80 pt-3"
        side={side}
        sideOffset={sideOffset}
        >
            <div className="text-sm font-medium text-center text-neutral-600 pb-4">
                Create board
            </div>
            <PopoverClose asChild ref={closeRef}>
                <Button 
                className="h-auto w-auto p-2 absolute top-2 right-2 text-neutral-600"
                variant="ghost"
                >
                    <X className="h-4 w-4"/>
                </Button>
            </PopoverClose>
            <form action={addBoard} className="space-y-4">
                <div className="space-y-4">
                    <FormPicker
                    id="image"
                    onSelectImage={handleImageSelect}
                     />
                    <FormInput 
                    id="title"
                    label="Board title"
                    type="text"
                    />
                    <FormSubmit className="w-full">
                        Create
                    </FormSubmit>
                </div>
            </form>
        </PopoverContent>
    </Popover>
  )
}

export default FormPopover;
