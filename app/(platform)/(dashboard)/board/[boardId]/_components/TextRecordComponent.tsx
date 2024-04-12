// "use client";

// import { Textarea } from '@/components/ui/textarea'
// import React, { useState, useEffect, useRef } from 'react'
// import { Button } from '@/components/ui/button'
// import { Mic, MicOff } from 'lucide-react'
// import { default as languageCodesData } from "@/languagedata/language-codes.json"
// import { default as countryCodesData } from "@/languagedata/country-codes.json"


// const languageCodes: Record<string, string> = languageCodesData;
// const countryCodes: Record<string, string> = countryCodesData;

// const TextRecordComponent = () => {

//     const recognitionRef = useRef<SpeechRecognition>();

//     const [isActive, setIsActive] = useState<boolean>(false);
//     const [text, setText] = useState<string>();
//     const [translation, setTranslation] = useState<string>();
//     const [language, setLanguage] = useState<string>();
//     const [voices, setVoices] = useState<Array<SpeechSynthesisVoice>>();

//    useEffect(( )=> {
//       setLanguage(navigator.language);
//    }, [])

//     const availableLanguages = Array.from(new Set(voices?.map(({ lang }) => lang)))
//     .map(lang => {
//       const split = lang.split('-');
//       const languageCode: string = split[0];
//       const countryCode: string = split[1];
//       return {
//         lang,
//         label: languageCodes[languageCode] || lang,
//         dialect: countryCodes[countryCode]
//       }
//     })
//     .sort((a, b) => a.label.localeCompare(b.label));
    
//     const availableVoices = voices?.filter(({ lang }) => lang === language);
//     const activeVoice = 
//     availableVoices?.find(({ name }) => name.includes("Google"))
//     || availableVoices?.find(({ name }) => name.includes("Luciana"))
//     || availableVoices?.[0];


//     useEffect(()=>{
//         const voices = window.speechSynthesis.getVoices();
//         if (Array.isArray(voices) && voices.length > 0 ) {
//             setVoices(voices);
//             return;
//         }
//         if ( 'onvoiceschanged' in window.speechSynthesis ) {
//             window.speechSynthesis.onvoiceschanged = function(){
//                 const voices = window.speechSynthesis.getVoices();
//                 setVoices(voices);
//             }
//         }
        
//     }, []);

// function handleOnRecord() {
//     if (isActive) {
//       recognitionRef.current?.stop();
//       setIsActive(false);
//       return;
//     }

//     speak("  ");
    

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     recognitionRef.current = new SpeechRecognition();

//     recognitionRef.current.onstart = function(){
//       setIsActive(true);
//     }

//     recognitionRef.current.onend = function(){
//       setIsActive(false);
//     }


//     recognitionRef.current.onresult = async function(event){
//       const transcript = event.results[0][0].transcript;
//       setText(transcript)
//       const response = await fetch('/api/openai/translate', {
//         method: 'POST',
//         body: JSON.stringify({
//             text: transcript,
//             language: 'pt-BR'
//         })
//       }).then(r => r.json());
//       setTranslation(response.text);
//       speak(response.text);
//     }

//     recognitionRef.current.start();
// }

//     function speak(text: string) {
//       if ( !activeVoice ) return;

//       let utterance = new SpeechSynthesisUtterance(text);

//       const voices = window.speechSynthesis.getVoices();

//       utterance.voice = activeVoice;
//       window.speechSynthesis.speak(utterance);
//     }
    


//   return (
//     <div className='p-5'>
//       <div className="flex items-center mb-3 ">
//         <div className="ml-auto flex gap-x-4">
//           <select className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
//           name='language'
//           value={language}
//           onChange={(event) => {
//             setLanguage(event.currentTarget.value)
//           }}>
//             {availableLanguages.map(({ lang, label }) => {
//               return (
//                 <option key={lang} value={lang}>
//                   {label} ({ lang })
//                 </option>
//               )
//             })}
//           </select>
//           <Button
//           onClick={handleOnRecord}
//           variant="primary"
//            >
//             { isActive? <Mic className="h-4 w-4"/> : <MicOff className='h-4 w-4'/>}
            
//           </Button>
//         </div>
//       </div>
//       <div className='flex flex-col space-y-4'>
//         <Textarea value={text} onChange={(e) => setText(e.target.value)} />
//         <Textarea value={translation} />
//       </div>
//     </div>
//   )
// }

// export default TextRecordComponent
