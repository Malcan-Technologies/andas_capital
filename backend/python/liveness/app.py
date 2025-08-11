from fastapi import FastAPI
from pydantic import BaseModel
import os
import numpy as np
import cv2

try:
    import onnxruntime as ort
except Exception:
    ort = None

app = FastAPI()

_session = None
_input_name = None


def get_model():
    global _session, _input_name
    if _session is None and ort is not None:
        model_path = os.getenv("LIVENESS_MODEL", "/srv/models/silentface.onnx")
        providers = ["CPUExecutionProvider"]
        if os.getenv("ORT_DISABLE") == "1":
            return None
        _session = ort.InferenceSession(model_path, providers=providers)
        _input_name = _session.get_inputs()[0].name
    return _session


class LiveReq(BaseModel):
    selfieUrl: str


def read_image(url_path: str) -> np.ndarray:
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


def preprocess(img: np.ndarray) -> np.ndarray:
    # Simple center crop and resize to 224x224
    h, w = img.shape[:2]
    size = min(h, w)
    y0 = (h - size) // 2
    x0 = (w - size) // 2
    crop = img[y0:y0+size, x0:x0+size]
    resized = cv2.resize(crop, (224, 224))
    rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
    tensor = rgb.astype(np.float32) / 255.0
    tensor = np.transpose(tensor, (2, 0, 1))  # CHW
    tensor = np.expand_dims(tensor, 0)
    return tensor


@app.post("/liveness")
def liveness(req: LiveReq):
    img = read_image(req.selfieUrl)
    if img is None:
        return {"score": 0.0}
    session = get_model()
    if session is None:
        # Fallback heuristic: blur + brightness proxy
        lap = cv2.Laplacian(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), cv2.CV_64F).var()
        score = max(0.0, min(1.0, (lap / 200.0)))
        return {"score": round(float(score), 3)}
    inp = preprocess(img)
    out = session.run(None, { _input_name: inp })
    # Assume model outputs a single liveness score 0..1
    raw = float(out[0].squeeze().mean())
    score = max(0.0, min(1.0, raw))
    return {"score": round(score, 3)}


