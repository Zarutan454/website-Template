// Zentrale API-Endpunkte für User/Profile

export const API_BASE = '/api';
export const API_AUTH = `${API_BASE}/auth`;

export const API_PROFILE = `${API_AUTH}/profile/`;
export const API_PROFILE_DETAIL = `${API_AUTH}/profile/detail/`;
export const API_PROFILE_ABOUT = `${API_AUTH}/profile/about/`;
export const API_PROFILE_SOCIAL_LINKS = `${API_AUTH}/profile/social-links/`;
export const API_PROFILE_BY_USERNAME = (username: string) => `${API_AUTH}/profile/${username}/`;
export const API_PROFILE_BY_ID = (userId: number | string) => `${API_AUTH}/${userId}/profile/`;

// ...weitere Endpunkte nach Bedarf 