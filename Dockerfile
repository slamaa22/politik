FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ffmpeg \
    wget \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN pip3 install --no-cache-dir --break-system-packages faster-whisper

ENV HF_HOME=/app/.cache/huggingface
ENV WHISPER_MODEL=small
ENV WHISPER_THREADS=8

RUN python3 -c 'from faster_whisper import WhisperModel; WhisperModel("small", device="cpu", compute_type="int8")'

WORKDIR /app

COPY package.json ./
COPY server.mjs ./
COPY transcribe_worker.py ./
COPY public ./public

RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3456

EXPOSE 3456

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3456/api/health || exit 1

CMD ["node", "server.mjs"]
