from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import os
import numpy as np
import cv2

app = FastAPI()

_model = None


def get_model():
    global _model
    if _model is None:
        # Use InsightFace model hub
        from insightface.app import FaceAnalysis
        _model = FaceAnalysis(name=os.getenv("INSIGHTFACE_MODEL", "buffalo_l"))
        _model.prepare(ctx_id=-1)  # CPU
    return _model


class FaceReq(BaseModel):
    icFrontUrl: str
    selfieUrl: str


def read_image(url_path: str) -> Optional[np.ndarray]:
    if url_path.startswith("http"):
        import requests
        r = requests.get(url_path, timeout=10)
        r.raise_for_status()
        data = np.frombuffer(r.content, np.uint8)
        return cv2.imdecode(data, cv2.IMREAD_COLOR)
    candidates = []
    if os.path.isabs(url_path):
        candidates.append(url_path)
        if url_path.startswith("/uploads"):
            candidates.append(os.path.join("/srv", url_path.lstrip("/")))
            candidates.append(os.path.join("/app", url_path.lstrip("/")))
    else:
        candidates.append(os.path.join("/srv", url_path))
        candidates.append(os.path.join("/app", url_path))
    for p in candidates:
        try:
            with open(p, "rb") as f:
                data = np.frombuffer(f.read(), np.uint8)
                return cv2.imdecode(data, cv2.IMREAD_COLOR)
        except Exception:
            continue
    return None


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    a = a.astype(np.float32)
    b = b.astype(np.float32)
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


@app.post("/face-match")
def match(req: FaceReq):
    model = get_model()

    img_card = read_image(req.icFrontUrl)
    img_selfie = read_image(req.selfieUrl)
    if img_card is None or img_selfie is None:
        return {"score": 0.0}

    # Detect & get embeddings
    faces_card = model.get(img_card)
    faces_selfie = model.get(img_selfie)
    if not faces_card or not faces_selfie:
        return {"score": 0.0}

    # Choose the largest face in each
    card_face = max(faces_card, key=lambda f: (f.bbox[2]-f.bbox[0])*(f.bbox[3]-f.bbox[1]))
    selfie_face = max(faces_selfie, key=lambda f: (f.bbox[2]-f.bbox[0])*(f.bbox[3]-f.bbox[1]))
    score = cosine_similarity(card_face.embedding, selfie_face.embedding)
    return {"score": round(float(score), 4)}


