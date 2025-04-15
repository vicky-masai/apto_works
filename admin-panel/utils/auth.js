// Token management utilities
export const TOKEN_KEY = 'adminToken';

export const setToken = (token) => {
  // Set in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
  
  // Set in cookies
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=86400`; // 24 hours
};

export const getToken = () => {
  // Try to get from localStorage first
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) return token;
  }
  
  // Fallback to cookies
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === TOKEN_KEY) return value;
  }
  
  return null;
};

export const removeToken = () => {
  // Remove from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
  
  // Remove from cookies
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}; 