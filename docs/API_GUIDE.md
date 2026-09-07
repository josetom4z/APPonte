# Guia de Endpoints da API REST — APPonte

Todos os endpoints utilizam o prefixo `/api`. A documentação interativa Swagger está disponível em `/api/docs`.

---

## 🔐 Autenticação (`/api/auth`)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Cadastro de nova conta de cidadão | Público |
| `POST` | `/api/auth/login` | Login com e-mail e senha | Público |
| `POST` | `/api/auth/refresh` | Renovação do Access Token via Refresh Token | Público |
| `POST` | `/api/auth/logout` | Encerramento de sessão | Autenticado |
| `POST` | `/api/auth/forgot-password` | Solicitação de recuperação de senha | Público |
| `POST` | `/api/auth/reset-password` | Redefinição com token | Público |
| `POST` | `/api/auth/change-password` | Troca de senha da conta ativa | Autenticado |
| `GET` | `/api/auth/me` | Obter dados do usuário logado | Autenticado |

---

## 📌 Solicitações Cidadãs (`/api/requests`)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/requests` | Listagem paginada do feed cívico | Público |
| `GET` | `/api/requests/map` | Consulta geoespacial para marcadores do mapa | Público |
| `GET` | `/api/requests/:id` | Detalhes por ID ou Protocolo | Público |
| `POST` | `/api/requests` | Criar nova solicitação com fotos e GPS | Autenticado (Cidadão) |
| `PATCH`| `/api/requests/:id/status` | Atualizar status com notas e evidências | Atuante / Secretário / Admin |
| `DELETE`| `/api/requests/:id` | Excluir / Cancelar chamado | Autor (se pendente) ou Admin |

---

## 💬 Comentários e Apoios

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/request-comments/by-request/:id` | Listar comentários | Público |
| `POST` | `/api/request-comments` | Adicionar comentário (público ou nota interna) | Autenticado |
| `POST` | `/api/request-supports/:id/toggle` | Apoiar / Remover apoio de uma solicitação | Autenticado |
| `GET` | `/api/request-supports/:id/status` | Checar se o usuário atual apoiou | Autenticado |

---

## 📢 Anúncios e SaaS (`/api/advertisements`)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/advertisements/serve` | Obter anúncios por posição (`FEED`, `SIDEBAR`, etc.) | Público |
| `POST` | `/api/advertisements/:id/click` | Rastrear clique e obter URL de destino | Público |
| `POST` | `/api/advertisements` | Criar nova campanha de anúncio | Admin / SuperAdmin |
| `GET` | `/api/advertisements` | Listar anúncios com métricas | Admin / SuperAdmin |

---

## 📊 Dashboards (`/api/dashboard`)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/public-stats` | Estatísticas públicas para a Landing Page | Público |
| `GET` | `/api/dashboard/citizen` | KPIs e resumo para o Cidadão | Cidadão |
| `GET` | `/api/dashboard/operator` | Fila de tarefas para o Atuante | Atuante / Secretário / Admin |
| `GET` | `/api/dashboard/secretary` | Indicadores de desempenho da secretaria | Secretário / Admin |
| `GET` | `/api/dashboard/admin` | Visão executiva municipal e multi-tenant | Admin / SuperAdmin |
