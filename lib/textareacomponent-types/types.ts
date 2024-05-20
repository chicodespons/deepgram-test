import {z} from "zod";

export const CreateTextAreaComponentSchema = z.object({
    row_index: z.number().int().nonnegative(),
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    description: z.string().max(500, "Description is too long").optional(),
    content: z.string().optional(),

})

export type CreateTextAreaComponent = z.infer<typeof CreateTextAreaComponentSchema>

export const UpdateTextAreaSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    description: z.string().max(500, "Description is too long").optional(),
    content: z.string().optional(),
})

export type UpdateTextAreaComponent = z.infer<typeof UpdateTextAreaSchema>

export interface TextAreaComponent {
    id: string;
    row_index: number;
    title: string;
    description: string | null;
    content: string | null;
    board_id: string;
    created_at: string;
    updated_at: string;
}