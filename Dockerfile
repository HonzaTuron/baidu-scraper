FROM apify/actor-node-playwright-chrome:16

RUN npm -v
COPY . .

RUN npm i
RUN npx playwright install
RUN npm run build
