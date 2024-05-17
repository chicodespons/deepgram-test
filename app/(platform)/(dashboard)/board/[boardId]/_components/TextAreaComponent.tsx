"use client"
import React, { useState } from 'react';
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
import { CreateTextAreaComponentSchema } from '@/lib/types';
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { createTextAreaComponent } from '@/actions/create-textAreaComponent';

interface TextAreaInfo {
  title: string;
  description: string;
  content: string;
}

const TextAreaComponent = () => {
  const [textAreas, setTextAreas] = useState<TextAreaInfo[]>([]);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const {isLoaded, orgId, userId} = useAuth();

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
    const updatedInfo = { title, description, content: '' };

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
      const response = await createTextAreaComponent(validation.data);
    } else {
      const updatedTextAreas = [...textAreas];
      updatedTextAreas[currentEditingIndex] = updatedInfo;
      setTextAreas(updatedTextAreas);
    }
    handleCloseModal();
  };

  const handleDeleteTextArea = () => {
    const allTextAreas = [... textAreas];
    if (currentEditingIndex !== null) {
        delete allTextAreas[currentEditingIndex];
        setTextAreas(allTextAreas);
    }
    
  }

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
                    <PlayCircleIcon size={18} />
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
        <Button variant="transparent" onClick={() => setTextAreas(textAreas.slice(0, -1))}>
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
};

export default TextAreaComponent;
