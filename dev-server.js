// dev-server.js - Servidor local para desenvolvimento
const app = require('./server');
const { execSync } = require('child_process');

const PORT = process.env.PORT || 3001;

// Verificar se a porta está ocupada antes de tentar iniciar
function checkPort(port) {
  try {
    const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8', stdio: 'pipe' });
    const pid = result.trim();
    if (pid) {
      return { occupied: true, pid };
    }
  } catch (err) {
    // Porta livre (lsof retorna erro quando não encontra processo)
    return { occupied: false };
  }
  return { occupied: false };
}

// Verificar porta antes de iniciar
const portCheck = checkPort(PORT);
if (portCheck.occupied) {
  console.error(`❌ Erro: Porta ${PORT} já está em uso pelo processo ${portCheck.pid}`);
  console.error(`💡 Solução: Execute um dos comandos abaixo:`);
  console.error(`   - kill -9 ${portCheck.pid}`);
  console.error(`   - ./parar-servidor.sh`);
  console.error(`   - lsof -ti:${PORT} | xargs kill -9`);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor de desenvolvimento rodando em http://localhost:${PORT}`);
  console.log(`📸 Admin disponível em: http://localhost:${PORT}/admin.html`);
  console.log(`📝 Confirmação disponível em: http://localhost:${PORT}/confirmacao.html`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Erro: Porta ${PORT} já está em uso`);
    console.error(`💡 Execute: lsof -ti:${PORT} | xargs kill -9`);
  } else {
    console.error('❌ Erro ao iniciar servidor:', err.message);
  }
  process.exit(1);
});
