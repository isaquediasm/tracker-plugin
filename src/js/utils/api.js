export async function http(endpoint, options) {
  const API_URL = 'http://localhost:9001/api';
  const JWT_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTYxNTIwMGQxOTUxMWM3MGE4Mzg5MCIsImlhdCI6MTU3OTQ1MzIyOCwiZXhwIjoxNTg4MDkzMjI4fQ.C7sEkB0TKquIV8zJLhULshanlmNDnOG1nWK7ypujKSM';

  const headers = {
    headers: {
      authorization: `Bearer ${JWT_TOKEN}`,
    },
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    ...headers,
  });

  if (res) return await res.json();
}

export async function sendEvent({ name, rules, value }) {
  const res = await fetch(`${API_URL}/events`, {
    method: 'POST',
    body: JSON.stringify({
      name,
      rules,
      value,
    }),
    ...headers,
  });

  console.log(res);
}
