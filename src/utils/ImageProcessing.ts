export async function processLogoFileToPngWithAlpha(file: File): Promise<string> {
  const img = await loadImageFromFile(file);
  const { canvas, ctx } = createCanvas(img.naturalWidth || img.width, img.naturalHeight || img.height);
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  // Multi-strategy: checkerboard detection + border flood-fill from estimated bg
  const { isChecker, c1, c2 } = detectCheckerboardColorsRobust(img);
  const bg = estimateCornerBackgroundColor(data, width, height);

  const delta = 28; // increased tolerance to handle compression noise
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    const transparent =
      (isChecker && (near([r,g,b], c1, delta) || near([r,g,b], c2, delta))) ||
      near([r,g,b], bg, delta);
    if (transparent) data[i+3] = 0;
  }

  // Border flood-fill to capture contiguous background regions missed by color-only mask
  floodFillAlphaFromBorders(imageData, width, height, (r,g,b,a) => {
    if (a === 0) return true;
    return near([r,g,b], bg, delta) || (isChecker && (near([r,g,b], c1, delta) || near([r,g,b], c2, delta)));
  });

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

function detectCheckerboardColorsRobust(img: HTMLImageElement): { isChecker: boolean; c1: [number,number,number]; c2: [number,number,number] } {
  const w = 96, h = 96;
  const { canvas, ctx } = createCanvas(w, h);
  ctx.drawImage(img, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;

  // k-means (k=2) to find two dominant background colors (handles non-gray boards)
  const samples: [number,number,number][] = [];
  for (let y=0; y<h; y+=3) {
    for (let x=0; x<w; x+=3) {
      const idx = (y*w + x)*4;
      samples.push([d[idx], d[idx+1], d[idx+2]]);
    }
  }
  const { c1, c2 } = kmeans2(samples);

  // multi-scale alternating parity check across tile sizes
  const tileSizes = [2, 3, 4, 6, 8];
  let bestScore = 0;
  for (const ts of tileSizes) {
    let matches = 0, total = 0;
    for (let y=0; y<h; y++) {
      for (let x=0; x<w; x++) {
        const idx = (y*w + x)*4;
        const pix: [number,number,number] = [d[idx], d[idx+1], d[idx+2]];
        const parity = (Math.floor(x/ts) + Math.floor(y/ts)) & 1;
        const expect = parity ? c1 : c2;
        if (deltaE(pix, expect) < 12) matches++;
        total++;
      }
    }
    bestScore = Math.max(bestScore, matches/total);
  }
  const isChecker = bestScore > 0.55; // slightly relaxed
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

function floodFillAlphaFromBorders(imageData: ImageData, width: number, height: number, isBg: (r:number,g:number,b:number,a:number)=>boolean) {
  const data = imageData.data;
  const visited = new Uint8Array(width*height);
  const q: number[] = [];
  // seed from all border pixels
  const push = (x:number,y:number) => {
    const idx = y*width + x;
    if (visited[idx]) return;
    const p = idx*4;
    const r=data[p], g=data[p+1], b=data[p+2], a=data[p+3];
    if (isBg(r,g,b,a)) {
      q.push(idx);
      visited[idx]=1;
    }
  };
  for (let x=0;x<width;x++){ push(x,0); push(x,height-1); }
  for (let y=0;y<height;y++){ push(0,y); push(width-1,y); }
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  while(q.length){
    const idx = q.shift()!;
    const p = idx*4;
    data[p+3] = 0; // make transparent
    const x = idx % width;
    const y = Math.floor(idx/width);
    for (const [dx,dy] of dirs){
      const nx = x+dx, ny=y+dy;
      if (nx<0||ny<0||nx>=width||ny>=height) continue;
      const nidx = ny*width + nx;
      if (visited[nidx]) continue;
      const np = nidx*4;
      const nr=data[np], ng=data[np+1], nb=data[np+2], na=data[np+3];
      if (isBg(nr,ng,nb,na)){
        visited[nidx]=1;
        q.push(nidx);
      }
    }
  }
}

// Color utilities: Lab distance for robust comparison
function rgb2lab([r,g,b]: [number,number,number]): [number,number,number]{
  // sRGB to XYZ
  const srgb = [r,g,b].map(v => v/255).map(v => v <= 0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4));
  const x = (0.4124*srgb[0] + 0.3576*srgb[1] + 0.1805*srgb[2]) / 0.95047;
  const y = (0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2]) / 1.00000;
  const z = (0.0193*srgb[0] + 0.1192*srgb[1] + 0.9505*srgb[2]) / 1.08883;
  const f = (t:number) => t > 0.008856 ? Math.pow(t, 1/3) : (7.787*t + 16/116);
  const fx=f(x), fy=f(y), fz=f(z);
  return [116*fy - 16, 500*(fx - fy), 200*(fy - fz)];
}

function deltaE(a: [number,number,number], b: [number,number,number]): number {
  const la = rgb2lab(a), lb = rgb2lab(b);
  const dl = la[0]-lb[0], da=la[1]-lb[1], db=la[2]-lb[2];
  return Math.sqrt(dl*dl + da*da + db*db);
}

function kmeans2(samples: [number,number,number][]): { c1: [number,number,number]; c2: [number,number,number] }{
  let c1 = medianColor(samples);
  let c2 = medianColor(samples.filter(c => deltaE(c, c1) > 10));
  if (!c2) c2 = [255-c1[0], 255-c1[1], 255-c1[2]] as [number,number,number];
  for (let iter=0; iter<6; iter++){
    const g1: [number,number,number][] = [], g2: [number,number,number][] = [];
    for (const s of samples){
      (deltaE(s,c1) < deltaE(s,c2) ? g1 : g2).push(s);
    }
    if (g1.length) c1 = meanColor(g1);
    if (g2.length) c2 = meanColor(g2);
  }
  return { c1, c2 };
}

function meanColor(arr: [number,number,number][]): [number,number,number]{
  const n = arr.length || 1;
  const s = arr.reduce((acc,c)=>[acc[0]+c[0], acc[1]+c[1], acc[2]+c[2]],[0,0,0]);
  return [Math.round(s[0]/n), Math.round(s[1]/n), Math.round(s[2]/n)];
}


