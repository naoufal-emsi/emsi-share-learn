const API_BASE_URL = 'http://127.0.0.1:8000/api';

// API utility functions
// Use cookies for JWT tokens
const getCookie = (name: string) => {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r
  }, '');
};
const getAuthToken = () => getCookie('emsi_access');

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  // Handle empty response (e.g., DELETE or 204 No Content)
  const contentType = response.headers.get('content-type');
  if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
    return null;
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
    
    return response.json();
  },
  
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
    role: string;
  }) => {
    return apiRequest('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  getMe: async () => {
    return apiRequest('/auth/me/');
  },
  updateProfile: async (profileData: Partial<{ first_name: string; last_name: string; email: string; avatar?: string }>) => {
    return apiRequest('/auth/me/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },
};

// Rooms API
export const roomsAPI = {
  getRooms: async () => {
    return apiRequest('/rooms/');
  },
  
  createRoom: async (roomData: {
    name: string;
    subject: string;
    description?: string;
  }) => {
    return apiRequest('/rooms/', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  },
  
  joinRoom: async (roomId: string) => {
    return apiRequest('/rooms/join/', {
      method: 'POST',
      body: JSON.stringify({ room_id: roomId }),
    });
  },
  
  leaveRoom: async (roomId: string) => {
    return apiRequest(`/rooms/${roomId}/leave/`, {
      method: 'POST',
    });
  },
  
  getRoomDetails: async (roomId: string) => {
    return apiRequest(`/rooms/${roomId}/`);
  },
  
  deleteRoom: async (roomId: string) => {
    return apiRequest(`/rooms/${roomId}/`, {
      method: 'DELETE',
    });
  },
};

// Resources API
export const resourcesAPI = {
  getResources: async (roomId?: string) => {
    const endpoint = roomId ? `/resources/?room=${roomId}` : '/resources/';
    const response = await apiRequest(endpoint);

    // Ensure consistent response structure
    return {
      results: Array.isArray(response) ? response : response?.results || [],
      count: response?.count || 0
    };
  },
  
  uploadResource: async (formData: FormData) => {
    const token = getAuthToken();
    
    // Log the formData contents for debugging
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    
    const response = await fetch(`${API_BASE_URL}/resources/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type header - let browser set it with boundary for multipart
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Upload error response:', errorData);
      throw new Error(`Failed to upload resource: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },
  
  downloadResource: async (resourceId: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/download/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download resource');
    }

    return response.blob();
  },
};

// Quizzes API
export const quizzesAPI = {
  getPublicQuizzes: async () => {
    return apiRequest('/quizzes/?public=true');
  },
  
  getQuizzes: async (roomId: string) => {
    return apiRequest(`/quizzes/?room=${roomId}`);
  },
  
  getQuizDetails: async (quizId: string) => {
    return apiRequest(`/quizzes/${quizId}/`);
  },
  
  createQuiz: async (quizData: any) => {
    return apiRequest('/quizzes/', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  },
  
  submitQuiz: async (quizId: string, answers: any[]) => {
    return apiRequest(`/quizzes/${quizId}/submit/`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },
  
  getQuizResources: async (quizId: string) => {
    return apiRequest(`/quizzes/${quizId}/resources/`);
  },
  
  downloadQuizResource: async (resourceId: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/quizzes/resource/${resourceId}/download/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download resource');
    }
    
    return response.blob();
  },
};
