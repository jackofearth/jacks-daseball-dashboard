export async function processLogoFileToPngWithAlpha(file: File): Promise<string> {
  const img = await loadImageFromFile(file);
  const { canvas, ctx } = createCanvas(img.naturalWidth || img.width, img.naturalHeight || img.height);
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  const { isChecker, c1, c2 } = detectCheckerboardColorsQuick(img);
  const bg = estimateCornerBackgroundColor(data, width, height);

  const delta = 22; // tolerance
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    const transparent =
      (isChecker && (near([r,g,b], c1, delta) || near([r,g,b], c2, delta))) ||
      near([r,g,b], bg, delta);
    if (transparent) data[i+3] = 0;
  }

  featherAlpha(imageData, width, height);
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function createCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context unavailable');
  return { canvas, ctx };
}

function near(rgb: [number, number, number], base: [number, number, number], tol: number): boolean {
  return Math.abs(rgb[0]-base[0]) <= tol && Math.abs(rgb[1]-base[1]) <= tol && Math.abs(rgb[2]-base[2]) <= tol;
}

function estimateCornerBackgroundColor(data: Uint8ClampedArray, width: number, height: number): [number, number, number] {
  const samples: [number, number, number][] = [];
  const push = (x: number, y: number) => {
    const idx = (y*width + x) * 4;
    samples.push([data[idx], data[idx+1], data[idx+2]]);
  };
  const margin = 4;
  push(margin, margin);
  push(width-margin-1, margin);
  push(margin, height-margin-1);
  push(width-margin-1, height-margin-1);
  // median-ish average
  const avg = (i: number) => Math.round(samples.reduce((s, v) => s+v[i], 0)/samples.length);
  return [avg(0), avg(1), avg(2)];
}

function detectCheckerboardColorsQuick(img: HTMLImageElement): { isChecker: boolean; c1: [number,number,number]; c2: [number,number,number] } {
  // downscale and sample grid parity
  const w = 64, h = 64;
  const { canvas, ctx } = createCanvas(w, h);
  ctx.drawImage(img, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  // collect two most common colors via k-means-ish seeding
  const colors: [number,number,number][] = [];
  for (let y=0; y<h; y+=4) {
    for (let x=0; x<w; x+=4) {
      const idx = (y*w + x)*4;
      colors.push([d[idx], d[idx+1], d[idx+2]]);
    }
  }
  const c1 = medianColor(colors);
  const c2 = medianColor(colors.filter(c => !near(c, c1, 20)));
  if (!c2) return { isChecker: false, c1, c2: c1 };

  // check alternating pattern dominance
  let matches = 0, total = 0;
  for (let y=0; y<h; y++) {
    for (let x=0; x<w; x++) {
      const idx = (y*w + x)*4;
      const pix: [number,number,number] = [d[idx], d[idx+1], d[idx+2]];
      const parity = ((x>>2) + (y>>2)) & 1; // 4x4 tile parity
      const expect = parity ? c1 : c2;
      if (near(pix, expect, 22)) matches++;
      total++;
    }
  }
  const isChecker = matches/total > 0.6; // heuristic
  return { isChecker, c1, c2 };
}

function medianColor(arr: [number,number,number][]): [number,number,number] {
  if (arr.length === 0) return [128,128,128];
  const rs = arr.map(a=>a[0]).sort((a,b)=>a-b);
  const gs = arr.map(a=>a[1]).sort((a,b)=>a-b);
  const bs = arr.map(a=>a[2]).sort((a,b)=>a-b);
  const m = (a: number[]) => a[Math.floor(a.length/2)];
  return [m(rs), m(gs), m(bs)];
}

function featherAlpha(imageData: ImageData, width: number, height: number) {
  const data = imageData.data;
  const alphaCopy = new Uint8ClampedArray(width*height);
  for (let i=0, p=0; i<data.length; i+=4, p++) alphaCopy[p] = data[i+3];
  const out = new Uint8ClampedArray(alphaCopy);
  const offsets = [-1,0,1];
  for (let y=1; y<height-1; y++) {
    for (let x=1; x<width-1; x++) {
      const idx = y*width + x;
      if (alphaCopy[idx] !== 0 && alphaCopy[idx] !== 255) continue;
      let sum = 0, count = 0;
      for (const dy of offsets) for (const dx of offsets) {
        const n = alphaCopy[idx + dy*width + dx];
        sum += n; count++;
      }
      out[idx] = Math.round((alphaCopy[idx]*2 + sum)/ (count+2));
    }
  }
  for (let i=0, p=0; i<data.length; i+=4, p++) data[i+3] = out[p];
}


