import { TextAreaComponent } from './types';

export function isTextAreaComponent(data: any): data is TextAreaComponent {
    return (
        data &&
        typeof data.id === 'string' &&
        typeof data.row_index === 'number' &&
        typeof data.title === 'string' &&
        (typeof data.description === 'string' || data.description === null) &&
        (typeof data.content === 'string' || data.content === null) &&
        typeof data.board_id === 'string' &&
        typeof data.created_at === 'string' &&
        typeof data.updated_at === 'string'
    );
}