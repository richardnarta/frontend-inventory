import type { UserRole } from './auth';

export interface UserItem {
    id: string;
    nama: string;
    username: string;
    role: UserRole;
}

export interface UserCreateRequest {
    nama: string;
    username: string;
    password: string;
    role: UserRole;
}

export interface UserUpdateRequest {
    nama?: string;
    role?: UserRole;
    password?: string;
}

export interface UserListResponse {
    message: string;
    data: UserItem[];
}

export interface SingleUserFullResponse {
    message: string;
    data: UserItem;
}
