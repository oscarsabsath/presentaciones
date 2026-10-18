import { PhotoItem } from '../types';

export async function fileToPhotoItem(file: File): Promise<PhotoItem> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        resolve({
          id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          dataUrl,
          name: cleanName,
          caption: '',
          layoutMode: 'contain',
          width: img.naturalWidth || 1280,
          height: img.naturalHeight || 720,
          rotation: 0,
        });
      };
      img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}

export async function rotatePhotoDataUrl(
  dataUrl: string,
  degrees: number = 90
): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context no disponible'));
        return;
      }

      const rad = (degrees * Math.PI) / 180;
      const swapDims = degrees % 180 !== 0;
      canvas.width = swapDims ? img.height : img.width;
      canvas.height = swapDims ? img.width : img.height;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      resolve({
        dataUrl: canvas.toDataURL('image/jpeg', 0.92),
        width: canvas.width,
        height: canvas.height,
      });
    };
    img.onerror = () => reject(new Error('Error al rotar imagen'));
    img.src = dataUrl;
  });
}

export function createDemoPhotos(): PhotoItem[] {
  const demoScenes = [
    {
      title: '1. Inicio del Proyecto',
      caption: 'Vista general de la arquitectura y objetivos iniciales',
      bg1: '#1e3a8a',
      bg2: '#3b82f6',
      accent: '#93c5fd',
    },
    {
      title: '2. Diseño y Prototipado',
      caption: 'Bocetos principales de interfaz y experiencia de usuario',
      bg1: '#4c1d95',
      bg2: '#8b5cf6',
      accent: '#ddd6fe',
    },
    {
      title: '3. Pruebas de Campo',
      caption: 'Resultados obtenidos durante la validación en terreno',
      bg1: '#064e3b',
      bg2: '#10b981',
      accent: '#a7f3d0',
    },
    {
      title: '4. Conclusiones y Cierre',
      caption: 'Métricas alcanzadas y próximos pasos recomendados',
      bg1: '#7c2d12',
      bg2: '#f97316',
      accent: '#fed7aa',
    },
  ];

  return demoScenes.map((scene, idx) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 800;
    const ctx = canvas.getContext('2d')!;

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, scene.bg1);
    grad.addColorStop(1, scene.bg2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(1050, 180, 260, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(200, 680, 220, 0, Math.PI * 2);
    ctx.fill();

    // Inner frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 4;
    ctx.strokeRect(70, 70, canvas.width - 140, canvas.height - 140);

    // Text
    ctx.fillStyle = scene.accent;
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(`FOTO DEMO #${idx + 1}`, 130, 320);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText(scene.title, 130, 410);

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '32px sans-serif';
    ctx.fillText(scene.caption, 130, 480);

    return {
      id: `demo-${Date.now()}-${idx}`,
      dataUrl: canvas.toDataURL('image/jpeg', 0.9),
      name: scene.title,
      caption: scene.caption,
      layoutMode: idx % 2 === 1 ? 'cover' : 'contain',
      width: canvas.width,
      height: canvas.height,
      rotation: 0,
    };
  });
}
