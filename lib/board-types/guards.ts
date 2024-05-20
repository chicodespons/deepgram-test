import { Board } from './types';

export function isBoard(data: any): data is Board {
    return (
        data &&
        typeof data.id === 'string' &&
        typeof data.organisation_id === 'string' &&
        typeof data.title === 'string' &&
        typeof data.image_id === 'string' &&
        (typeof data.image_thumb_url === 'string' || data.image_thumb_url === null) &&
        (typeof data.image_full_url === 'string' || data.image_full_url === null) &&
        (typeof data.image_link_html === 'string' || data.image_link_html === null) &&
        (typeof data.image_user_name === 'string' || data.image_user_name === null) &&
        typeof data.created_at === 'string' &&
        typeof data.updated_at === 'string'
    );
}