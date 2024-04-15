"use client";

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { 
    createClient, 
    CreateProjectKeyResponse,
    LiveClient,
    LiveTranscriptionEvents,
} from "@deepgram/sdk";
import { useQueue } from "@uidotdev/usehooks";

const TextRecordComponentDeepGram = () => {

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
    const [fullTranscription, setFullTranscription] = useState<string>('');

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
                console.log("data: " + data);
                const newCaption = words
                  .map((word: any) => word.punctuated_word ?? word.word)
                  .join(" ");
                if (newCaption !== "") {
                  setCaption(newCaption);
                  console.log(newCaption);
                  setFullTranscription((prev) => prev + ' ' + newCaption);
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


  return (
    <div className='p-5'>
      <div className="flex items-center mb-3 ">
        <div className="ml-auto flex gap-x-4">
           <select className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            name='language'
            >
          </select>
          <button
          onClick={() => toggleMic()}
           >
            { micOpen? <Mic className='h-4 w-4'/> : <MicOff className='h-4 w-4'/> }
            
          </button>
        </div>
      </div>
      <div className='flex flex-col space-y-4'>
      <Textarea 
                value={caption ?? "** Realtime transcription by Deepgram **"} 
                onChange={(e) => setCaption(e.target.value)} 
            />
        <Textarea 
        value={fullTranscription}
        readOnly
        />
      </div>
    </div>
  )
}

export default TextRecordComponentDeepGram
