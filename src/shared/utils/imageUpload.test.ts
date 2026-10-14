import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_ORIGINAL_BYTES, prepareImageForUpload, validateImageFile } from './imageUpload';

const MB = 1024 * 1024;

const fileOf = (bytes: number, name = 'foto.jpg', type = 'image/jpeg') =>
    new File([new Uint8Array(bytes)], name, { type });

// jsdom no decodifica imagenes ni implementa canvas: se simulan ambos.
const stubCanvas = ({ outputBytes, decodes = true }: { outputBytes: number; decodes?: boolean }) => {
    const drawImage = vi.fn();
    const canvas = { width: 0, height: 0 };

    class FakeImage {
        naturalWidth = 4000;
        naturalHeight = 3000;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_: string) {
            queueMicrotask(() => (decodes ? this.onload?.() : this.onerror?.()));
        }
    }
    vi.stubGlobal('Image', FakeImage);

    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag !== 'canvas') return realCreate(tag);
        return Object.assign(canvas, {
            getContext: () => ({ fillStyle: '', fillRect: vi.fn(), drawImage }),
            toBlob: (cb: (b: Blob | null) => void) => cb(new Blob([new Uint8Array(outputBytes)], { type: 'image/jpeg' })),
        }) as unknown as HTMLElement;
    });

    return { canvas, drawImage };
};

describe('imageUpload', () => {
    beforeEach(() => {
        URL.createObjectURL = vi.fn(() => 'blob:foto');
        URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('rechaza formatos que el backend no acepta', async () => {
        expect(validateImageFile(fileOf(100, 'foto.heic', 'image/heic'))).toMatch(/Formato no permitido/);
        expect(validateImageFile(fileOf(100, 'doc.pdf', 'application/pdf'))).toMatch(/Formato no permitido/);
        expect(await prepareImageForUpload(fileOf(100, 'anim.gif', 'image/gif'))).toEqual({
            error: expect.stringMatching(/JPG, PNG o WEBP/),
        });
    });

    it('rechaza un original por encima del tope', () => {
        expect(validateImageFile(fileOf(MAX_ORIGINAL_BYTES + 1))).toMatch(/máximo 20 MB/);
    });

    it('una imagen liviana se envia tal cual, sin pasar por canvas', async () => {
        const createElement = vi.spyOn(document, 'createElement');
        const file = fileOf(300 * 1024, 'foto.png', 'image/png');

        expect(await prepareImageForUpload(file)).toEqual({ file });
        expect(createElement).not.toHaveBeenCalledWith('canvas');
    });

    it('una foto pesada se reduce a 1600 px y sale como JPG', async () => {
        const { canvas, drawImage } = stubCanvas({ outputBytes: 400 * 1024 });

        const result = await prepareImageForUpload(fileOf(8 * MB, 'IMG_0001.PNG', 'image/png'));

        if (!('file' in result)) throw new Error('se esperaba un archivo');
        expect(result.file.type).toBe('image/jpeg');
        expect(result.file.name).toBe('IMG_0001.jpg');
        expect(result.file.size).toBe(400 * 1024);
        expect([canvas.width, canvas.height]).toEqual([1600, 1200]);
        expect(drawImage).toHaveBeenCalled();
    });

    it('si el navegador no puede comprimir, envia la original cuando cabe', async () => {
        stubCanvas({ outputBytes: 0, decodes: false });
        const file = fileOf(3 * MB);

        expect(await prepareImageForUpload(file)).toEqual({ file });
    });

    it('si no puede comprimir y la original es muy pesada, avisa en vez de enviarla', async () => {
        stubCanvas({ outputBytes: 0, decodes: false });

        expect(await prepareImageForUpload(fileOf(9 * MB))).toEqual({
            error: expect.stringMatching(/menos de 5 MB/),
        });
    });
});
