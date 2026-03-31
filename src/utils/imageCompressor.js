/**
 * Comprime una imagen antes de subirla.
 * Redimensiona al ancho máximo indicado manteniendo la proporción,
 * convierte a JPEG y apunta a un tamaño máximo de ~500 KB.
 *
 * @param {File} file - Archivo de imagen original
 * @param {number} maxWidth - Ancho máximo en píxeles (por defecto 1200)
 * @param {number} quality - Calidad JPEG inicial entre 0 y 1 (por defecto 0.8)
 * @returns {Promise<File>} - Archivo comprimido
 */
export async function compressImage(file, maxWidth = 1200, quality = 0.8) {
  const MAX_SIZE = 500 * 1024 // 500 KB

  // Si el archivo ya es menor al máximo y no necesita redimensionar, devolverlo tal cual
  if (file.size <= MAX_SIZE || !file.type.startsWith('image/')) {
    return file
  }

  const bitmap = await createImageBitmap(file)
  let { width, height } = bitmap

  // No agrandar imágenes pequeñas
  if (width > maxWidth) {
    const ratio = maxWidth / width
    width = maxWidth
    height = Math.round(height * ratio)
  }

  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  // Comprimir iterativamente hasta estar bajo el tamaño máximo
  let currentQuality = quality
  let blob

  for (let i = 0; i < 5; i++) {
    blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: currentQuality })
    if (blob.size <= MAX_SIZE || currentQuality <= 0.3) break
    currentQuality -= 0.1
  }

  // Construir un nuevo File con el nombre original (extensión cambiada a .jpg)
  const baseName = file.name.replace(/\.[^.]+$/, '')
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })
}
