// api/config.js - Serverless function para servir credenciais do Supabase
module.exports = (req, res) => {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/javascript');
  
  // Retornar credenciais do Supabase como JavaScript
  const config = `
window.SUPABASE_URL = '${process.env.SUPABASE_URL || ''}';
window.SUPABASE_ANON_KEY = '${process.env.SUPABASE_ANON_KEY || ''}';
  `.trim();
  
  res.status(200).send(config);
};
