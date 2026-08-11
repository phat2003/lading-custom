# ---- Build stage ----
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server ./cmd/api

# ---- Run stage ----
# Dùng Debian slim thay vì Alpine: cần cài wkhtmltopdf bản Qt đã vá (patched)
# để render HTML -> PDF chạy headless (không cần X server). Bản này chỉ có cho Debian.
FROM debian:bookworm-slim

# Cài wkhtmltopdf (bản chính thức có Qt đã vá) và các thư viện phụ thuộc.
# Lưu ý: gói .deb dưới đây build cho kiến trúc amd64.
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates \
      fontconfig \
      libjpeg62-turbo \
      libx11-6 \
      libxcb1 \
      libxext6 \
      libxrender1 \
      xfonts-75dpi \
      xfonts-base \
      wget \
 && wget -q https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1-3/wkhtmltox_0.12.6.1-3.bookworm_amd64.deb \
 && apt-get install -y --no-install-recommends ./wkhtmltox_0.12.6.1-3.bookworm_amd64.deb \
 && rm wkhtmltox_0.12.6.1-3.bookworm_amd64.deb \
 && apt-get purge -y --auto-remove wget \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
