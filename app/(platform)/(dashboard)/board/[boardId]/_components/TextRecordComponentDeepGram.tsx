"use client";

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { 
    createClient, 
    CreateProjectKeyResponse,
    LiveClient,
    LiveTranscriptionEvents,
} from "@deepgram/sdk";
import { useQueue } from "@uidotdev/usehooks";
import {useParams} from "next/navigation";
import {saveFullTranscription} from "@/actions/text_record_component_actions/saveFullTranscription";
import {toast} from "react-hot-toast";
import {getFullTranscription} from "@/actions/text_record_component_actions/getFullTranscription";
import useTranscriptionStore from '@/zustandStore/useTranscriptionStore';

const TextRecordComponentDeepGram = () => {

    const params = useParams<{boardId: string}>();
    const { add, remove, first, size, queue } = useQueue<any>([]);
    const [apiKey, setApiKey] = useState<CreateProjectKeyResponse | null>();
    const [connection, setConnection] = useState<LiveClient | null>();
    const [isListening, setListening] = useState(false);
    const [isLoadingKey, setLoadingKey] = useState(true);
    const [isLoading, setLoading] = useState(true);
    const [isProcessing, setProcessing] = useState(false);
    const [micOpen, setMicOpen] = useState(false);
    const [microphone, setMicrophone] = useState<MediaRecorder | null>();
    const [userMedia, setUserMedia] = useState<MediaStream | null>();
    const [caption, setCaption] = useState<string | null>();
    const fullTranscription = useTranscriptionStore((state) => state.fullTranscription);
    const setFullTranscription = useTranscriptionStore((state) => state.setFullTranscription);
    const [isSaved, setIsSaved] = useState(false);

    const toggleMic = useCallback(async () => {
        if (microphone && userMedia) {
            setUserMedia(null);
            setMicrophone(null);

            microphone.stop();
        } else {
            const userMedia = await navigator.mediaDevices.getUserMedia({
                audio : true,
            });

            const microphone = new MediaRecorder(userMedia);
            microphone.start(500);

            microphone.onstart = () => {
                setMicOpen(true);
            }

            microphone.onstop = () => {
                setMicOpen(false);
            }

            microphone.ondataavailable = (e) => {
                add(e.data);
            }

            setUserMedia(userMedia);
            setMicrophone(microphone);
        }
    }, [add, microphone, userMedia]);

    useEffect(() => {
        if (!apiKey) {
            console.log("getting a new api key");
            fetch("/api/deepgram", {cache: "no-store"})
            .then((res) => res.json())
            .then((object) => {
                if (!("key" in object)) throw new Error("No api key returned");
                setApiKey(object);
                setLoadingKey(false);
            })
            .catch((e) => {
                console.error(e);
            });
        }
    }, [apiKey]);

    useEffect(() => {
        if(apiKey && "key" in apiKey){
            console.log("connecting to deepgram");
            const deepgram = createClient(apiKey?.key ?? "");
            const connection = deepgram.listen.live({
                model: "nova-2-general",
                language: "nl-BE",
                interim_results: true,
                smart_format: true,
            });

            connection.on(LiveTranscriptionEvents.Open, () => {
                console.log("connection established");
                setListening(true);
              });

              connection.on(LiveTranscriptionEvents.Close, () => {
                console.log("connection closed");
                setListening(false);
                setApiKey(null);
                setConnection(null);
              });

              connection.on(LiveTranscriptionEvents.Transcript, (data) => {
                const words = data.channel.alternatives[0].words;
                const isFinal = data.is_final;
                const newCaption = words
                  .map((word: any) => word.punctuated_word ?? word.word)
                  .join(" ");
                if (newCaption !== "") {
                  setCaption(newCaption);
                  if(isFinal) {
                    
                    setFullTranscription((prev) => prev + ' ' + newCaption);
                  }
                }
              });

              setConnection(connection);
              setLoading(false);
        }
    }, [apiKey]);

    useEffect(() => {
        const processQueue = async () => {
          if (size > 0 && !isProcessing) {
            setProcessing(true);
    
            if (isListening) {
              const blob = first;
              connection?.send(blob);
              remove();
            }
    
            const waiting = setTimeout(() => {
              clearTimeout(waiting);
              setProcessing(false);
            }, 250);
          }
        };
    
        processQueue();
      }, [connection, queue, remove, first, size, isProcessing, isListening]);

    const handleSave = useCallback(async () => {
        const response = await saveFullTranscription(fullTranscription, params.boardId);
        if (response.error) {
            toast.error(response.error);
        } else {
            toast.success("Full Transcription saved");
            setIsSaved(true);
        }
    }, [fullTranscription, params.boardId]);

    useEffect(() => {
        const saveTranscription = async () => {
            await handleSave();
        };
        const intervalId = setInterval(saveTranscription, 600000);
        return () => clearInterval(intervalId);
    }, [handleSave]);

    const handleFullTranscriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFullTranscription(e.target.value);
        setIsSaved(false);
    };

    useEffect(() => {
        const fetchFullTranscription = async () => {
            const response = await getFullTranscription(params.boardId);
            if (response.error) {
                toast.error(response.error);
            } else {
                console.log("Fetched full transcription:", response?.data?.fullTranscription);
                setFullTranscription(response?.data?.fullTranscription || '');
            }
        };

        fetchFullTranscription();
    }, [params.boardId]);

    return (
        <div className='p-5'>
            <div className='flex flex-col space-y-4'>
                <div className="flex items-center justify-between">
                    <h2 className='text-xl text-white font-bold'>Realtime transcription by Deepgram</h2>
                    <div className="flex gap-x-4">
                        <select
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            name='language'
                        >
                        </select>
                        <Button variant="transparent" onClick={() => toggleMic()}>
                            {micOpen ? <Mic className='h-4 w-4'/> : <MicOff className='h-4 w-4'/>}
                        </Button>
                    </div>
                </div>
                <Textarea
                    value={caption ?? "** Realtime transcription by Deepgram **"}
                    onChange={(e) => setCaption(e.target.value)}
                />
                <div className="flex items-center justify-between">
                    <h2 className="text-xl text-white font-bold">Full Transcription</h2>
                    <Button
                        variant="transparent"
                        onClick={handleSave}
                        className={isSaved? "bg-green-500" : "bg-red-500"}
                    >
                        {isSaved ? "Saved" : "Save"}
                    </Button>
                </div>
                <Textarea
                    value={fullTranscription}
                    onChange={handleFullTranscriptionChange}
                />
            </div>
        </div>
    );

}

export default TextRecordComponentDeepGram
