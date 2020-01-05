export async function http(endpoint, options) {
  const API_URL = 'http://localhost:9001/api';
  const JWT_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMGQyMDJlYmI3MzExM2U4OWUzMDdhMCIsImlhdCI6MTU3ODAwMDc3OSwiZXhwIjoxNTg2NjQwNzc5fQ.u9UrPhgwmsfvEdCeI0_sk-gT_IiPadyb8bHc0h0Wgts';

  const headers = {
    headers: {
      authorization: `Bearer ${JWT_TOKEN}`,
    },
  };

  const res = await fetch(`${API_URL}/events`, {
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
