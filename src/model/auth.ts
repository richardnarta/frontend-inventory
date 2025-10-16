/**
 * Based on OpenAPI schema: UserLoginRequest
 * Defines the structure for the login request payload.
 */
export interface UserLoginRequest {
    username: string;
    password?: string;
}

/**
 * Represents the base structure for a single-item API response.
 */
export interface BaseSingleResponse {
    error: boolean;
    message: string;
}

/**
 * Represents the authenticated user's data.
 */
export interface UserData {
    id: string;
    nama: string;
    username: string;
}

/**
 * Represents the API response for a single user profile.
 */
export interface SingleUserResponse extends BaseSingleResponse {
    data: UserData;
}

