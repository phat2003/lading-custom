# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Vite nhúng biến VITE_* vào bundle NGAY LÚC BUILD, không đọc được lúc chạy container.
# Vì vậy phải truyền vào dạng build arg; đặt env ở runtime sẽ không có tác dụng.
# Giá trị mặc định chỉ dùng cho dev trên máy cá nhân — khi deploy thật BẮT BUỘC
# truyền domain API thật, nếu không bundle sẽ trỏ về localhost của người dùng cuối.
ARG VITE_API_BASE_URL=http://localhost:8080/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ---- Run stage ----
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
