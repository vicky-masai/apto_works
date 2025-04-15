const TOKEN_KEY = 'admin_token';

export const auth = {
    getToken: () => {
        if (typeof window !== 'undefined') {
            return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2Y2MTY2Y2E1YjI3Y2ViMDM2YWU3NTQiLCJ1c2VyVHlwZSI6IlRhc2tQcm92aWRlciIsImlhdCI6MTc0NDY5Mjg5MywiZXhwIjoxNzQ1MDUyODkzfQ.Qq8wuwTt7sRvoo5LGFyefmyfSJyz0qefePA3JIDLPEk";
        }
        return null;
    },

    setToken: (token) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, token);
        }
    },

    removeToken: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY);
        }
    },

    isAuthenticated: () => {
        return !!auth.getToken();
    }
}; 