FROM node:24.12.0-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma


FROM base AS development

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]


FROM base AS build

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build


FROM node:24.12.0-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma

RUN npm install --omit=dev

RUN npx prisma generate

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["npm", "run", "start:prod"]