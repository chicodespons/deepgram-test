import { z } from 'zod';

export const CreateBoardSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(3, {
        message: "Board title must be at least 3 charachters long."
    }).max(15, {
        message: "Board title must be at most 15 charachters long."
    }),
    image: z.string({
        required_error: "Image is required",
        invalid_type_error: "Image is of invalid type",
    }),
})

export type CreateBoard = z.infer<typeof CreateBoardSchema>;

export const UpdateBoardSchema = z.object({
    title: z.string({
        required_error: "Title is required",
        invalid_type_error: "Title is of invalid type",
    }).min(3, {
        message: "Board title must be at least 3 charachters long."
    }).max(15, {
        message: "Board title must be at most 15 charachters long."
    }),
    id: z.string(),
})

export type UpdateBoard = z.infer<typeof UpdateBoardSchema>;

export const DeleteBoardSchema =  z.object({
    id: z.string(),
});

export type DeleteBoard = z.infer<typeof DeleteBoardSchema>;

export interface Board {
    id: string;
    organisation_id: string;
    title: string;
    image_id: string;
    image_thumb_url: string;
    image_full_url: string;
    image_link_html: string;
    image_user_name: string;
    created_at?: string;
    updated_at?: string;
}


