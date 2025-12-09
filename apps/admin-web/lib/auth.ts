export function checkAuth(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('admin_token');
  return !!token;
}

export function redirectToLogin() {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
