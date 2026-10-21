import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { transcribeAudio, getStudyAdvice } from './src/server/geminiService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// API endpoints
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'Missing audioBase64 payload' });
    }
    const text = await transcribeAudio(audioBase64, mimeType);
    return res.json({ text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error transcribing audio';
    return res.status(500).json({ error: message });
  }
});

app.post('/api/study-advisor', async (req, res) => {
  try {
    const { query, contextSummary } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Missing query payload' });
    }
    const advice = await getStudyAdvice(query, contextSummary);
    return res.json({ advice });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error generating advice';
    return res.status(500).json({ error: message });
  }
});

// Serve frontend static files
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
