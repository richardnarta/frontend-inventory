export interface BaseListResponse {
    error: boolean;
    message: string;
    item_count: number;
    page: number;
    limit: number;
    total_pages: number;
}

export interface BaseSingleResponse {
    error: boolean;
    message: string;
}