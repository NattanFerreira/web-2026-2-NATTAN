/**
 * Utilitário para compressão e redimensionamento de imagens de perfil no navegador.
 *
 * Garante que imagens de alta resolução (como fotos de câmeras de smartphones, que podem ter 10 MB+)
 * sejam redimensionadas para dimensões adequadas de avatar (máximo 800x800) e comprimidas em JPEG/PNG,
 * gerando arquivos leves (~50 KB a 150 KB).
 *
 * Isso evita qualquer estouro de limites do Amazon API Gateway (10 MB) e AWS Lambda (6 MB),
 * garantindo uploads ultra-rápidos e eliminando o erro "NetworkError when attempting to fetch resource".
 */

export interface CompressedImageResult {
  dataUrl: string;
  file: File;
  originalSize: number;
  compressedSize: number;
}

export function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.85
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('O arquivo selecionado não é uma imagem válida.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo selecionado.'));

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Falha ao decodificar a imagem selecionada.'));

      img.onload = () => {
        let { width, height } = img;

        // Mantém a proporção da imagem
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Não foi possível inicializar o processador de imagem.'));
        }

        // Fundo neutro caso a imagem tenha transparência ao salvar em JPEG
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        if (outputMime === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL(outputMime, quality);

        canvas.toBlob(
          (blob) => {
            const finalBlob = blob || file;
            const extension = outputMime === 'image/png' ? '.png' : '.jpg';
            const compressedFile = new File([finalBlob], `avatar${extension}`, {
              type: outputMime,
              lastModified: Date.now(),
            });

            resolve({
              dataUrl,
              file: compressedFile,
              originalSize: file.size,
              compressedSize: compressedFile.size,
            });
          },
          outputMime,
          quality
        );
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
