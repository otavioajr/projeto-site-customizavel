// dev-server.js - Servidor local para desenvolvimento
const app = require('./server');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor de desenvolvimento rodando em http://localhost:${PORT}`);
  console.log(`📸 Admin disponível em: http://localhost:${PORT}/admin.html`);
  console.log(`📝 Confirmação disponível em: http://localhost:${PORT}/confirmacao.html`);
});
