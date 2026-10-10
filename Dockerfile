# Base Image: Python 3.10 + Node.js 20 on Debian Slim
FROM nikolaik/python-nodejs:python3.10-nodejs20-slim

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt các gói hệ thống cần thiết
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Cài đặt thư viện Python (PyTorch CPU tối ưu dung lượng)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Cài đặt thư viện Node.js
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Build ứng dụng Vite React ra thư mục dist/
RUN npm run build

# Cấp quyền thực thi cho file khởi động
RUN chmod +x start.sh

# Cổng mặc định của Hugging Face Spaces là 7860
EXPOSE 7860

# Thiết lập biến môi trường
ENV PORT=7860
ENV NODE_ENV=production
ENV CLIP_PORT=5005
ENV PYTHONUNBUFFERED=1

# Lệnh khởi động
CMD ["./start.sh"]
