// Kommentar-Utilities
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const deleteComment = async (commentId: number): Promise<boolean> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Kein Token gefunden');
    }

    const url = BASE_URL + '/comments/' + String(commentId) + '/';
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
}; 