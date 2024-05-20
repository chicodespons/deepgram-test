"use client";
import { deleteBoard } from "@/actions/board_actions/delete-board";
import { Button } from "@/components/ui/button";
import {Popover, PopoverClose, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import { useAuth } from "@clerk/nextjs";
import { MoreHorizontal, X } from "lucide-react";
import toast from "react-hot-toast";

interface BoardOptionsProps {
    id: string;
}

const BoardOptions = ({
    id,
}: BoardOptionsProps) => {

    const { isLoaded, orgId, userId } = useAuth();

    const deleteBoardAction = async() => {

        if (isLoaded && orgId && userId) {
            const response = await deleteBoard(id);

            if (response?.error){
                toast.error(response.error);
            } else {
                toast.success("board deleted")
            }
        }

    }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="h-auto w-auto p-2" variant="transparent">
           <MoreHorizontal className="h-4 w-4" /> 
        </Button>
      </PopoverTrigger>
      <PopoverContent
      className="px-0 pt-3 pb-3"
      side="bottom"
      align="start"
      >
        <div className="text-sm font-medium text-center text-neutral-600 pb-4 ">
            Board actions
        </div>
        <PopoverClose asChild>
            <Button 
            className="h-auto w-auto p-2 absolute top-2 right-2 text-neutral-600"
            variant="ghost"
            >
                <X className="h-4 w-4"/>
            </Button>
        </PopoverClose>
        <Button 
        variant="ghost"
        onClick={deleteBoardAction}
        className="rounded-none w-full h-auto p-2 px-5 justify-start font-normal text-sm">
            Delete this board
        </Button>
      </PopoverContent>
    </Popover>
  )
}

export default BoardOptions
