FROM node:12

WORKDIR /usr/src/app

ENV PATH /app/node_modules/.bin:$PATH

COPY package*.json ./

RUN npm install --silent
RUN npm install -g truffle@5.1.50 --silent

EXPOSE 5000

CMD ["/bin/sh", "./scripts/deploy.sh"]