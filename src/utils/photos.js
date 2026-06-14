export async function preparePhotoFile(file) {
  const isHeic = file.type === 'image/heic'
    || file.type === 'image/heif'
    || /\.(heic|heif)$/i.test(file.name)

  if (!isHeic) return file

  const { default: heic2any } = await import('heic2any')
  const converted = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.82,
  })

  return Array.isArray(converted) ? converted[0] : converted
}

export async function compressPhoto(file, { maxSide = 1200, quality = 0.78 } = {}) {
  const readableFile = await preparePhotoFile(file)

  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(readableFile)
    const image = new Image()

    image.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))

      const context = canvas.getContext('2d')
      context.fillStyle = '#FFFDFB'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(imageUrl)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl)
      reject(new Error('Formato immagine non leggibile.'))
    }

    image.src = imageUrl
  })
}
