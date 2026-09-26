FROM node:24-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        openjdk-21-jdk \
        python3 \
        g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package*.json ./backend/

RUN cd backend && npm install

COPY backend ./backend
COPY nlp ./nlp

WORKDIR /app/backend

RUN java -version && javac -version && python3 --version && g++ --version

CMD ["node", "server.js"]