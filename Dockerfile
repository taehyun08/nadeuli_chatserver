FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g pm2

COPY . .

EXPOSE 3001

CMD ["pm2-runtime", "app.js"]
