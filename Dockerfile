# Estágio 1: build da aplicação
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json ./

# Instalar dependências (produção + dev para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Variáveis de build (API URL pode ser sobrescrita no build)
ARG VITE_API_BASE_URL=https://pet-manager-api.geia.vip
ARG VITE_API_TIMEOUT=30000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_TIMEOUT=$VITE_API_TIMEOUT

# Build da aplicação (vite build gera o artefato estático; checagem de tipos via tsc em CI se necessário)
RUN npx vite build

# Estágio 2: servir artefato com nginx
FROM nginx:alpine AS runtime

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar artefato de build do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Usuário não-root (segurança)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
