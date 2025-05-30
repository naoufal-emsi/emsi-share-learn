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
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `API Error: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('API Error details:', errorData);
        if (errorData.error) {
          errorMessage = `API Error: ${errorData.error}`;
        } else if (errorData.detail) {
          errorMessage = `API Error: ${errorData.detail}`;
        } else if (typeof errorData === 'object') {
          // Format error object into a readable string
          const errorDetails = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
            .join(', ');
          errorMessage = `API Error: ${errorDetails}`;
        }
      } catch (e) {
        // If we can't parse the error as JSON, just use the status
        console.error('Could not parse error response as JSON');
      }
      throw new Error(errorMessage);
    }

    // Handle empty response (e.g., DELETE or 204 No Content)
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
      return null;
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('NetworkError')) {
      console.error('Network error when connecting to API:', error);
      throw new Error('Database connection error. Please check your network connection.');
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid credentials');
        } else if (response.status >= 500) {
          throw new Error('Database connection error');
        } else {
          const errorData = await response.text();
          console.error('Login error response:', errorData);
          throw new Error(`Login failed: ${response.status} ${response.statusText}`);
        }
      }
      
      return response.json();
    } catch (error) {
      console.error('Login request failed:', error);
      throw error;
    }
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
    try {
      // Add retry logic for potential PostgreSQL transaction issues
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          attempts++;
          const response = await apiRequest('/auth/register/', {
            method: 'POST',
            body: JSON.stringify(userData),
          });
          return response;
        } catch (error: any) {
          // If it's a database constraint error and we haven't reached max attempts, retry
          if (error.message && error.message.includes('duplicate key') && attempts < maxAttempts) {
            console.log(`Registration attempt ${attempts} failed, retrying...`);
            // Modify username to avoid conflicts
            userData.username = `${userData.username}_${attempts}`;
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retry
          } else {
            throw error; // Rethrow if max attempts reached or different error
          }
        }
      }
      throw new Error('Registration failed after multiple attempts');
    } catch (error) {
      console.error('Registration API error:', error);
      throw error;
    }
  },
  
  getMe: async () => {
    try {
      const response = await apiRequest('/auth/me/');
      if (!response) {
        throw new Error('Failed to fetch user data');
      }
      return response;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  },
  updateProfile: async (profileData: Partial<{ first_name: string; last_name: string; email: string; avatar?: string }>) => {
    try {
      // Validate email uniqueness if email is being updated
      if (profileData.email) {
        // We could add a check here to verify email uniqueness before attempting update
        // This would prevent PostgreSQL unique constraint errors
      }
      
      const response = await apiRequest('/auth/me/', {
        method: 'PATCH',
        body: JSON.stringify(profileData),
      });
      
      if (!response) {
        throw new Error('Failed to update profile');
      }
      
      return response;
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      // Handle PostgreSQL unique constraint errors
      if (error.message && error.message.includes('duplicate key')) {
        throw new Error('Email already exists. Please use a different email.');
      }
      
      throw error;
    }
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

  // New function to get students for a teacher
  getTeacherStudents: async (teacherId: string) => {
    return apiRequest(`/rooms/teacher-students/?teacher_id=${teacherId}`);
  },
};

// Resources API
export const resourcesAPI = {
  getResources: async (params?: { 
    roomId?: string;
    type?: string;
    category?: string;
    search?: string;
  }) => {
    let endpoint = '/resources/';
    const queryParams = [];
    
    if (params) {
      if (params.roomId) queryParams.push(`room=${params.roomId}`);
      if (params.type) queryParams.push(`type=${params.type}`);
      if (params.category) queryParams.push(`category=${params.category}`);
      if (params.search) queryParams.push(`search=${encodeURIComponent(params.search)}`);
    }
    
    if (queryParams.length > 0) {
      endpoint += `?${queryParams.join('&')}`;
    }
    
    const response = await apiRequest(endpoint);

    // Ensure consistent response structure
    return {
      results: Array.isArray(response) ? response : response?.results || [],
      count: response?.count || 0
    };
  },
  
  getCategories: async () => {
    try {
      const response = await apiRequest('/resource-categories/');
      console.log('Resource categories response:', response);
      return {
        results: Array.isArray(response) ? response : response?.results || [],
        count: response?.count || 0
      };
    } catch (error) {
      console.error('Failed to fetch resource categories:', error);
      return { results: [], count: 0 };
    }
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

// Events API
export const eventsAPI = {
  getEvents: async (params?: {
    room?: string;
    type?: string;
    period?: 'today' | 'tomorrow' | 'week' | 'month' | 'past';
    attendance?: 'attending' | 'maybe' | 'declined' | 'all';
    start_date?: string;
    end_date?: string;
    search?: string;
  }) => {
    let endpoint = '/events/';
    const queryParams = [];
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          queryParams.push(`${key}=${encodeURIComponent(value)}`);
        }
      });
    }
    
    if (queryParams.length > 0) {
      endpoint += `?${queryParams.join('&')}`;
    }
    
    return apiRequest(endpoint);
  },
  
  getEvent: async (eventId: string) => {
    return apiRequest(`/events/${eventId}/`);
  },
  
  createEvent: async (eventData: {
    title: string;
    description?: string;
    location?: string;
    start_time: string;
    end_time: string;
    event_type: string;
    is_online: boolean;
    meeting_link?: string;
    room?: number;
    image_upload?: string;
    video_upload?: string;
  }) => {
    return apiRequest('/events/', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },
  
  updateEvent: async (eventId: string, eventData: Partial<{
    title: string;
    description?: string;
    location?: string;
    start_time: string;
    end_time: string;
    event_type: string;
    is_online: boolean;
    meeting_link?: string;
    room?: number;
    image_upload?: string;
    video_upload?: string;
  }>) => {
    return apiRequest(`/events/${eventId}/`, {
      method: 'PATCH',
      body: JSON.stringify(eventData),
    });
  },
  
  deleteEvent: async (eventId: string) => {
    return apiRequest(`/events/${eventId}/`, {
      method: 'DELETE',
    });
  },
  
  attendEvent: async (eventId: string, status: 'attending' | 'maybe' | 'declined') => {
    return apiRequest(`/events/${eventId}/attend/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },
  
  cancelAttendance: async (eventId: string) => {
    return apiRequest(`/events/${eventId}/cancel_attendance/`, {
      method: 'POST',
    });
  },
  
  getAttendees: async (eventId: string, status?: 'attending' | 'maybe' | 'declined') => {
    let endpoint = `/events/${eventId}/attendees/`;
    if (status) {
      endpoint += `?status=${status}`;
    }
    return apiRequest(endpoint);
  }
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

// Forums API
export const forumsAPI = {
  getCategories: async () => {
    try {
      const response = await apiRequest('/forums/categories/');
      console.log('Forum categories response:', response);
      
      // Handle potential PostgreSQL connection issues with empty response
      if (!response) {
        console.error('Empty response from forum categories API');
        return { results: [], count: 0 };
      }
      
      return {
        results: Array.isArray(response) ? response : response?.results || [],
        count: response?.count || 0
      };
    } catch (error) {
      console.error('Failed to fetch forum categories:', error);
      
      // For database connection errors, return empty results instead of throwing
      if (error instanceof Error && error.message.includes('connection')) {
        console.warn('Database connection issue, returning empty categories');
        return { results: [], count: 0 };
      }
      
      throw error; // Propagate other errors to be handled by the component
    }
  },
  
  getTopics: async (params?: { 
    category?: string; 
    room?: string; 
    search?: string;
    tags?: string;
    is_solved?: boolean;
    created_after?: string;
    created_before?: string;
  }) => {
    let endpoint = '/forums/topics/';
    if (params) {
      const queryParams = [];
      if (params.category) queryParams.push(`category=${params.category}`);
      if (params.room) queryParams.push(`room=${params.room}`);
      if (params.search) queryParams.push(`search=${encodeURIComponent(params.search)}`);
      if (params.tags) queryParams.push(`tags=${encodeURIComponent(params.tags)}`);
      if (params.is_solved !== undefined) queryParams.push(`is_solved=${params.is_solved}`);
      if (params.created_after) queryParams.push(`created_after=${params.created_after}`);
      if (params.created_before) queryParams.push(`created_before=${params.created_before}`);
      
      if (queryParams.length > 0) {
        endpoint += `?${queryParams.join('&')}`;
      }
    }
    
    console.log('Fetching topics from endpoint:', endpoint);
    try {
      // Add retry logic for PostgreSQL connection issues
      let attempts = 0;
      const maxAttempts = 2;
      let lastError;
      
      while (attempts < maxAttempts) {
        try {
          attempts++;
          const response = await apiRequest(endpoint);
          console.log('Topics response:', response);
          
          // Ensure consistent response format
          if (Array.isArray(response)) {
            return { results: response, count: response.length };
          } else if (response && response.results) {
            return response;
          } else if (response) {
            return { results: [response], count: 1 };
          }
          return { results: [], count: 0 };
        } catch (error) {
          console.error(`Error fetching topics (attempt ${attempts}):`, error);
          lastError = error;
          
          // Only retry on connection errors
          if (error instanceof Error && error.message.includes('connection') && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
          } else {
            throw error; // Rethrow if not a connection error or max attempts reached
          }
        }
      }
      
      throw lastError; // Throw the last error if all attempts failed
    } catch (error) {
      console.error('Error fetching topics after all attempts:', error);
      throw error; // Propagate error to be handled by the component
    }
  },
  
  getTopic: async (topicId: string) => {
    try {
      const response = await apiRequest(`/forums/topics/${topicId}/`);
      return response;
    } catch (error) {
      console.error(`Error fetching topic ${topicId}:`, error);
      throw error; // Propagate error to be handled by the component
    }
  },
  
  createTopic: async (topicData: {
    title: string;
    content: string;
    category_id: number;
    room?: number;
    tags?: string;
    attachment_base64?: string | null;
    attachment_name?: string | null;
    attachment_type?: string | null;
    attachment_size?: number | null;
  }) => {
    try {
      console.log('Sending topic data to server:', {
        ...topicData,
        attachment_base64: topicData.attachment_base64 ? '[base64 data]' : null
      });
      
      // Sanitize data for PostgreSQL
      const sanitizedData = {
        ...topicData,
        // Ensure title and content don't exceed PostgreSQL text field limits
        title: topicData.title.substring(0, 255), // VARCHAR(255) limit
        // Ensure tags are properly formatted for PostgreSQL
        tags: topicData.tags ? topicData.tags.replace(/[^\w\s,]/g, '').substring(0, 500) : undefined,
      };
      
      const response = await apiRequest('/forums/topics/', {
        method: 'POST',
        body: JSON.stringify(sanitizedData),
      });
      
      if (!response || !response.id) {
        throw new Error('Invalid response from server when creating topic');
      }
      
      console.log('Server response:', response);
      return response;
    } catch (error) {
      console.error('Error in createTopic:', error);
      
      // Handle specific PostgreSQL errors
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          throw new Error('A similar topic already exists');
        } else if (error.message.includes('foreign key')) {
          throw new Error('Invalid category or room reference');
        }
      }
      
      throw error;
    }
  },
  
  downloadTopicAttachment: async (topicId: string) => {
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_BASE_URL}/forums/topics/${topicId}/attachment/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Attachment download error:', errorText);
        throw new Error(`Failed to download attachment: ${response.status} ${response.statusText}`);
      }
      
      return response.blob();
    } catch (error) {
      console.error(`Error downloading topic attachment for topic ${topicId}:`, error);
      throw error;
    }
  },
  
  toggleSolved: async (topicId: string, postId?: string) => {
    try {
      console.log(`Toggling solved status for topic ${topicId}${postId ? ` with solution post ${postId}` : ''}`);
      const response = await apiRequest(`/forums/topics/${topicId}/toggle_solved/`, {
        method: 'POST',
        body: JSON.stringify({ post_id: postId }),
      });
      console.log('Toggle solved response:', response);
      return response;
    } catch (error) {
      console.error('Error in toggleSolved:', error);
      throw error;
    }
  },
  
  subscribeTopic: async (topicId: string, emailNotifications: boolean = true) => {
    try {
      console.log(`${emailNotifications ? 'Subscribing to' : 'Unsubscribing from'} topic ${topicId}`);
      const response = await apiRequest(`/forums/topics/${topicId}/subscribe/`, {
        method: 'POST',
        body: JSON.stringify({ email_notifications: emailNotifications }),
      });
      console.log('Subscription response:', response);
      return response;
    } catch (error) {
      console.error('Error in subscribeTopic:', error);
      throw error;
    }
  },
  
  getSubscriptionStatus: async (topicId: string) => {
    try {
      const response = await apiRequest(`/forums/topics/${topicId}/subscription_status/`);
      return response;
    } catch (error) {
      console.error(`Error fetching subscription status for topic ${topicId}:`, error);
      return { subscribed: false }; // Default to not subscribed on error
    }
  },
  
  incrementView: async (topicId: string) => {
    try {
      console.log(`Incrementing view count for topic ${topicId}`);
      const response = await apiRequest(`/forums/topics/${topicId}/increment_view/`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('Error in incrementView:', error);
      // Don't throw the error as this is not critical functionality
      return null;
    }
  },
  
  getPosts: async (topicId: string, search?: string) => {
    let endpoint = `/forums/posts/?topic=${topicId}`;
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }
    try {
      const response = await apiRequest(endpoint);
      
      // Ensure consistent response format
      if (Array.isArray(response)) {
        return { results: response, count: response.length };
      } else if (response && response.results) {
        return response;
      } else if (response) {
        return { results: [response], count: 1 };
      }
      return { results: [], count: 0 };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error; // Propagate error to be handled by the component
    }
  },
  
  createPost: async (postData: {
    topic: number;
    content: string;
    parent_post?: number;
    attachment_base64?: string | null;
    attachment_name?: string | null;
    attachment_type?: string | null;
    attachment_size?: number | null;
  }) => {
    try {
      console.log('Sending post data to server:', {
        ...postData,
        attachment_base64: postData.attachment_base64 ? '[base64 data]' : null
      });
      
      // Validate topic ID exists in PostgreSQL
      if (!postData.topic || isNaN(Number(postData.topic))) {
        throw new Error('Invalid topic ID');
      }
      
      // Validate parent post ID if provided
      if (postData.parent_post && isNaN(Number(postData.parent_post))) {
        throw new Error('Invalid parent post ID');
      }
      
      const response = await apiRequest('/forums/posts/', {
        method: 'POST',
        body: JSON.stringify(postData),
      });
      
      if (!response || !response.id) {
        throw new Error('Invalid response from server when creating post');
      }
      
      console.log('Server response for post creation:', response);
      return response;
    } catch (error) {
      console.error('Error in createPost:', error);
      
      // Handle specific PostgreSQL errors
      if (error instanceof Error) {
        if (error.message.includes('foreign key')) {
          throw new Error('The topic or parent post no longer exists');
        } else if (error.message.includes('connection')) {
          throw new Error('Database connection error. Please try again later.');
        }
      }
      
      throw error;
    }
  },
  
  downloadPostAttachment: async (postId: string) => {
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_BASE_URL}/forums/posts/${postId}/attachment/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Attachment download error:', errorText);
        throw new Error(`Failed to download attachment: ${response.status} ${response.statusText}`);
      }
      
      return response.blob();
    } catch (error) {
      console.error(`Error downloading post attachment for post ${postId}:`, error);
      throw error;
    }
  },
  
  votePost: async (postId: string, voteType: 'upvote' | 'downvote') => {
    try {
      console.log(`Voting ${voteType} for post ${postId}`);
      const response = await apiRequest(`/forums/posts/${postId}/vote/`, {
        method: 'POST',
        body: JSON.stringify({ vote_type: voteType }),
      });
      console.log('Vote response:', response);
      return response;
    } catch (error) {
      console.error('Error in votePost:', error);
      throw error;
    }
  },
  
  getVoteStatus: async (postId: string) => {
    return apiRequest(`/forums/posts/${postId}/vote_status/`);
  }
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async () => {
    try {
      console.log('Fetching notifications from API');
      const response = await apiRequest('/notifications/');
      console.log('Raw notifications response:', response);
      return {
        results: Array.isArray(response) ? response : response?.results || [],
        count: response?.count || 0
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { results: [], count: 0 };
    }
  },
  
  getAllNotifications: async (includeArchived: boolean = true) => {
    try {
      console.log('Fetching all notifications from API');
      const endpoint = includeArchived ? '/notifications/?include_archived=true' : '/notifications/';
      const response = await apiRequest(endpoint);
      console.log('Raw all notifications response:', response);
      return {
        results: Array.isArray(response) ? response : response?.results || [],
        count: response?.count || 0
      };
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      return { results: [], count: 0 };
    }
  },
  
  markAsRead: async (notificationId: string) => {
    try {
      console.log(`Marking notification ${notificationId} as read`);
      const response = await apiRequest(`/notifications/${notificationId}/mark_as_read/`, {
        method: 'POST',
      });
      console.log('Mark as read response:', response);
      return response;
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  },
  
  markAllAsRead: async () => {
    try {
      console.log('Marking all notifications as read');
      const response = await apiRequest('/notifications/mark_all_as_read/', {
        method: 'POST',
      });
      console.log('Mark all as read response:', response);
      return response;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
};