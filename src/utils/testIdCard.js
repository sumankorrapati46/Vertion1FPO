// Test script to manually generate ID card
// Run this in browser console or create a test button

export const testIdCardGeneration = async (farmerId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:8080/api/id-cards/generate/farmer/${farmerId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('ID Card generated successfully:', data);
      return data;
    } else {
      const error = await response.text();
      console.error('Failed to generate ID card:', error);
      return null;
    }
  } catch (error) {
    console.error('Error generating ID card:', error);
    return null;
  }
};

// Usage: testIdCardGeneration(1) // Replace 1 with your farmer ID
