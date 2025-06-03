// This is a modified version of the uploadResource function
// to be copied into the main api.ts file

uploadResource: async (formData: FormData) => {
  const token = getAuthToken();
  
  // Log the formData contents for debugging
  console.log('FormData contents:');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }
  
  // Remove type parameter if it exists - backend will auto-detect file type
  if (formData.has('type')) {
    formData.delete('type');
  }
  
  // CRITICAL: Ensure status is set correctly
  const status = formData.get('status');
  if (!status) {
    // Get user role from localStorage
    const userRole = localStorage.getItem('user_role');
    // If student, set status to pending
    if (userRole === 'student') {
      formData.set('status', 'pending');
      console.log('Setting missing status to pending for student');
    } else {
      formData.set('status', 'approved');
      console.log('Setting missing status to approved for non-student');
    }
  }
  
  console.log('Final resource upload status:', formData.get('status'));
  
  try {
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
    
    const result = await response.json();
    console.log('Resource upload successful, server response:', result);
    return result;
  } catch (error) {
    console.error('Resource upload failed:', error);
    throw error;
  }
}