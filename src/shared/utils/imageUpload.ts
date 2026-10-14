// Formatos que acepta el backend (StorageService). GIF tambien pasa alli, pero al
// redimensionar perderia la animacion, asi que no se ofrece en los formularios.
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ACCEPTED_IMAGE_INPUT = ACCEPTED_IMAGE_TYPES.join(",");
export const ACCEPTED_IMAGE_HINT = "JPG, PNG o WEBP";

// Tope del archivo original: la foto de un celular actual pesa entre 3 y 15 MB.
export const MAX_ORIGINAL_BYTES = 20 * 1024 * 1024;
// Tope de lo que se envia. El backend rechaza la peticion completa por encima de 10 MB.
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// Por debajo de este peso la foto se envia tal cual.
const COMPRESS_ABOVE_BYTES = 1024 * 1024;
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

export type PreparedImage = { file: File } | { error: string };

const megas = (bytes: number) => Math.round(bytes / (1024 * 1024));

export const validateImageFile = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return `Formato no permitido. Usa una imagen ${ACCEPTED_IMAGE_HINT}.`;
    }
    if (file.size > MAX_ORIGINAL_BYTES) {
        return `La imagen pesa demasiado (máximo ${megas(MAX_ORIGINAL_BYTES)} MB).`;
    }
    return null;
};

const loadImage = (file: File): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("No se pudo leer la imagen"));
        };
        img.src = url;
    });

const compressImage = async (file: File): Promise<File> => {
    const img = await loadImage(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas no disponible");
    // JPEG no tiene transparencia: sin este fondo, un PNG transparente saldria negro.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob) throw new Error("No se pudo comprimir la imagen");

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
};

// Valida la imagen elegida y, si es pesada, la reduce en el navegador antes de enviarla:
// la subida no depende de la conexion del celular ni carga la memoria del backend.
export const prepareImageForUpload = async (file: File): Promise<PreparedImage> => {
    const error = validateImageFile(file);
    if (error) return { error };

    if (file.size <= COMPRESS_ABOVE_BYTES) return { file };

    let prepared = file;
    try {
        const compressed = await compressImage(file);
        if (compressed.size < file.size) prepared = compressed;
    } catch {
        // Si el navegador no puede comprimirla, se intenta con la original.
    }

    if (prepared.size > MAX_UPLOAD_BYTES) {
        return { error: `No se pudo reducir la imagen. Elige una de menos de ${megas(MAX_UPLOAD_BYTES)} MB.` };
    }
    return { file: prepared };
};
