# RifaOnline 🎟️

Plataforma para criação e gestão de rifas online com sorteio automático via Loteria Federal.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend + API | Next.js 15 (App Router) |
| Banco de dados + Auth | Supabase |
| E-mail | Resend |
| Hospedagem | Vercel |
| Sorteio | API pública Loteria Federal |

---

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) (gratuito)
- Conta no [Resend](https://resend.com) (gratuito)
- Conta na [Vercel](https://vercel.com) (gratuito)

---

## Setup passo a passo

### 1. Clone e instale

```bash
git clone <seu-repo>
cd rifa-app
npm install
```

### 2. Configure o Supabase

1. Crie um novo projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor**, cole e execute o conteúdo de `supabase/schema.sql`
3. Vá em **Project Settings → API** e copie as três chaves abaixo

### 3. Configure o Resend

1. Crie conta em [resend.com](https://resend.com) e gere uma API Key
2. Em produção, verifique um domínio em **Domains** e atualize o campo `FROM` em `lib/email.ts`

### 4. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencha `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=string_aleatoria_segura
```

Para gerar o `CRON_SECRET`:
```bash
openssl rand -hex 32
```

### 5. Rode localmente

```bash
npm run dev
# Acesse http://localhost:3000
```

---

## Deploy na Vercel

1. Conecte o repositório na Vercel (ou use `vercel deploy`)
2. Configure todas as variáveis de ambiente no painel da Vercel
3. Troque `NEXT_PUBLIC_APP_URL` pela URL real do deploy
4. O arquivo `vercel.json` já configura os cron jobs automaticamente:

| Rota | Agenda | Função |
|---|---|---|
| `/api/cron/expirar` | A cada hora | Libera reservas não pagas após 48h |
| `/api/cron/sortear` | 22h toda qua e sáb | Sorteio automático via Loteria Federal |

> Os cron jobs exigem plano **Pro** na Vercel para execução automática.

---

## Estrutura

```
rifa-app/
├── app/
│   ├── (auth)/login e cadastro     # Auth com 2 etapas e validação CPF
│   ├── (dashboard)/dashboard/      # Painel, nova rifa, detalhe da rifa
│   ├── r/[slug]/                   # Página pública da rifa
│   └── api/                        # Reservar, confirmar pagamento, crons
├── components/                     # GradeNumeros, ConfirmarPagamento, etc.
├── lib/                            # Supabase, CPF, Loteria, Email, Utils
├── supabase/schema.sql             # Schema completo com RLS e triggers
├── middleware.ts                   # Guard de rotas autenticadas
└── vercel.json                     # Cron jobs
```

---

## Lógica do sorteio

1. Cron roda toda quarta e sábado às 22h
2. Busca rifas com `data_sorteio = hoje`
3. Consulta a API da Caixa Econômica
4. Número vencedor: `(2 últimos dígitos do 1º prêmio % quantidade) + 1`
5. Se o número não foi vendido, usa o número pago mais próximo
6. Notifica todos os participantes por e-mail

---

## Fluxo do participante

```
Acessa /r/[slug]
→ Escolhe número(s) na grade
→ Preenche nome, e-mail, telefone
→ Recebe e-mail com chave Pix e prazo 48h
→ Paga via Pix para o criador
→ Criador confirma no painel
→ Participante recebe confirmação por e-mail
→ Na data do sorteio → todos recebem resultado por e-mail
```

---

## Variáveis de ambiente

| Variável | Onde obter |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `RESEND_API_KEY` | Resend → API Keys |
| `NEXT_PUBLIC_APP_URL` | URL do seu deploy (sem barra no final) |
| `CRON_SECRET` | `openssl rand -hex 32` |

---

## Próximos passos sugeridos

- Verificação real de CPF via Serpro DataValid
- Cancelamento de rifa com notificação automática
- Notificações por WhatsApp (Z-API ou similar)
- Página de perfil do criador
- Analytics de vendas por rifa
