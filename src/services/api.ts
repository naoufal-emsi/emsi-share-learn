
const API_BASE_URL = 'http://localhost:8000/api';

// API utility functions
const getAuthToken = () => localStorage.getItem('emsi_access');

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
  
  return response.json();
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/token/`, {
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
};

// Resources API
export const resourcesAPI = {
  getResources: async (roomId: string) => {
    return apiRequest(`/resources/?room=${roomId}`);
  },
  
  uploadResource: async (formData: FormData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/resources/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload resource');
    }
    
    return response.json();
  },
};

// Quizzes API
export const quizzesAPI = {
  // Get public quizzes for sidebar
  getPublicQuizzes: async () => {
    return apiRequest('/quizzes/?public=true');
  },
  
  // Get room-specific quizzes
  getQuizzes: async (roomId: string) => {
    return apiRequest(`/quizzes/?room=${roomId}`);
  },
  
  // Get quiz details
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
  
  // Get quiz resources
  getQuizResources: async (quizId: string) => {
    return apiRequest(`/quizzes/${quizId}/resources/`);
  },
  
  // Download quiz resource
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
