// Authentication utility functions

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

export const getUserRole = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.role;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

export const getUserData = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      return JSON.parse(user);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

export const hasPermission = (requiredRole) => {
  const userRole = getUserRole();
  if (!userRole) return false;
  
  const roleHierarchy = {
    'SUPER_ADMIN': 4,
    'ADMIN': 3,
    'EMPLOYEE': 2,
    'FARMER': 1
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}; 