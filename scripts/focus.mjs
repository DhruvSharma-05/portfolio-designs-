import sharp from "sharp";
import smartcrop from "smartcrop-sharp";

/* ==================================================================
   computeFocus — build-time subject-aware framing.

   Detects the main subject of a photo (content-aware: skin-tone +
   saliency, so faces / people win) and returns a CSS object-position
   like "50% 30%". Applied to every framed <img> so an object-fit:cover
   crop keeps the subject in view instead of guillotining a head. Runs
   in the sync so any newly-added photo is framed automatically.

   Falls back to a gentle upper-centre bias (where faces usually sit)
   on any failure, so a bad image never breaks the build.
   ================================================================== */
export async function computeFocus(buffer) {
  try {
    // bake EXIF orientation first so the focal point matches what ships
    const rotated = await sharp(buffer).rotate().toBuffer();
    const { width, height } = await sharp(rotated).metadata();
    if (!width || !height) return "50% 40%";
    const size = Math.min(width, height);
    const { topCrop: c } = await smartcrop.crop(rotated, { width: size, height: size });
    const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
    const fx = clamp(((c.x + c.width / 2) / width) * 100, 0, 100);
    let fy = clamp(((c.y + c.height / 2) / height) * 100, 0, 100);
    // Faces sit high in a portrait; a tall frame cropped to landscape must
    // not drop below the upper band or it decapitates the subject. Keep
    // the vertical focus in the face zone for portrait-orientation photos.
    if (height > width * 1.1) fy = clamp(fy, 18, 42);
    return `${fx.toFixed(1)}% ${fy.toFixed(1)}%`;
  } catch {
    return "50% 40%";
  }
}
