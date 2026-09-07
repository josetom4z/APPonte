# Arquitetura Técnica — APPonte

## 1. Visão Arquitetural

A plataforma **APPonte** segue uma arquitetura moderna orientada a serviços com separação total entre cliente (SPA) e servidor (API RESTful):

```
+-------------------------------------------------------------+
|                      Cliente (Navegador)                     |
|  React 18 + TypeScript + Vite + Tailwind CSS + Leaflet Maps |
+-------------------------------------------------------------+
                              | (HTTPS / REST API)
                              v
+-------------------------------------------------------------+
|                     Nginx Reverse Proxy                      |
|   Roteamento: /api -> Backend:3000 | / -> Frontend:80       |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                  Backend API (NestJS 10)                     |
|   - Multi-tenant Context Guard & Middleware                 |
|   - Passport JWT & Refresh Token Rotation Subsystem         |
|   - GeoJSON 2dsphere Spatial Query Engine                   |
|   - Modular Controllers, Services & Mongoose Repositories   |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                     MongoDB 7.0 (Cluster)                    |
|   - Índices Compostos & Índices Geoespaciais (2dsphere)     |
|   - Coleções: users, tenants, departments, requests, ads...  |
+-------------------------------------------------------------+
```

---

## 2. Padrão Multi-tenancy

O sistema adota o modelo **Shared Database, Shared Schema com Isolamento Lógico (Discriminator via `tenantId`)**:
- Todas as solicitações, secretarias, categorias e anúncios são associados a um `tenantId`.
- Requisições autenticadas de atuantes e secretários são verificadas pelo `TenantGuard` para assegurar que servidores municipais acessem unicamente os registros de sua prefeitura.
- Cidadãos possuem flexibilidade para interagir com múltiplas cidades (ex: morar em uma cidade e trabalhar em outra).

---

## 3. Geoespacialidade (OpenStreetMap & MongoDB 2dsphere)

- Coordenadas geográficas são armazenadas no padrão **GeoJSON Point `[longitude, latitude]`**.
- O índice `RequestSchema.index({ location: '2dsphere' })` viabiliza consultas espaciais ultrarrápidas utilizando `$nearSphere` e filtragem por raio de distância em quilômetros.
- No Front-end, o **Leaflet** renderiza marcadores com base no status da ocorrência (*Pendente = Âmbar, Em Análise = Índigo, Em Atendimento = Azul, Resolvida = Esmeralda*) com animação pulsante para chamados urgentes.

---

## 4. Segurança e Auditoria

- **Hash de Senha**: `bcryptjs` com 10 salt rounds.
- **Autenticação Dupla**: Access Token (expiração curta) + Refresh Token com rotação atômica no banco.
- **Proteção de Cabeçalhos**: `helmet` ativado para proteção contra MIME sniffing, clickjacking e XSS.
- **Rate Limiting**: `@nestjs/throttler` configurado para 120 requisições/minuto.
- **Trilhas de Auditoria**: Entidade `AuditLog` armazena `action`, `module`, `userId`, `ipAddress` e alterações estruturadas.
