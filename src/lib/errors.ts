export class AuthError extends Error {
    constructor(
        message: string,
        public code: string,
        public status?: number,
        public details?: string
    ) {
        super(message);
        this.name = 'AuthError';
    }
}
