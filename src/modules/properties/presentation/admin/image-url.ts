// Cloudinary: pide la imagen ya reducida y optimizada en lugar de la original
export const optimizedImage = (url: string, width: number) =>
  url.includes("/image/upload/")
    ? url.replace("/image/upload/", `/image/upload/w_${width},q_auto,f_auto/`)
    : url;