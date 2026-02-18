import { NextResponse } from 'next/server';

type ApiResponse<T = any> = {
    success: boolean;
    message?: string;
    data?: T;
};

export function successResponse<T>(data: T, message?: string, status: number = 200) {
    return NextResponse.json(
        {
            success: true,
            message,
            data,
        } as ApiResponse<T>,
        { status }
    );
}

export function errorResponse(message: string, status: number = 400, data?: any) {
    return NextResponse.json(
        {
            success: false,
            message,
            data,
        } as ApiResponse,
        { status }
    );
}
