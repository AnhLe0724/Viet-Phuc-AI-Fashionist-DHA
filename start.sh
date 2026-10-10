#!/bin/bash
set -e

echo "[Startup] Khởi động Python CLIP microservice trên cổng ${CLIP_PORT:-5005}..."
python server/clip_service.py &
CLIP_PID=$!

echo "[Startup] Đang chờ CLIP service sẵn sàng..."
python -c '
import time, urllib.request, os
port = os.environ.get("CLIP_PORT", "5005")
url = f"http://127.0.0.1:{port}/health"
for i in range(60):
    try:
        resp = urllib.request.urlopen(url, timeout=1)
        if resp.status == 200:
            print("[Startup] CLIP microservice đã sẵn sàng!")
            break
    except Exception:
        time.sleep(1)
'

echo "[Startup] Khởi động Node.js Express Server trên cổng ${PORT:-7860}..."
exec node server/index.js
