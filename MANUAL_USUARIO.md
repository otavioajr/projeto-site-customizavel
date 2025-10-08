# Manual do Usuário - Landing Page Aventuras

## 📖 Guia Completo para Gerenciar seu Site

Este manual ensina como usar o painel administrativo para editar todo o conteúdo do seu site sem precisar de conhecimento técnico.

---

## 🚀 Acesso ao Admin

### Como Acessar

1. Abra seu navegador (Chrome, Firefox, Safari, etc.)
2. Digite na barra de endereço: `seu-site.com/admin.html`
3. Digite a senha quando solicitado
4. Pronto! Você está no painel admin

### Senha Padrão
- **Senha**: `admin123`
- ⚠️ **IMPORTANTE**: Peça ao desenvolvedor para trocar esta senha!

---

## 🎨 Interface do Admin

O admin é dividido em 2 partes:

### Lado Esquerdo: Editor
Aqui você edita o conteúdo do site.

### Lado Direito: Preview
Mostra como o site ficará em tempo real.

### Abas Principais
1. **Home**: Editar conteúdo da página inicial
2. **Páginas**: Gerenciar páginas do menu
3. **Tema**: Mudar cores do site

---

## 🏠 Editando a Home

### 1. Hero (Topo da Página)

**O que é**: A primeira seção que os visitantes veem.

**Como editar**:
1. Clique na aba "Home"
2. Role até "Hero"
3. Edite os campos:
   - **Título**: Frase principal (ex: "Viva a aventura com segurança")
   - **Subtítulo**: Texto explicativo menor
   - **Texto do Botão**: O que aparece no botão (ex: "Agendar Agora")
   - **Link do Botão**: Para onde o botão leva (ex: `#contato` ou `https://wa.me/...`)
   - **URL da Imagem de Fundo**: Link da imagem de fundo

**Dica**: Use imagens de sites como Unsplash (https://unsplash.com) - são gratuitas!

### 2. Sobre

**O que é**: Seção que fala sobre você ou sua empresa.

**Como editar**:
1. Role até "Sobre"
2. Edite:
   - **Título**: Ex: "Sobre mim"
   - **Texto**: Sua história, experiência, missão
   - **URL da Imagem**: Foto sua ou da equipe

**Dica**: Textos entre 100-200 palavras funcionam melhor.

### 3. Serviços

**O que é**: Cards que mostram o que você oferece.

**Limite**: Máximo 3 serviços.

**Como adicionar**:
1. Clique em "+ Adicionar Serviço"
2. Preencha:
   - **Título**: Nome do serviço (ex: "Trilhas guiadas")
   - **Texto**: Descrição breve
   - **URL do Ícone**: Link de um ícone (opcional)

**Como remover**:
- Clique no "×" vermelho no canto do card

**Dica de ícones**: Use https://api.iconify.design/
- Exemplo: `https://api.iconify.design/mdi/hiking.svg?color=%230E7C7B&width=64`

### 4. Depoimentos

**O que é**: Comentários de clientes satisfeitos.

**Como adicionar**:
1. Clique em "+ Adicionar Depoimento"
2. Preencha:
   - **Nome**: Nome do cliente (ex: "Ana P.")
   - **Depoimento**: O que o cliente disse

**Como remover**:
- Clique no "×" vermelho

**Dica**: 2-3 depoimentos são ideais. Mantenha curtos e impactantes.

### 5. Galeria

**O que é**: Fotos das suas aventuras/trabalhos.

**Limite**: Máximo 6 imagens.

**Como adicionar**:
1. Clique em "+ Adicionar Imagem"
2. Cole a URL da imagem

**Como remover**:
- Clique no "×" vermelho

**Dica**: Use imagens de boa qualidade, mas não muito pesadas (máx. 500KB cada).

### 6. Contato

**O que é**: Informações para clientes entrarem em contato.

**Como editar**:
1. Role até "Contato"
2. Preencha:
   - **WhatsApp**: Link do WhatsApp (ex: `https://wa.me/5511999999999`)
   - **Email**: Seu email
   - **Instagram**: Link do Instagram
   - **Localização**: Cidade/Estado

**Dica WhatsApp**: Use o formato `https://wa.me/55` + DDD + número (sem espaços)

### 7. SEO (Otimização para Google)

**O que é**: Informações que aparecem no Google.

**Como editar**:
1. Role até "SEO"
2. Preencha:
   - **Título da Página**: O que aparece na aba do navegador
   - **Descrição**: Resumo do site (máx. 160 caracteres)

**Dica**: Use palavras-chave que seus clientes buscariam no Google.

### 8. Salvando Alterações

**IMPORTANTE**: Sempre salve após editar!

1. Role até o final
2. Clique em "💾 Salvar Home"
3. Aguarde a mensagem de sucesso

**Botões disponíveis**:
- **💾 Salvar Home**: Salva todas as alterações
- **↺ Reverter**: Desfaz alterações não salvas
- **📥 Exportar JSON**: Faz backup do conteúdo
- **📤 Importar JSON**: Restaura backup

---

## 📄 Gerenciando Páginas do Menu

### O que são Páginas?

São links que aparecem no menu do site. Cada página mostra um design do Canva.

### Como Adicionar uma Página

1. Clique na aba "Páginas"
2. Clique em "+ Nova Página"
3. Preencha o formulário:

#### Campos do Formulário

**Label (nome no menu)**
- O que aparece no menu
- Ex: "Roteiros", "Pacotes", "Galeria"

**Slug (URL)**
- É gerado automaticamente
- Ex: "roteiros" vira `/p/#roteiros`
- Pode editar se quiser

**URL do Canva (embed)**
- Link do seu design no Canva
- **IMPORTANTE**: Deve começar com `https://www.canva.com/`

**Como pegar a URL do Canva**:
1. Abra seu design no Canva
2. Clique em "Compartilhar"
3. Clique em "Mais" → "Incorporar"
4. Copie o link que aparece
5. Cole no campo "URL do Canva"

**Ordem**
- Define a posição no menu
- 1 = primeiro, 2 = segundo, etc.

**SEO - Título**
- Título da página para o Google
- Ex: "Roteiros de Aventura"

**SEO - Descrição**
- Descrição para o Google
- Ex: "Conheça nossos roteiros exclusivos"

**Página ativa**
- ✅ Marcado = aparece no menu
- ❌ Desmarcado = fica oculta

4. Clique em "💾 Salvar Página"

### Como Editar uma Página

1. Clique em "✏️ Editar" na página desejada
2. Faça as alterações
3. Clique em "💾 Salvar Página"

### Como Desativar uma Página

1. Clique no botão de toggle (interruptor) ao lado do nome
2. Verde = ativa | Cinza = inativa

### Como Excluir uma Página

1. Clique em "🗑️ Excluir"
2. Confirme a exclusão
3. **ATENÇÃO**: Não é possível desfazer!

### Como Visualizar uma Página

1. Clique em "👁️ Preview"
2. A página abre em nova aba

---

## 🎨 Mudando o Tema (Cores)

### Como Mudar as Cores

1. Clique na aba "Tema"
2. Clique em cada cor para abrir o seletor
3. Escolha a cor desejada
4. Veja o preview mudar em tempo real
5. Clique em "💾 Salvar Tema"

### Cores Disponíveis

**Primária**
- Cor principal do site
- Usada em: botões, títulos, links
- Padrão: Verde água (#0E7C7B)

**Secundária**
- Cor de destaque
- Usada em: badges, destaques
- Padrão: Laranja (#F4A261)

**Texto**
- Cor dos textos
- Padrão: Preto (#1B1B1B)

**Fundo**
- Cor de fundo do site
- Padrão: Branco gelo (#FAFAFA)

### Dicas de Cores

✅ **Boas práticas**:
- Use cores que contrastem bem
- Teste a legibilidade (texto deve ser fácil de ler)
- Mantenha consistência com sua marca

❌ **Evite**:
- Cores muito claras para texto
- Cores muito vibrantes para fundo
- Mudar cores com muita frequência

---

## 💾 Backup e Segurança

### Fazendo Backup

**Por que fazer backup?**
- Protege contra perda de dados
- Permite restaurar versão anterior
- Facilita migração de site

**Como fazer**:
1. Aba "Home"
2. Clique em "📥 Exportar JSON"
3. Arquivo será baixado
4. Guarde em local seguro (Google Drive, Dropbox, etc.)

**Frequência recomendada**: Toda vez que fizer mudanças importantes.

### Restaurando Backup

1. Aba "Home"
2. Clique em "📤 Importar JSON"
3. Selecione o arquivo de backup
4. Confirme a importação
5. **ATENÇÃO**: Isso substitui todo o conteúdo atual!

---

## 📱 Testando em Mobile

### Por que testar?

Mais de 60% dos visitantes acessam pelo celular!

### Como testar

**Opção 1: No próprio celular**
1. Abra o site no celular
2. Navegue por todas as seções
3. Teste os botões e links

**Opção 2: No computador (Chrome)**
1. Abra o site
2. Pressione F12
3. Clique no ícone de celular (canto superior esquerdo)
4. Escolha um dispositivo (iPhone, Samsung, etc.)

### O que verificar

- [ ] Menu hambúrguer funciona
- [ ] Imagens carregam
- [ ] Textos são legíveis
- [ ] Botões são clicáveis
- [ ] Formulários funcionam

---

## ❓ Perguntas Frequentes

### Como adiciono mais de 3 serviços?

**R**: O design foi otimizado para 3 serviços. Se precisar de mais, considere criar uma página separada "Serviços" com um design do Canva.

### Como adiciono mais de 6 imagens na galeria?

**R**: Limite de 6 para manter o site rápido. Crie uma página "Galeria Completa" no Canva para mais fotos.

### Posso usar minhas próprias imagens?

**R**: Sim! Você precisa:
1. Hospedar a imagem online (Canva, Google Drive público, Cloudinary)
2. Copiar o link público
3. Colar no campo de URL

### Como faço para a imagem aparecer no Google Drive?

1. Faça upload no Google Drive
2. Clique com botão direito → "Compartilhar"
3. Mude para "Qualquer pessoa com o link"
4. Copie o link
5. **IMPORTANTE**: Mude o final do link:
   - De: `https://drive.google.com/file/d/ID/view?usp=sharing`
   - Para: `https://drive.google.com/uc?id=ID`

### O preview não está atualizando

**Soluções**:
1. Recarregue a página do admin (F5)
2. Limpe o cache do navegador
3. Tente em modo anônimo

### Esqueci a senha do admin

**R**: Entre em contato com o desenvolvedor para resetar.

### Posso ter mais de um admin?

**R**: Na versão atual (MVP), não. Na versão com Supabase, sim.

### Como adiciono vídeos?

**R**: Crie uma página no Canva com vídeos incorporados e adicione como página do menu.

### O site está lento

**Possíveis causas**:
1. Imagens muito pesadas (comprima em https://tinypng.com)
2. Muitas imagens na galeria
3. Conexão de internet lenta

### Como mudo o logo?

**R**: Atualmente o logo é texto ("Aventuras"). Para logo customizado, peça ao desenvolvedor.

---

## 🆘 Suporte

### Antes de Pedir Ajuda

1. ✅ Recarregue a página (F5)
2. ✅ Limpe o cache do navegador
3. ✅ Tente em modo anônimo
4. ✅ Teste em outro navegador
5. ✅ Verifique se salvou as alterações

### Informações Úteis para Suporte

Ao pedir ajuda, informe:
- Navegador usado (Chrome, Firefox, etc.)
- Sistema operacional (Windows, Mac, etc.)
- O que estava fazendo quando o problema ocorreu
- Mensagem de erro (se houver)
- Print da tela

---

## ✅ Checklist de Manutenção

### Semanal
- [ ] Verificar se site está no ar
- [ ] Testar links importantes
- [ ] Responder mensagens de contato

### Mensal
- [ ] Fazer backup do conteúdo
- [ ] Atualizar depoimentos (se houver novos)
- [ ] Adicionar fotos novas na galeria
- [ ] Verificar se informações de contato estão corretas

### Trimestral
- [ ] Revisar todo o conteúdo
- [ ] Atualizar textos se necessário
- [ ] Verificar se links externos ainda funcionam
- [ ] Considerar mudanças de design/cores

---

## 🎓 Dicas de Boas Práticas

### Conteúdo

✅ **Faça**:
- Mantenha textos curtos e diretos
- Use imagens de alta qualidade
- Atualize conteúdo regularmente
- Teste tudo antes de publicar
- Peça feedback de amigos/clientes

❌ **Evite**:
- Textos muito longos
- Imagens pixeladas ou borradas
- Informações desatualizadas
- Mudar tudo de uma vez
- Publicar sem testar

### Design

✅ **Faça**:
- Mantenha consistência visual
- Use espaçamento adequado
- Priorize legibilidade
- Teste em diferentes dispositivos

❌ **Evite**:
- Muitas cores diferentes
- Fontes difíceis de ler
- Elementos muito próximos
- Ignorar versão mobile

---

## 🎉 Parabéns!

Você agora sabe gerenciar seu site completamente!

Lembre-se:
- 💾 Sempre salve as alterações
- 📱 Teste em mobile
- 💾 Faça backups regulares
- 🆘 Peça ajuda quando precisar

**Seu site, suas regras!** 🚀
