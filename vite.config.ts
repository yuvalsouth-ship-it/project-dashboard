import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function apiExtractTasks(): Plugin {
  let envApiKey: string | undefined;
  return {
    name: 'api-extract-tasks',
    configureServer(server) {
      // Load env vars from .env.local
      const env = loadEnv('development', process.cwd(), '');
      envApiKey = env.VITE_ANTHROPIC_API_KEY;

      server.middlewares.use('/api/extract-tasks', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end();
          return;
        }
        const chunks: Buffer[] = [];
        req.on('data', (c: Buffer) => chunks.push(c));
        req.on('end', async () => {
          try {
            const { text, prompt } = JSON.parse(Buffer.concat(chunks).toString());
            const apiKey = envApiKey;
            if (!apiKey) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'VITE_ANTHROPIC_API_KEY not set in .env.local' }));
              return;
            }
            const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 4096,
                messages: [{ role: 'user', content: prompt + '\n\nDocument text:\n' + text }],
              }),
            });
            const data = await response.json();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(e) }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiExtractTasks()],
})
