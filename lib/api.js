// lib/api.js
// Portfolio Demo Mode: Handles API calls gracefully without requiring a live production backend.

const BASE_URL = process.env.NEXT_PUBLIC_BASEURL || 'http://localhost:8000/api/v1';

export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    const key = isAdminRoute ? 'imp_admin_access_token' : 'imp_access_token';
    return localStorage.getItem(key) || localStorage.getItem('imp_access_token');
  }
  return null;
};

function buildUrl(endpoint) {
  const [pathPart, queryPart] = endpoint.split('?');
  const cleanPath = pathPart.replace(/^\/+|\/+$/g, '');
  return `${BASE_URL}/${cleanPath}/${queryPart ? `?${queryPart}` : ''}`;
}

// Mock data generator for Portfolio Demo Mode so recruiters see populated UI screens
function getMockResponse(endpoint) {
  if (endpoint.includes('/members/') && !endpoint.includes('/tasks') && !endpoint.includes('/earnings')) {
    return {
      results: [
        { uuid: 'm-1', username: 'eliska_j', full_name: 'Eliska Jones', email: 'eliska@demo.io', phone_number: '+60 12-345 6789', joined: '2026-01-12', status: 1 },
        { uuid: 'm-2', username: 'sofia_liu', full_name: 'Sofia Liu', email: 'sofia@demo.io', phone_number: '+60 17-987 6543', joined: '2026-02-05', status: 1 },
        { uuid: 'm-3', username: 'ethan_w', full_name: 'Ethan Wong', email: 'ethan@demo.io', phone_number: '+60 11-223 3445', joined: '2026-03-18', status: 2 },
      ],
    };
  }
  if (endpoint.includes('/notifications')) {
    return { results: [], unread_count: 2 };
  }
  if (endpoint.includes('/banners')) {
    return [];
  }
  if (endpoint.includes('/tasks/today')) {
    return [
      {
        uuid: 'task-demo-1',
        member_job_uuid: 'mj-demo-1',
        job_title: 'Summer Lifestyle & Tech Campaign',
        org: 'PostDesk Studio',
        content_type: 1,
        platform: 1,
        quantity: 1,
        status: 1,
      },
    ];
  }
  return { results: [], status: 'ok' };
}

export async function apiFetch(endpoint, options = {}) {
  const token = getAccessToken();

  // If running in Portfolio Demo Mode, return clean mock data without network failure
  if (token && token.startsWith('dev_mock')) {
    await new Promise((res) => setTimeout(res, 150)); // realistic subtle delay
    return getMockResponse(endpoint);
  }

  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(buildUrl(endpoint), {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw { status: response.status, ...data };
    }

    return data;
  } catch (err) {
    // Fallback to mock response if backend is unreachable on Vercel
    return getMockResponse(endpoint);
  }
}