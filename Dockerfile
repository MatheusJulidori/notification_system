FROM node:23-alpine

# Install tini for proper signal handling
RUN apk add --no-cache tini

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 4001 9229

# Use tini as init system to properly forward signals
ENTRYPOINT ["/sbin/tini", "--"]

CMD ["npm", "run", "start:debug"]