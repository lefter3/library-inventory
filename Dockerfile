FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# COPY .env ./

RUN npm run build

RUN npx prisma generate

RUN npx prisma migrate dev --name init
# RUN npx prisma db seed

EXPOSE 3000

USER node

CMD ["sh", "-c", "node", "dist/index.js"]
