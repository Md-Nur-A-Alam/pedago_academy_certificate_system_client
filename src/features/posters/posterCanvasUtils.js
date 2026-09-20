/**
 * Utility to generate cropped photo preview and composite final high-res poster canvas
 */

export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

/**
 * Generates a cropped data URL from pixel crop coordinates and frame shape
 */
export async function getCroppedImg(imageSrc, pixelCrop, frameShape = "circle", rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!pixelCrop || !pixelCrop.width || !pixelCrop.height) {
    return imageSrc;
  }

  const isCircle = frameShape === "circle";
  const isRounded = frameShape === "rounded";

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.save();

  // Apply clip shape
  ctx.beginPath();
  if (isCircle) {
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      Math.min(canvas.width, canvas.height) / 2,
      0,
      Math.PI * 2
    );
  } else if (isRounded) {
    const r = Math.min(canvas.width, canvas.height) * 0.16;
    if (ctx.roundRect) {
      ctx.roundRect(0, 0, canvas.width, canvas.height, r);
    } else {
      ctx.rect(0, 0, canvas.width, canvas.height);
    }
  } else {
    ctx.rect(0, 0, canvas.width, canvas.height);
  }
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.restore();

  return canvas.toDataURL("image/png");
}

/**
 * Composite full-resolution poster with background, cropped framed photo, and optional text
 */
export async function generateCompositePoster({
  bgUrl,
  photoSrc,
  pixelCrop,
  frameShape = "circle",
  photoZone = { x: 50, y: 40, w: 35, h: 35 },
  textZones = [],
  customTexts = {},
}) {
  const bgImg = await createImage(bgUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const width = bgImg.naturalWidth || 1200;
  const height = bgImg.naturalHeight || 1600;
  canvas.width = width;
  canvas.height = height;

  // 1. Draw poster background artwork
  ctx.drawImage(bgImg, 0, 0, width, height);

  // 2. Draw framed user photo
  if (photoSrc) {
    try {
      const userImg = await createImage(photoSrc);

      const pWPercent = photoZone.w || 32;
      const isRectangle = frameShape === "rectangle";
      const isCircle = frameShape === "circle";
      const isRounded = frameShape === "rounded";

      const destW = (pWPercent / 100) * width;
      const destH = isRectangle ? destW * (4 / 3) : destW; // 4:3 portrait for rectangle, 1:1 for circle/square
      const destX = (photoZone.x / 100) * width - destW / 2;
      const destY = (photoZone.y / 100) * height - destH / 2;

      ctx.save();

      // Drop shadow around frame
      ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      ctx.shadowBlur = width * 0.015;
      ctx.shadowOffsetY = width * 0.008;

      // Clip path
      ctx.beginPath();
      if (isCircle) {
        ctx.arc(destX + destW / 2, destY + destH / 2, destW / 2, 0, Math.PI * 2);
      } else if (isRounded) {
        const r = destW * 0.16;
        if (ctx.roundRect) {
          ctx.roundRect(destX, destY, destW, destH, r);
        } else {
          ctx.rect(destX, destY, destW, destH);
        }
      } else {
        ctx.rect(destX, destY, destW, destH);
      }
      ctx.closePath();
      ctx.clip();

      // Source slice from user crop
      let sx = 0;
      let sy = 0;
      let sw = userImg.naturalWidth;
      let sh = userImg.naturalHeight;

      if (pixelCrop && pixelCrop.width && pixelCrop.height) {
        sx = pixelCrop.x;
        sy = pixelCrop.y;
        sw = pixelCrop.width;
        sh = pixelCrop.height;
      }

      ctx.drawImage(userImg, sx, sy, sw, sh, destX, destY, destW, destH);
      ctx.restore();

      // Clean border ring over the frame
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = Math.max(3, Math.round(width * 0.005));

      ctx.beginPath();
      if (isCircle) {
        ctx.arc(destX + destW / 2, destY + destH / 2, destW / 2, 0, Math.PI * 2);
      } else if (isRounded) {
        const r = destW * 0.16;
        if (ctx.roundRect) {
          ctx.roundRect(destX, destY, destW, destH, r);
        } else {
          ctx.rect(destX, destY, destW, destH);
        }
      } else {
        ctx.rect(destX, destY, destW, destH);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    } catch (err) {
      console.warn("Could not composite user photo:", err);
    }
  }

  // 3. Draw text zones (Name, Title, etc.)
  if (textZones && textZones.length > 0) {
    textZones.forEach((zone) => {
      const textToRender = customTexts[zone.key] || "";
      if (!textToRender) return;

      const sizePx = (zone.size || 24) * (width / 1000) * 1.3;
      const weight = zone.style === "bold" ? "bold" : "600";
      ctx.font = `${weight} ${sizePx}px "${zone.font || "Montserrat"}", sans-serif`;
      ctx.fillStyle = zone.color || "#FFFFFF";
      ctx.textAlign = zone.align || "center";
      ctx.textBaseline = "middle";

      ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
      ctx.shadowBlur = Math.round(sizePx * 0.35);
      ctx.shadowOffsetY = Math.round(sizePx * 0.1);

      const tx = (zone.x / 100) * width;
      const ty = (zone.y / 100) * height;

      ctx.fillText(textToRender, tx, ty);
    });
  }

  return canvas.toDataURL("image/png");
}
