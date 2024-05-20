import {z} from "zod";

export const SaveFullTranscriptionSchema = z.object({
    id: z.string().optional(),
    boardId: z.string({
        required_error: "BoardId is required",
        invalid_type_error: "BoardId is of invalid type",
    }),
    fullTranscription: z.string({
        required_error: "Full transcription is required",
        invalid_type_error: "Full transcription is of invalid type",
    })
})

export type SaveFullTranscription = z.infer<typeof SaveFullTranscriptionSchema>;