// api/config.js - Serverless function para servir credenciais do Supabase
module.exports = (req, res) => {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/javascript');

  // Verificar se as variáveis de ambiente estão configuradas
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  AVISO: Credenciais do Supabase não configuradas nas variáveis de ambiente');
  }

  // Retornar credenciais do Supabase como JavaScript
  const config = `
window.SUPABASE_URL = '${supabaseUrl}';
window.SUPABASE_ANON_KEY = '${supabaseKey}';
window.SUPABASE_SCHEMA = '${process.env.SUPABASE_SCHEMA || 'public'}';
window.NODE_ENV = '${process.env.NODE_ENV || 'development'}';
  `.trim();

  res.status(200).send(config);
};
