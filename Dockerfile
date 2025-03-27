FROM node:alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

CMD ["pm2", "start", "index.js"]