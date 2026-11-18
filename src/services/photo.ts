/**
 * অ্যাডমিনের বাছা ছবি ব্রাউজারেই ছোট করে JPEG বানায়, যেন মোবাইলের বড় ছবিও সহজে আপলোড হয়।
 * ফল: data URL (সার্ভার সর্বোচ্চ ৪০০KB নেয়; আমরা ~৩০০KB-র নিচে রাখি)।
 */
const MAX_SIDE = 900;
const TARGET_BYTES = 300 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

export type PhotoError = 'invalid_type' | 'too_large' | 'unreadable';

export class PhotoPrepError extends Error {
  code: PhotoError;
  constructor(code: PhotoError) {
    super(code);
    this.code = code;
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new PhotoPrepError('unreadable'));
    };
    img.src = url;
  });
}

// data URL-এর base64 অংশ থেকে আনুমানিক বাইট সংখ্যা
const dataUrlBytes = (u: string) => Math.floor(((u.length - u.indexOf(',') - 1) * 3) / 4);

export async function prepareProfilePhoto(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new PhotoPrepError('invalid_type');
  if (file.size > 15 * 1024 * 1024) throw new PhotoPrepError('too_large');

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new PhotoPrepError('unreadable');
  // PNG-র স্বচ্ছ অংশ JPEG-এ কালো না হয়ে সাদা হোক
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  let quality = 0.88;
  let out = canvas.toDataURL('image/jpeg', quality);
  while (dataUrlBytes(out) > TARGET_BYTES && quality > 0.4) {
    quality -= 0.1;
    out = canvas.toDataURL('image/jpeg', quality);
  }
  if (dataUrlBytes(out) > 390 * 1024) throw new PhotoPrepError('too_large');
  return out;
}
