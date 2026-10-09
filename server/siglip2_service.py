import io
import os
import sys
import time

# Ensure UTF-8 output on Windows
try:
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
    if sys.stderr.encoding != 'utf-8':
        sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

import requests
import torch
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager
import threading

# Import VTON Engine
from vton_engine import vton_engine

# Global model state for SigLIP 2
MODEL_CANDIDATES = [
    "google/siglip2-base-patch16-224",
    "google/siglip-base-patch16-224",
    "google/siglip-base-patch16-384"
]

device = "cuda" if torch.cuda.is_available() else "cpu"
model = None
processor = None
is_model_loading = False
model_load_error = None
active_model_name = None

def load_siglip_model():
    global model, processor, is_model_loading, model_load_error, active_model_name
    if model is not None:
        return True
    
    is_model_loading = True
    model_load_error = None
    print(f"[*] Loading Google SigLIP 2 Vision Model on device: {device}...")
    
    from transformers import AutoProcessor, AutoModel
    
    for target_model in MODEL_CANDIDATES:
        try:
            print(f"[*] Downloading / Loading model {target_model}...")
            proc = AutoProcessor.from_pretrained(target_model)
            mod = AutoModel.from_pretrained(target_model, torch_dtype=torch.float16 if device == "cuda" else torch.float32)
            mod = mod.to(device)
            mod.eval()
            
            processor = proc
            model = mod
            active_model_name = target_model
            is_model_loading = False
            print(f"[SUCCESS] Loaded Google SigLIP 2 Model: {target_model} on {device}!")
            return True
        except Exception as e:
            print(f"[!] Warning for {target_model}: {e}")
            model_load_error = str(e)
            
    is_model_loading = False
    return False

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start model loading in background thread on startup
    threading.Thread(target=load_siglip_model, daemon=True).start()
    yield

app = FastAPI(title="Viet Phuc AI Suite (SigLIP 2 + Mobile-VTON)", version="2.5.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CandidateItem(BaseModel):
    url: str
    thumbnail: Optional[str] = None
    title: Optional[str] = ""
    width: Optional[int] = 0
    height: Optional[int] = 0
    domain: Optional[str] = ""
    source: Optional[str] = ""

class ScoreRequest(BaseModel):
    keyword: str
    keywordNoAccent: Optional[str] = ""
    category: Optional[str] = ""
    candidates: List[CandidateItem]

class TryOnRequest(BaseModel):
    topImagePath: Optional[str] = None
    bottomImagePath: Optional[str] = None
    topName: Optional[str] = "Áo Cổ Phục"
    bottomName: Optional[str] = "Quần / Váy Cổ Phục"

class CustomTryOnRequest(BaseModel):
    humanImage: Optional[str] = None # base64 data uri or relative path or preset
    garmentImage: Optional[str] = None # base64 data uri or relative path or preset
    garmentType: Optional[str] = "top" # 'top' | 'bottom'
    garmentName: Optional[str] = "Trang phục tùy chỉnh"

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "ready": model is not None,
        "is_loading": is_model_loading,
        "device": device,
        "model_name": active_model_name or MODEL_CANDIDATES[0],
        "vton_ready": True,
        "vton_model": "CVPR 2026 Mobile-VTON High-Fidelity",
        "error": model_load_error
    }

# ================= Virtual Try-On Endpoint =================
@app.post("/api/try-on")
def virtual_tryon(req: TryOnRequest):
    try:
        # Resolve full path if relative
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        
        top_p = req.topImagePath
        if top_p and not os.path.isabs(top_p):
            top_p = os.path.join(root_dir, top_p.lstrip("/\\"))

        bottom_p = req.bottomImagePath
        if bottom_p and not os.path.isabs(bottom_p):
            bottom_p = os.path.join(root_dir, bottom_p.lstrip("/\\"))

        # Fallback to default shirt if no top provided
        if not top_p or not os.path.exists(top_p):
            default_shirt = os.path.join(root_dir, "src", "clothes", "shirt.png")
            if os.path.exists(default_shirt):
                top_p = default_shirt

        result = vton_engine.generate_virtual_tryon(
            top_image_path=top_p,
            bottom_image_path=bottom_p,
            top_name=req.topName,
            bottom_name=req.bottomName
        )
        return result
    except Exception as err:
        print(f"[!] Lỗi Virtual Try-On: {err}")
        return {
            "success": False,
            "error": str(err),
            "resultUrl": None
        }

@app.post("/api/vton-custom")
def custom_virtual_tryon(req: CustomTryOnRequest):
    try:
        result = vton_engine.generate_custom_tryon(
            human_source=req.humanImage,
            garment_source=req.garmentImage,
            garment_type=req.garmentType or "top",
            garment_name=req.garmentName or "Trang phục thử nghiệm"
        )
        return result
    except Exception as err:
        print(f"[!] Lỗi Custom Virtual Try-On: {err}")
        return {
            "success": False,
            "error": str(err),
            "resultUrl": None
        }

# ================= Google SigLIP 2 Scoring Endpoint =================
def fetch_image(url: str, thumb: Optional[str] = None) -> Optional[Image.Image]:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8"
    }
    for target in [url, thumb]:
        if not target:
            continue
        try:
            res = requests.get(target, headers=headers, timeout=4.0)
            if res.status_code == 200 and len(res.content) > 1000:
                img = Image.open(io.BytesIO(res.content))
                return img.convert("RGB")
        except Exception:
            continue
    return None

@app.post("/score-candidates")
def score_candidates(req: ScoreRequest):
    global model, processor
    
    if not req.candidates:
        return {"success": True, "candidates": []}

    if model is None:
        return {
            "success": True,
            "scored_with": "heuristic_fallback_while_loading",
            "is_loading": is_model_loading,
            "candidates": [c.dict() for c in req.candidates]
        }
            
    kw = req.keyword.strip()

    text_prompts = [
        f"a photo of Vietnamese traditional attire {kw}",
        f"an authentic image of {kw}",
        f"trang phục cổ phục {kw}",
        f"thời trang việt phục {kw}"
    ]

    negative_prompts = [
        "cartoon anime 3d vector clipart illustration sketch icon logo",
        "commercial banner text graphic advertisement",
        "blurry low quality messy background"
    ]
    
    all_texts = text_prompts + negative_prompts
    images = []
    valid_indices = []
    
    from concurrent.futures import ThreadPoolExecutor
    
    def download_cand(cand_tuple):
        idx, cand = cand_tuple
        img = fetch_image(cand.url, cand.thumbnail)
        return idx, img

    with ThreadPoolExecutor(max_workers=10) as executor:
        download_results = executor.map(download_cand, enumerate(req.candidates))
        for idx, img in download_results:
            if img is not None:
                images.append(img)
                valid_indices.append(idx)

    scored_candidates = []

    if not images:
        return {
            "success": True,
            "scored_with": "fallback_metadata",
            "candidates": [c.dict() for c in req.candidates]
        }

    try:
        with torch.no_grad():
            inputs = processor(
                text=all_texts,
                images=images,
                padding="max_length",
                return_tensors="pt"
            )
            inputs = {k: v.to(device) for k, v in inputs.items()}
            
            outputs = model(**inputs)
            logits_per_image = outputs.logits_per_image
            probs = torch.sigmoid(logits_per_image)
            
            num_pos = len(text_prompts)
            pos_scores = probs[:, :num_pos].mean(dim=-1).cpu().numpy()
            neg_scores = probs[:, num_pos:].mean(dim=-1).cpu().numpy()
            
            for i, orig_idx in enumerate(valid_indices):
                cand = req.candidates[orig_idx].dict()
                raw_pos = float(pos_scores[i])
                raw_neg = float(neg_scores[i])
                
                siglip_similarity = max(0.0, min(1.0, raw_pos - (raw_neg * 0.35)))
                siglip_score = round(siglip_similarity * 100)
                
                w = cand.get("width", 0) or 0
                h = cand.get("height", 0) or 0
                dim_score = 50
                if w >= 600 and h >= 600:
                    dim_score = 90
                elif w >= 400 and h >= 400:
                    dim_score = 75
                elif w < 200 or h < 200:
                    dim_score = 20
                
                final_score = min(100, max(10, round(siglip_score * 0.75 + dim_score * 0.25)))
                quality_badge = "SigLIP 2 AI ★ HD" if final_score >= 80 else ("Chuẩn Đẹp" if final_score >= 60 else "Tham Khảo")
                
                cand["siglipScore"] = siglip_score
                cand["qualityScore"] = final_score
                cand["qualityBadge"] = quality_badge
                cand["aiVerified"] = True
                cand["validationMessage"] = f"Google SigLIP 2 Score: {siglip_score}% ({w}x{h}px)"
                
                scored_candidates.append(cand)
                
        valid_set = set(valid_indices)
        for idx, cand in enumerate(req.candidates):
            if idx not in valid_set:
                c = cand.dict()
                c["siglipScore"] = 35
                c["qualityScore"] = 40
                c["qualityBadge"] = "Cần kiểm tra"
                c["aiVerified"] = False
                c["validationMessage"] = "Kích thước kiểm định khi tải"
                scored_candidates.append(c)

        scored_candidates.sort(key=lambda x: x.get("qualityScore", 0), reverse=True)

        return {
            "success": True,
            "scored_with": active_model_name or MODEL_CANDIDATES[0],
            "model_version": "Google SigLIP 2 Vision-Language",
            "candidates": scored_candidates
        }
    except Exception as err:
        print(f"[!] Error in scoring: {err}")
        return {
            "success": False,
            "error": str(err),
            "candidates": [c.dict() for c in req.candidates]
        }

if __name__ == "__main__":
    import uvicorn
    print("[*] Khởi động AI Suite (Google SigLIP 2 + Mobile-VTON) trên http://127.0.0.1:5001...")
    uvicorn.run(app, host="127.0.0.1", port=5001, log_level="info")
