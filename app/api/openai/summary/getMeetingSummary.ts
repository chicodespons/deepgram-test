"use server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function getMeetingSummary(transcript: string) {
    try {

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Geef mij alle medicamenten dat de patient neemt en voor welke aandoeningen hij die neemt."
                },
                {
                    role: "user",
                    content: transcript
                }
            ],
            temperature: 0.2,
            max_tokens: 500,
        });

        console.log(response);
        return response;
    } catch (error) {
        console.error("Error creating completion:", error);
    }
}
