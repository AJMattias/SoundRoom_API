import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('Login attempt:', req.body);
    
    // Respuesta temporal
    res.json({ 
      success: true, 
      message: 'Login endpoint funciona!',
      body: req.body 
    });
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}