#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
High-Speed Local CLIP Microservice (FastAPI & CLI)
Caches OpenAI CLIP ViT-B/32 in memory for ultra-fast (sub-100ms) cosine similarity inference.
"""

import sys
import io
import os
import requests
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel

# Force UTF-8 on Windows
if sys.platform.startswith('win'):
    sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MODEL_ID = "openai/clip-vit-base-patch32"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

print(f"[CLIP Service] Loading model {MODEL_ID} on {DEVICE}...")
processor = CLIPProcessor.from_pretrained(MODEL_ID)
model = CLIPModel.from_pretrained(MODEL_ID).to(DEVICE)
model.eval()
print("[CLIP Service] Model loaded and ready!")

def download_image_pil(url, thumbnail=None, timeout=5):
    urls_to_try = [u for u in [url, thumbnail] if u]

    for u in urls_to_try:
        if u.startswith('/api/dataset/'):
            local_rel = u.replace('/api/dataset/', '')
            local_path = os.path.join(ROOT_DIR, 'dataset', local_rel.replace('/', os.sep))
            if os.path.exists(local_path):
                try:
                    return Image.open(local_path).convert('RGB')
                except Exception:
                    pass
        elif os.path.exists(u):
            try:
                return Image.open(u).convert('RGB')
            except Exception:
                pass

        if u.startswith('http'):
            headers = {
                'User-Agent': 'VietPhucRemix/2.0 (heritage@vietphuc.vn) Mozilla/5.0',
                'Accept': 'image/avif,image/webp,image/apng,image/jpeg,image/*,*/*;q=0.8',
                'Referer': 'https://commons.wikimedia.org/' if 'wikimedia' in u else u
            }
            try:
                resp = requests.get(u, headers=headers, timeout=timeout)
                if resp.status_code == 200 and len(resp.content) > 1024:
                    return Image.open(io.BytesIO(resp.content)).convert('RGB')
            except Exception:
                continue

    return None

def score_candidates_core(query: str, candidates: list, kb_hint: str = "", exclude_types: list = None):
    if kb_hint and len(kb_hint.strip()) > 5:
        enhanced_text = f"a photograph of authentic Vietnamese traditional {query}. {kb_hint.strip()[:200]}"
    else:
        enhanced_text = f"a detailed photograph of authentic Vietnamese traditional costume: {query}"

    negative_text = "modern sneakers, western high heels, athletic shoes, oxford dress shoes, western clothing, chinese hanfu, cartoon, anime, clipart"
    if exclude_types and len(exclude_types) > 0:
        negative_text += ", " + ", ".join(exclude_types)

    with torch.no_grad():
        text_inputs = processor(text=[enhanced_text, negative_text], return_tensors="pt", padding=True).to(DEVICE)
        text_out = model.get_text_features(**text_inputs)
        text_features = text_out.pooler_output if hasattr(text_out, 'pooler_output') else (text_out[1] if isinstance(text_out, tuple) else text_out)
        text_features = text_features / text_features.norm(dim=-1, keepdim=True)
        pos_features = text_features[0:1]
        neg_features = text_features[1:2]

    results = []

    for item in candidates:
        url = item.get('url', '')
        thumb = item.get('thumbnail', '')
        title = item.get('title', '')
        item_id = item.get('id', '')

        # Basic filter
        lower_url = url.lower()
        lower_title = (title or '').lower()
        combo_text = f"{lower_title} {lower_url}"

        if any(bad in lower_url for bad in ['.svg', '.gif', 'favicon', 'logo', 'icon', 'clipart', 'vector', 'cartoon']):
            results.append({
                **item,
                'clipScore': 20,
                'isValid': False,
                'clipMessage': 'Định dạng logo/icon/vector không hợp lệ'
            })
            continue

        # Check explicit exclude_types
        is_excluded = False
        if exclude_types:
            for ex in exclude_types:
                ex_clean = ex.strip().lower()
                if ex_clean and ex_clean in combo_text:
                    results.append({
                        **item,
                        'clipScore': 25,
                        'isValid': False,
                        'clipMessage': f'Trùng từ khóa loại trừ: "{ex}"'
                    })
                    is_excluded = True
                    break
        if is_excluded:
            continue

        pil_img = download_image_pil(url, thumb)
        if pil_img is None:
            results.append({
                **item,
                'clipScore': 55,
                'isValid': True,
                'clipMessage': 'CLIP đánh giá cơ bản (Ảnh không tải được trực tiếp)'
            })
            continue

        try:
            with torch.no_grad():
                image_inputs = processor(images=pil_img, return_tensors="pt").to(DEVICE)
                image_out = model.get_image_features(**image_inputs)
                image_features = image_out.pooler_output if hasattr(image_out, 'pooler_output') else (image_out[1] if isinstance(image_out, tuple) else image_out)
                image_features = image_features / image_features.norm(dim=-1, keepdim=True)

                pos_sim = (image_features @ pos_features.T).item()
                neg_sim = (image_features @ neg_features.T).item()
                diff = pos_sim - neg_sim

                # If image looks distinctly like negative category (e.g. sneaker/oxford when searching for traditional shoe)
                kb_penalty = 0
                if diff < 0.02:
                    kb_penalty = int(min(45, (0.02 - diff) * 200))

                base_score = ((pos_sim - 0.12) / 0.18) * 45 + 55
                norm_score = int(max(20, min(99, base_score - kb_penalty)))

                is_valid = norm_score >= 50 and (neg_sim < pos_sim + 0.04)

                results.append({
                    **item,
                    'clipScore': norm_score,
                    'cosineSimilarity': round(pos_sim, 4),
                    'contrastiveDiff': round(diff, 4),
                    'isValid': is_valid,
                    'clipMessage': f'CLIP ViT: {norm_score}% (Sim: {pos_sim:.3f}, Diff: {diff:.3f})'
                })
        except Exception as e:
            results.append({
                **item,
                'clipScore': 60,
                'isValid': True,
                'clipMessage': f'CLIP Fallback ({str(e)})'
            })

    results.sort(key=lambda x: x.get('clipScore', 0), reverse=True)
    return results

app = FastAPI(title="CLIP Evaluation Microservice")

class CandidateItem(BaseModel):
    id: Optional[str] = None
    url: str
    thumbnail: Optional[str] = None
    title: Optional[str] = ""
    domain: Optional[str] = ""
    source: Optional[str] = ""
    width: Optional[int] = 0
    height: Optional[int] = 0

class EvalRequest(BaseModel):
    query: str
    candidates: List[dict]
    kb_hint: Optional[str] = ""
    exclude_types: Optional[List[str]] = None

@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_ID, "device": str(DEVICE)}

@app.post("/evaluate")
def evaluate(req: EvalRequest):
    ranked = score_candidates_core(req.query, req.candidates, req.kb_hint or "", req.exclude_types or [])
    return {"success": True, "query": req.query, "results": ranked}

if __name__ == "__main__":
    port = int(os.environ.get("CLIP_PORT", 5005))
    print(f"[CLIP Service] Starting HTTP server on http://localhost:{port}...")
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
