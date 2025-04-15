const TOKEN_KEY = 'adminToken';

export const auth = {
    getToken: () => {
        if (typeof document !== 'undefined') {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === TOKEN_KEY) {
                    return decodeURIComponent(value);
                }
            }
        }
        return null;
    },

    setToken: (token) => {
        if (typeof document !== 'undefined') {
            // Set cookie with secure and HttpOnly flags
            const expires = new Date();
            expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
            document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)};expires=${expires.toUTCString()};path=/;secure;SameSite=Strict`;
        }
    },

    removeToken: () => {
        if (typeof document !== 'undefined') {
            document.cookie = `${TOKEN_KEY}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;secure;SameSite=Strict`;
        }
    },

    isAuthenticated: () => {
        return !!auth.getToken();
    }
}; 