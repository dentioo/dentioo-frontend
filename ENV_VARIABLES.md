# 📋 Variáveis de Ambiente - Dentioo

Este documento lista todas as variáveis de ambiente necessárias para o frontend e backend.

---

## 🎨 FRONTEND (Netlify)

### Obrigatórias

| Variável | Descrição | Exemplo | Observação |
|----------|-----------|---------|------------|
| `NEXT_PUBLIC_API_URL` | URL base da API do backend | `https://seu-backend.railway.app` ou `https://api.dentioo.com` | **Deve começar com `NEXT_PUBLIC_`** para estar disponível no cliente |

### Configuração no Netlify

1. Acesse: **Site settings → Environment variables**
2. Clique em **Add environment variable**
3. Adicione:

```
Key: NEXT_PUBLIC_API_URL
Value: https://seu-backend.railway.app
```

**⚠️ IMPORTANTE:**
- Todas as variáveis que começam com `NEXT_PUBLIC_` são expostas ao cliente (navegador)
- Não coloque valores sensíveis (senhas, tokens secretos) em variáveis `NEXT_PUBLIC_*`
- A URL deve ser HTTPS em produção
- Após adicionar, faça um novo deploy para aplicar as mudanças

---

## 🔧 BACKEND (Railway)

### Obrigatórias

| Variável | Descrição | Exemplo | Como Obter |
|----------|-----------|---------|------------|
| `DATABASE_URL` | String de conexão do PostgreSQL | `postgresql://user:pass@host:5432/dbname` | Do serviço de banco (Railway/Supabase) |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT | Gere uma string aleatória forte | Use: `openssl rand -base64 32` |

### Configuração da Aplicação

| Variável | Descrição | Valor Padrão | Obrigatória |
|----------|-----------|--------------|-------------|
| `NODE_ENV` | Ambiente de execução | `development` | Não (automaticamente `production` no Railway) |
| `PORT` | Porta do servidor | `3001` | Não (Railway define automaticamente) |
| `FRONTEND_URL` | URL do frontend para CORS | `http://localhost:3000` | **Sim** (deve ser a URL do Netlify) |
| `JWT_EXPIRE` | Tempo de expiração do token JWT | `7d` | Não |
| `BCRYPT_ROUNDS` | Rodadas de hash para senhas | `10` | Não |

### Google OAuth (Login com Google) - Opcional

| Variável | Descrição | Como Obter |
|----------|-----------|------------|
| `GOOGLE_CLIENT_ID` | ID do cliente OAuth do Google | [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_CLIENT_SECRET` | Segredo do cliente OAuth | [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_AUTH_REDIRECT_URI` | URI de redirecionamento para autenticação | `https://seu-frontend.netlify.app/auth/google/callback` |

### Google Drive (Armazenamento de Arquivos) - Opcional

| Variável | Descrição | Como Obter |
|----------|-----------|------------|
| `GOOGLE_REDIRECT_URI` | URI de redirecionamento para Drive | `https://seu-frontend.netlify.app/dashboard/arquivos?google_auth=callback` |
| `GOOGLE_ACCESS_TOKEN` | Token de acesso do Google Drive | Obtido após autenticação |
| `GOOGLE_REFRESH_TOKEN` | Token de refresh do Google Drive | Obtido após autenticação |
| `GOOGLE_DRIVE_FOLDER_ID` | ID da pasta no Google Drive | Criar pasta e copiar ID da URL |

### Supabase (Armazenamento de Arquivos Alternativo) - Opcional

| Variável | Descrição | Como Obter |
|----------|-----------|------------|
| `SUPABASE_URL` | URL do projeto Supabase | [Supabase Dashboard](https://app.supabase.com/) |
| `SUPABASE_ANON_KEY` | Chave pública do Supabase | [Supabase Dashboard](https://app.supabase.com/) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave privada do Supabase | [Supabase Dashboard](https://app.supabase.com/) |

---

## 📝 Exemplo de Configuração

### Frontend (.env.local - Desenvolvimento)

```env
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Frontend (Netlify - Produção)

```
NEXT_PUBLIC_API_URL=https://dentioo-backend.railway.app
```

### Backend (.env - Desenvolvimento)

```env
# Ambiente
NODE_ENV=development
PORT=3001

# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/dentioo

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# Google OAuth (Opcional)
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
GOOGLE_AUTH_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Google Drive (Opcional)
GOOGLE_REDIRECT_URI=http://localhost:3000/dashboard/arquivos?google_auth=callback
GOOGLE_ACCESS_TOKEN=
GOOGLE_REFRESH_TOKEN=
GOOGLE_DRIVE_FOLDER_ID=

# Supabase (Opcional)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

### Backend (Railway - Produção)

```
NODE_ENV=production
DATABASE_URL=<URL do PostgreSQL no Railway>
JWT_SECRET=<Gere uma chave forte>
FRONTEND_URL=https://dentioo.netlify.app
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10

# Se usar Google OAuth
GOOGLE_CLIENT_ID=<seu_client_id>
GOOGLE_CLIENT_SECRET=<seu_client_secret>
GOOGLE_AUTH_REDIRECT_URI=https://dentioo.netlify.app/auth/google/callback

# Se usar Google Drive
GOOGLE_REDIRECT_URI=https://dentioo.netlify.app/dashboard/arquivos?google_auth=callback

# Se usar Supabase
SUPABASE_URL=<sua_url>
SUPABASE_ANON_KEY=<sua_chave>
SUPABASE_SERVICE_ROLE_KEY=<sua_chave>
```

---

## 🔐 Segurança

### ✅ Boas Práticas

1. **Nunca commite arquivos `.env` ou `.env.local` no Git**
2. **Use valores diferentes para desenvolvimento e produção**
3. **Gere `JWT_SECRET` forte**: Use `openssl rand -base64 32`
4. **Rotacione chaves regularmente em produção**
5. **Use HTTPS sempre em produção**

### ❌ Não faça

1. ❌ Compartilhar variáveis sensíveis publicamente
2. ❌ Usar valores padrão fracos em produção
3. ❌ Expor `JWT_SECRET` ou outras chaves no frontend
4. ❌ Usar `NEXT_PUBLIC_*` para dados sensíveis

---

## 🚀 Como Configurar no Railway (Backend)

1. Acesse seu projeto no [Railway](https://railway.app)
2. Clique em **Variables**
3. Adicione cada variável:
   - Clique em **New Variable**
   - Digite o **Nome** e **Valor**
   - Clique em **Add**

## 🚀 Como Configurar no Netlify (Frontend)

1. Acesse seu site no [Netlify](https://app.netlify.com)
2. Vá em **Site settings → Environment variables**
3. Clique em **Add environment variable**
4. Adicione:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: URL do seu backend (ex: `https://seu-backend.railway.app`)
5. Clique em **Save**
6. Faça um novo **Deploy** para aplicar as mudanças

---

## 🔍 Verificação

### Frontend
Após configurar, você pode verificar no console do navegador:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
```

### Backend
O backend valida variáveis obrigatórias ao iniciar. Se faltar algo, você verá um erro.

---

## 📞 Suporte

Se encontrar problemas com variáveis de ambiente:
1. Verifique se o nome está correto (case-sensitive)
2. Verifique se não há espaços extras
3. Reinicie o servidor após mudanças
4. Verifique os logs de erro

