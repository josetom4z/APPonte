# Guia de Deploy e Produção — APPonte

## 1. Arquitetura de Produção Docker

O deploy em ambiente de produção é orquestrado através do `docker-compose.prod.yml`:

```bash
# 1. Configurar variáveis de produção no arquivo .env
cp .env.example .env

# Edite o .env com chaves seguras:
# JWT_SECRET=<chave-secreta-forte>
# JWT_REFRESH_SECRET=<chave-refresh-forte>
# MONGO_ROOT_PASSWORD=<senha-segura-mongodb>

# 2. Executar build e subir contêineres em background
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Executar seed inicial de dados (se necessário)
docker exec -it apponte_backend_prod npm run seed

# 4. Checar logs dos serviços
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 2. Nginx e Certificados SSL / HTTPS

Para ativar SSL via Let's Encrypt / Certbot em produção:
1. Monte o volume de certificados em `/etc/letsencrypt` no `default.conf` do Nginx.
2. Adicione a diretiva `listen 443 ssl http2;` com os caminhos para `fullchain.pem` e `privkey.pem`.
3. Configure o redirecionamento automático de tráfego HTTP para HTTPS na porta 80.

---

## 3. Backups do MongoDB

Para realizar backup diário do volume do banco:
```bash
docker exec apponte_mongodb_prod mongodump --username admin --password secretpassword --authenticationDatabase admin --db apponte --out /data/db/backup_$(date +%Y%m%d)
```
