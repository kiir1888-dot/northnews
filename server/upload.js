import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { supabaseAdmin } from './supabaseAdmin.js';

/**
 * Image uploads are kept in Supabase Storage (hosting like Vercel has no
 * permanent disk):
 *  - "uploads": public bucket for photos shown on the website.
 *  - "submissions": private bucket for photos readers send in; the dashboard
 *    shows them through short-lived signed links.
 */
export const PUBLIC_BUCKET = 'uploads';
export const PRIVATE_BUCKET = 'submissions';
const PRIVATE_PREFIX = `storage:${PRIVATE_BUCKET}/`;

// Vercel rejects request bodies over 4.5 MB, so keep uploads under that.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter(req, file, cb) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error('Only image uploads (JPEG, PNG, WEBP, GIF, SVG) are allowed.'));
    }
    return cb(null, true);
  },
});

function storageOrFail() {
  if (!supabaseAdmin) {
    throw Object.assign(new Error('Image storage is not configured (Supabase keys are missing).'), { status: 503 });
  }
  return supabaseAdmin.storage;
}

function uniqueName(originalName) {
  const ext = path.extname(originalName || '').toLowerCase();
  return `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
}

/**
 * Saves an uploaded image and returns the value to store in `image_path`:
 * a public URL, or (for private uploads) an internal "storage:" reference.
 */
export async function storeImage(file, { isPrivate = false } = {}) {
  if (!file) return null;
  const bucket = isPrivate ? PRIVATE_BUCKET : PUBLIC_BUCKET;
  const name = uniqueName(file.originalname);
  const storage = storageOrFail();
  const { error } = await storage.from(bucket).upload(name, file.buffer, {
    contentType: file.mimetype,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw Object.assign(new Error(`Could not save the image: ${error.message}`), { status: 502 });
  if (isPrivate) return `${PRIVATE_PREFIX}${name}`;
  return storage.from(bucket).getPublicUrl(name).data.publicUrl;
}

function locate(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith(PRIVATE_PREFIX)) {
    return { bucket: PRIVATE_BUCKET, name: imagePath.slice(PRIVATE_PREFIX.length) };
  }
  const marker = `/storage/v1/object/public/${PUBLIC_BUCKET}/`;
  const index = imagePath.indexOf(marker);
  if (index !== -1) return { bucket: PUBLIC_BUCKET, name: decodeURIComponent(imagePath.slice(index + marker.length)) };
  return null;
}

/** Removes a stored image, ignoring missing files and errors. */
export async function deleteUploadedFile(imagePath) {
  const target = locate(imagePath);
  if (!target || !supabaseAdmin) return;
  try {
    await supabaseAdmin.storage.from(target.bucket).remove([target.name]);
  } catch {
    // A leftover file is harmless; never fail the request over it.
  }
}

/** Turns a private "storage:" reference into a temporary viewing link. */
export async function viewableUrl(imagePath, expiresInSeconds = 3600) {
  const target = locate(imagePath);
  if (!target || target.bucket !== PRIVATE_BUCKET || !supabaseAdmin) return imagePath;
  const { data, error } = await supabaseAdmin.storage
    .from(PRIVATE_BUCKET)
    .createSignedUrl(target.name, expiresInSeconds);
  return error ? null : data.signedUrl;
}
