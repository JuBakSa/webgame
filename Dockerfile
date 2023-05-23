FROM node:20.1.0

COPY ./ ./

RUN npm install

CMD ["node","index.js"]