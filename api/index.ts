import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.json({ 
    message: "✅ API funcionando!",
    endpoint: "Usa POST /api/auth para login",
    timestamp: new Date().toISOString()
  });
}