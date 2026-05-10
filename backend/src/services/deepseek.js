const axios = require('axios');

const client = axios.create({
  baseURL: 'https://api.deepseek.com/v1',
  headers: {
    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

async function chat(messages, options = {}) {
  const response = await client.post('/chat/completions', {
    model: 'deepseek-chat',
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 2000,
    ...options,
  });
  return response.data.choices[0].message.content;
}

module.exports = { chat };
