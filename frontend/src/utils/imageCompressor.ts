/**
 * Comprime e redimensiona imagens no cliente antes de enviar para o servidor.
 * Reduz fotos de 10MB-20MB de celulares modernos para ~300KB-500KB sem perda visível de qualidade.
 * Isso evita estouro de memória no mobile e torna o upload instantâneo.
 */
export async function compressImage(
  file: File | Blob,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.85,
): Promise<{ file: File; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      // Em caso de erro na leitura, faz fallback para o arquivo original se for File
      if (file instanceof File) {
        resolve({ file, previewUrl: URL.createObjectURL(file) });
      } else {
        reject(new Error('Erro ao ler a imagem'));
      }
    };

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        if (file instanceof File) {
          resolve({ file, previewUrl: URL.createObjectURL(file) });
        } else {
          reject(new Error('Erro ao carregar a imagem para compressão'));
        }
      };

      img.onload = () => {
        let { width, height } = img;

        // Se a imagem for menor que os limites máximos, mantemos as dimensões
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          if (file instanceof File) {
            resolve({ file, previewUrl: URL.createObjectURL(file) });
          } else {
            reject(new Error('Contexto 2D não disponível'));
          }
          return;
        }

        // Desenha a imagem redimensionada com suavização
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              if (file instanceof File) {
                resolve({ file, previewUrl: URL.createObjectURL(file) });
              } else {
                reject(new Error('Falha na conversão da imagem'));
              }
              return;
            }

            const fileName =
              file instanceof File
                ? file.name.replace(/\.[^/.]+$/, '') + '.jpg'
                : `foto-${Date.now()}.jpg`;

            const compressedFile = new File([blob], fileName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            const previewUrl = URL.createObjectURL(blob);
            resolve({ file: compressedFile, previewUrl });
          },
          'image/jpeg',
          quality,
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
