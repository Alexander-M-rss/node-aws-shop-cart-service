FROM node:18-alpine3.14 as base
WORKDIR /app

FROM base AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install \
  && npm cache clean --force

FROM dependencies as build
WORKDIR /app
COPY . .
RUN npm run build

FROM node:18-alpine3.14 as prod
WORKDIR /app
COPY --from=dependencies /app/package*.json ./
RUN npm install --only=production \
  && npm cache clean --force
COPY --from=build /app/dist ./dist
# uncomment next line if build locally and .env is used
# COPY --from=build /app/.env ./
ENV PORT=80
EXPOSE 80
CMD ["node", "./dist/main"]
