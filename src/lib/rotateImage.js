/** Draai een afbeeldingsbestand met canvas (90° stappen). Niet-afbeeldingen worden ongewijzigd teruggegeven. */
export async function rotateImageFile(file, degrees) {
  if (!file?.type?.startsWith('image/') || !degrees || degrees % 360 === 0) return file;

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const swap = degrees === 90 || degrees === 270;
  canvas.width = swap ? bitmap.height : bitmap.width;
  canvas.height = swap ? bitmap.width : bitmap.height;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  bitmap.close?.();

  const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, 0.92));
  return new File([blob], file.name, { type: mime, lastModified: Date.now() });
}

export function isImageFile(file) {
  return file?.type?.startsWith('image/');
}
