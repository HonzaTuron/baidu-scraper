FROM apify/actor-node-playwright-chrome:16

RUN npm -v
COPY . .

RUN npm i
RUN npm run build
