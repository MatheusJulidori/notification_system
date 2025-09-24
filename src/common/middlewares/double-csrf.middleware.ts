import { doubleCsrf } from 'csrf-csrf';
import { Request } from 'express';

function tryDecodeJWT(token: string): any | null {
    try {
        const payload = token.split('.')[1];
        const decoded = Buffer.from(payload, 'base64url').toString('utf8');
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

const csrfConfig = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET || 'super-secret-key',
    cookieName: 'XSRF-TOKEN',
    cookieOptions: {
        httpOnly: false,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
    },
    getCsrfTokenFromRequest: (req: Request) => {
        const token = req.headers['x-xsrf-token'] || req.cookies['XSRF-TOKEN'];
        return Array.isArray(token) ? token[0] : (token ?? '');
    },
    getSessionIdentifier: (req: Request) => {
        let token = req.cookies?.accessToken;

        if (!token) {
            const auth = req.headers.authorization;
            if (auth?.startsWith('Bearer ')) {
                token = auth.split(' ')[1];
            }
        }

        if (!token || token.split('.').length !== 3) {
            return 'unauthenticated';
        }

        try {
            const decoded: any = tryDecodeJWT(token);
            return decoded?.sub || decoded?.id || 'missing-user-id';
        } catch {
            return 'unauthenticated';
        }
    },
});

export const doubleCsrfProtection = csrfConfig.doubleCsrfProtection;

export const generateCsrfToken = csrfConfig.generateCsrfToken;
