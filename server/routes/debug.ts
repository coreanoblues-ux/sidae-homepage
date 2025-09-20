import fs from 'fs';
import path from 'path';
import { Router } from 'express';

const r = Router();
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

r.get('/api/debug/uploads', (req, res) => {
  try {
    const files = fs.existsSync(UPLOAD_DIR) ? fs.readdirSync(UPLOAD_DIR) : [];
    res.json({ ok: true, dir: UPLOAD_DIR, files });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: String(e?.message) });
  }
});

export default r;