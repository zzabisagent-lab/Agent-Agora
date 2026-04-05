const CSRF_COOKIE_NAME = 'agora_csrf';

export function getCsrfToken() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const STATE_CHANGING_METHODS = new Set(['post', 'patch', 'put', 'delete']);

export function shouldAttachCsrf(method) {
  return STATE_CHANGING_METHODS.has(method.toLowerCase());
}
