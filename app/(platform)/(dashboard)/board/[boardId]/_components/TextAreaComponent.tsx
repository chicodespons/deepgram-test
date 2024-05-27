"use client"
import React, {useEffect, useState} from 'react';
import { Button} from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, MinusCircle, SettingsIcon, PlayCircleIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CreateTextAreaComponentSchema } from '@/lib/textareacomponent-types/types';
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { createTextAreaComponent } from '@/actions/text_area_component_actions/create-textAreaComponent';
import {useParams} from "next/navigation";
import {getTextAreasForBoardId} from "@/actions/text_area_component_actions/getTextAreasForBoardId";
import {updateTextAreaComponent} from "@/actions/text_area_component_actions/updateTextAreaComponent";
import {deleteTextAreaComponent} from "@/actions/text_area_component_actions/deleteTextAreaComponent";
import useTranscriptionStore from '@/zustandStore/useTranscriptionStore';
import { getMeetingSummary } from '@/app/api/openai/summary/getMeetingSummary';

interface TextAreaInfo {
  row_index: number;
  title: string;
  description: string;
  content: string;
}

const TextAreaComponent = () => {
  const params = useParams<{boardId: string}>();
  const [textAreas, setTextAreas] = useState<TextAreaInfo[]>([]);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const fullTranscription = useTranscriptionStore((state) => state.fullTranscription);

  const {isLoaded, orgId, userId} = useAuth();

  useEffect(() => {
    if (params.boardId) {
      const fetchTextAreas = async () => {
          const response = await getTextAreasForBoardId(params.boardId);
          if (response.error) {
            toast.error('Failed to load textAreas: ' + response.error);
          } else {
            setTextAreas(response.data);
          }
      };

      fetchTextAreas(); // Call the async function immediately
    }
  }, [params.boardId]);

  const handleOpenModal = (index: number | null) => {
    if (index !== null && textAreas[index]) {
      setTitle(textAreas[index].title);
      setDescription(textAreas[index].description);
    } else {
      setTitle('');
      setDescription('');
    }
    setCurrentEditingIndex(index);
    setDialogOpen(true);
  };

  const handleCloseModal = () => {
    setDialogOpen(false);
  };

  const handleConfirmModal = async() => {
    const updatedInfo = { row_index: currentEditingIndex !==null? currentEditingIndex : textAreas.length, title, description, content: '' };

    const validation = CreateTextAreaComponentSchema.safeParse(updatedInfo);
    if (!validation.success){
        let errorMessage = "";
        validation.error.issues.forEach((issue) => {
            errorMessage = errorMessage + issue.path[0] + ": " + issue.message + ". ";
        })

        toast.error(errorMessage);
        return;
    }

    if(!isLoaded && !orgId && !userId) {
        toast.error("Unauthorized");
    }
    
    if (currentEditingIndex === null) {
      setTextAreas([...textAreas, updatedInfo]);
      const response = await createTextAreaComponent(validation.data, params.boardId);
      if (response?.error) {
        toast.error(response?.error);
      }

      if (response?.succes) {
        toast.success("TextAreaComponent created!");
      }
    } else {
      const updatedTextAreas = [...textAreas];
      updatedTextAreas[currentEditingIndex] = updatedInfo;
      setTextAreas(updatedTextAreas);
      const response = await updateTextAreaComponent(validation.data, params.boardId, currentEditingIndex);
      if (response?.error) {
        toast.error(response?.error);
      }

      if (response?.success) {
        toast.success("TextAreaComponent updated!");
      }
    }
    handleCloseModal();
  };

  const handleDeleteTextArea = async () => {
    if (textAreas.length === 0) {
      toast.error("No TextAreaComponent to delete");
      return;
    }

    const indexToDelete = currentEditingIndex !== null ? currentEditingIndex : textAreas.length - 1;
    const allTextAreas = [...textAreas];
    const deletedTextArea = allTextAreas.splice(indexToDelete, 1);

    const response = await deleteTextAreaComponent(deletedTextArea[0].row_index, params.boardId);
    if (response?.error) {
      toast.error(response?.error);
      // Revert state change if deletion fails
      setTextAreas([...textAreas]);
    } else {
      toast.success("TextAreaComponent deleted!");
      setTextAreas(allTextAreas);
      setCurrentEditingIndex(null);
    }

    handleCloseModal();
  };

  const handleSummary = async (index: number) => {
    if (fullTranscription) {
      const response = await getMeetingSummary(fullTranscription);
      if (response) {
        const summary = response.choices[0].message.content;
        setTextAreas(prevTextAreas => prevTextAreas.map((textArea, idx) => idx === index ? { ...textArea, content: summary || '' } : textArea));
        console.log(response.choices[0].message.content);
        toast.success("Meeting summary generated!");
      } else {
        toast.error("Failed to generate meeting summary.");
      }
    } else {
      toast.error("No transcription available to summarize.")
    }
  };

  return (
    <div className='flex flex-col space-y-4 p-5'>
      {textAreas.map((textArea, index) => (
        <div key={index} className='flex flex-col space-y-2'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl text-white font-bold pl-2'>{textArea.title}</h2>
            <div className='flex space-x-2'>
                <Button variant="transparent" onClick={() => handleOpenModal(index)}>
                    <SettingsIcon size={18}/>
                </Button>
                <Button variant="transparent">
                    <PlayCircleIcon size={18} onClick={() => handleSummary(index)} />
                </Button>
            </div>
          </div>
          <Textarea value={textArea.content} onChange={(e) => setTextAreas(textAreas.map((t, idx) => idx === index ? {...t, content: e.target.value} : t))}/>
        </div>
      ))}
      <div className='flex justify-center space-x-4'>
        <Button variant="transparent" onClick={() => handleOpenModal(null)}>
            <PlusCircle />
        </Button>
        <Button variant="transparent" onClick={handleDeleteTextArea}>
            <MinusCircle />
        </Button>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentEditingIndex === null ? 'Add Text Area' : 'Edit Text Area'}</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col space-y-1'>
            <p className='text-xs text-gray-500 my-1'>Title</p>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"/>
          </div>
          <div className='flex flex-col space-y-1'>
            <p className='text-xs text-gray-500 my-1'>Provide a detailed description for the AI system</p>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
          </div>
          
          <DialogFooter>
            <Button variant='primary' onClick={handleConfirmModal}>Confirm</Button>
            <Button variant="destructive" onClick={handleDeleteTextArea}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    
    </div>
  );
}

export default TextAreaComponent;
