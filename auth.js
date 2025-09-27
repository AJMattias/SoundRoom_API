// auth.js - en la raíz del proyecto
module.exports = (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'POST') {
    console.log('Auth request body:', req.body);
    res.json({ 
      success: true, 
      message: 'Auth funciona!',
      body: req.body 
    });
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
};