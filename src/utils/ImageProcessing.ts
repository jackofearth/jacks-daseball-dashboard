const ALGO_VERSION = 'v6-scaleonly';

export async function processLogoFileToPngWithAlpha(file: File): Promise<string> {
  // Simple cache by file identity (name+size+mtime)
  const cacheKey = `processed:${ALGO_VERSION}:${file.name}:${file.size}:${(file as any).lastModified || ''}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
  } catch {}

  const img = await loadImageFromFile(file);
  // Scale-only: no background removal
  const result = canvasToDataUrlFromImage(img);
  try { localStorage.setItem(cacheKey, result); } catch {}
  return result;
}

export function clearProcessedLogoCache(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('processed:')) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
  } catch {}
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

function canvasToDataUrlFromImage(img: HTMLImageElement): string {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const maxDim = 1024;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  const outW = Math.max(1, Math.round(w * scale));
  const outH = Math.max(1, Math.round(h * scale));
  const { canvas, ctx } = createCanvas(outW, outH);
  ctx.drawImage(img, 0, 0, outW, outH);
  return canvas.toDataURL('image/png');
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

function detectBorderBackgroundColors(img: HTMLImageElement): { bg1: [number,number,number]; bg2: [number,number,number] } {
  const w = 128, h = 128;
  const { canvas, ctx } = createCanvas(w, h);
  ctx.drawImage(img, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  // sample a border strip (5% thickness)
  const t = Math.max(2, Math.floor(Math.min(w,h) * 0.05));
  const samplesAll: [number,number,number][] = [];
  const samplesGray: [number,number,number][] = [];
  const push = (x:number,y:number) => {
    const idx = (y*w + x)*4;
    const rgb: [number,number,number] = [d[idx], d[idx+1], d[idx+2]];
    samplesAll.push(rgb);
    if (isNearGray(rgb, 25) || lowSaturation(rgb, 0.18)) samplesGray.push(rgb);
  };
  for (let x=0; x<w; x++) { for (let y=0; y<t; y++) push(x,y); for (let y=h-t; y<h; y++) push(x,y); }
  for (let y=t; y<h-t; y++) { for (let x=0; x<t; x++) push(x,y); for (let x=w-t; x<w; x++) push(x,y); }
  // Prefer clustering only near-gray/low-sat border pixels to avoid sampling logo colors
  const base = samplesGray.length >= 100 ? samplesGray : samplesAll;
  const { c1, c2 } = kmeans2(base);
  // ensure lighter is first for stability
  const lum = (c:[number,number,number]) => 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];
  const [bg1, bg2] = lum(c1) >= lum(c2) ? [c1, c2] as const : [c2, c1] as const;
  return { bg1, bg2 };
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

function floodFillAlphaFromBorders(imageData: ImageData, width: number, height: number, isBg: (r:number,g:number,b:number,a:number)=>boolean, protectedMask?: Uint8Array) {
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
    if (!protectedMask || !protectedMask[idx]) {
      data[p+3] = 0; // make transparent
    }
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

function floodFillAllBgRegions(imageData: ImageData, width: number, height: number, isBg: (r:number,g:number,b:number,a:number)=>boolean) {
  const data = imageData.data;
  const visited = new Uint8Array(width*height);
  const q: number[] = [];
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  for (let y=0; y<height; y++) {
    for (let x=0; x<width; x++) {
      const idx = y*width + x;
      if (visited[idx]) continue;
      const p = idx*4;
      const r=data[p], g=data[p+1], b=data[p+2], a=data[p+3];
      if (!isBg(r,g,b,a)) { visited[idx]=1; continue; }
      // BFS this bg blob
      q.push(idx); visited[idx]=1;
      while(q.length){
        const id = q.shift()!;
        const pp = id*4;
        data[pp+3] = 0;
        const ix = id % width, iy = Math.floor(id/width);
        for (const [dx,dy] of dirs){
          const nx = ix+dx, ny=iy+dy;
          if (nx<0||ny<0||nx>=width||ny>=height) continue;
          const nid = ny*width + nx;
          if (visited[nid]) continue;
          const np = nid*4;
          const nr=data[np], ng=data[np+1], nb=data[np+2], na=data[np+3];
          if (isBg(nr,ng,nb,na)) { visited[nid]=1; q.push(nid); }
        }
      }
    }
  }
}

function removeInteriorBackgroundIslands(imageData: ImageData, width: number, height: number, bg1: [number,number,number], bg2: [number,number,number], tol: number) {
  const data = imageData.data;
  const isBgColor = (r:number,g:number,b:number) => {
    const p: [number,number,number] = [r,g,b];
    // protect strong whites from removal unless extremely close to bg
    if (luminance(p) > 0.9 && lowSaturation(p, 0.08)) {
      return false; // never treat strong whites as background here
    }
    // Only consider near-gray tones around the bg colors
    if (!isNearGray(p, 30) && !lowSaturation(p, 0.15)) return false;
    return deltaE(p, bg1) < 10 || deltaE(p, bg2) < 10;
  };
  const neighborhood = 2; // 5x5
  for (let y = neighborhood; y < height - neighborhood; y++) {
    for (let x = neighborhood; x < width - neighborhood; x++) {
      const idx = (y*width + x)*4;
      if (data[idx+3] === 0) continue; // already transparent
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      if (!isBgColor(r,g,b)) continue;
      // Local majority check: if most neighbors are bg-like, treat as interior background
      let bgCount = 0, total = 0;
      for (let dy=-neighborhood; dy<=neighborhood; dy++) {
        for (let dx=-neighborhood; dx<=neighborhood; dx++) {
          const n = ((y+dy)*width + (x+dx))*4;
          const nr = data[n], ng = data[n+1], nb = data[n+2];
          if (isBgColor(nr,ng,nb)) bgCount++;
          total++;
        }
      }
      if (bgCount/total > 0.7) {
        data[idx+3] = 0;
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

function isNearGray([r,g,b]: [number,number,number], tol: number): boolean {
  return Math.abs(r-g) < tol && Math.abs(g-b) < tol && Math.abs(r-b) < tol;
}

function lowSaturation([r,g,b]: [number,number,number], threshold: number): boolean {
  // quick HSV saturation
  const max = Math.max(r,g,b)/255;
  const min = Math.min(r,g,b)/255;
  const s = max === 0 ? 0 : (max - min) / max;
  return s <= threshold;
}

function luminance([r,g,b]: [number,number,number]): number {
  return (0.2126*r + 0.7152*g + 0.0722*b) / 255;
}

function removeSmallForegroundComponents(imageData: ImageData, width: number, height: number, minAreaRatio: number) {
  const data = imageData.data;
  const visited = new Uint8Array(width*height);
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const minArea = Math.max(800, Math.floor(width*height*minAreaRatio));
  const components: { pixels: number[]; area: number }[] = [];
  const q: number[] = [];
  for (let y=0; y<height; y++) {
    for (let x=0; x<width; x++) {
      const idx = y*width + x;
      const p = idx*4;
      if (visited[idx] || data[p+3] === 0) { visited[idx]=1; continue; }
      // BFS component
      let area = 0;
      const pixels: number[] = [];
      q.push(idx); visited[idx]=1;
      while(q.length){
        const id = q.shift()!; pixels.push(id); area++;
        const ix = id % width, iy = Math.floor(id/width);
        for (const [dx,dy] of dirs){
          const nx = ix+dx, ny=iy+dy;
          if (nx<0||ny<0||nx>=width||ny>=height) continue;
          const nid = ny*width + nx;
          if (visited[nid]) continue;
          const np = nid*4;
          if (data[np+3] === 0) { visited[nid]=1; continue; }
          visited[nid]=1; q.push(nid);
        }
      }
      components.push({ pixels, area });
    }
  }
  // Keep the two largest components, drop tiny ones
  components.sort((a,b)=>b.area-a.area);
  const keep = new Set<number>([0,1]);
  const maxArea = components.length ? components[0].area : 0;
  components.forEach((c, idx) => {
    if (keep.has(idx)) return;
    if (c.area < minArea && c.area < maxArea * 0.02) {
      for (const id of c.pixels) data[id*4 + 3] = 0;
    }
  });
}

function computeEdgeWhiteProtectionMask(imageData: ImageData, width: number, height: number): Uint8Array {
  const data = imageData.data;
  const mask = new Uint8Array(width*height);
  // Simple Sobel edge magnitude on luminance
  const lum = new Float32Array(width*height);
  for (let y=0; y<height; y++) {
    for (let x=0; x<width; x++) {
      const i = y*width + x; const p = i*4;
      lum[i] = 0.2126*data[p] + 0.7152*data[p+1] + 0.0722*data[p+2];
    }
  }
  const gxK = [-1,0,1,-2,0,2,-1,0,1];
  const gyK = [-1,-2,-1,0,0,0,1,2,1];
  const mag = new Float32Array(width*height);
  for (let y=1; y<height-1; y++) {
    for (let x=1; x<width-1; x++) {
      let gx=0, gy=0, k=0;
      for (let dy=-1; dy<=1; dy++) {
        for (let dx=-1; dx<=1; dx++, k++) {
          const v = lum[(y+dy)*width + (x+dx)];
          gx += gxK[k]*v; gy += gyK[k]*v;
        }
      }
      mag[y*width+x] = Math.hypot(gx, gy);
    }
  }
  // Protect bright whites near edges
  const edgeThresh = 110; // slightly lower to protect more whites near edges
  for (let y=1; y<height-1; y++) {
    for (let x=1; x<width-1; x++) {
      const idx = y*width + x; const p = idx*4;
      const rgb: [number,number,number] = [data[p], data[p+1], data[p+2]];
      if (luminance(rgb) > 0.90 && lowSaturation(rgb, 0.12) && mag[idx] > edgeThresh) {
        mask[idx] = 1;
      }
    }
  }
  return mask;
}

function computeAdjacencyWhiteProtectionMask(imageData: ImageData, width: number, height: number, radius: number): Uint8Array {
  const data = imageData.data;
  const mask = new Uint8Array(width*height);
  const isBgLike = (rgb:[number,number,number]) => lowSaturation(rgb, 0.25) || isNearGray(rgb, 35);
  for (let y=0; y<height; y++) {
    for (let x=0; x<width; x++) {
      const idx = y*width + x; const p = idx*4;
      const rgb:[number,number,number] = [data[p], data[p+1], data[p+2]];
      if (!(luminance(rgb) > 0.9 && lowSaturation(rgb, 0.12))) continue;
      let touchesStrong = false;
      for (let dy=-radius; dy<=radius && !touchesStrong; dy++) {
        for (let dx=-radius; dx<=radius && !touchesStrong; dx++) {
          const nx=x+dx, ny=y+dy; if (nx<0||ny<0||nx>=width||ny>=height) continue;
          const n = (ny*width + nx)*4;
          const nRGB:[number,number,number] = [data[n], data[n+1], data[n+2]];
          if (!isBgLike(nRGB)) touchesStrong = true;
        }
      }
      if (touchesStrong) mask[idx]=1;
    }
  }
  return mask;
}

function dilateMask(src: Uint8Array, width: number, height: number, iterations: number): Uint8Array {
  let out = new Uint8Array(src);
  for (let it=0; it<iterations; it++) {
    const next = new Uint8Array(out);
    for (let y=1; y<height-1; y++) {
      for (let x=1; x<width-1; x++) {
        const idx = y*width+x;
        if (out[idx]) { next[idx]=1; continue; }
        if (out[idx-1]||out[idx+1]||out[idx-width]||out[idx+width]||out[idx-width-1]||out[idx-width+1]||out[idx+width-1]||out[idx+width+1]) next[idx]=1;
      }
    }
    out = next;
  }
  return out;
}

function orMasks(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length);
  for (let i=0; i<a.length; i++) out[i] = a[i] || b[i] ? 1 : 0;
  return out;
}

function simpleClearEnclosedBackground(imageData: ImageData, width: number, height: number, isBgLike: (r:number,g:number,b:number,a:number)=>boolean) {
  const data = imageData.data;
  // Build bg-like mask
  const mask = new Uint8Array(width*height);
  for (let y=0; y<height; y++) {
    for (let x=0; x<width; x++) {
      const idx = y*width + x; const p = idx*4;
      if (isBgLike(data[p], data[p+1], data[p+2], data[p+3])) mask[idx]=1;
    }
  }
  // Mark border-connected bg-like regions
  const keep = new Uint8Array(width*height);
  const q:number[] = [];
  const enqueue = (ix:number,iy:number) => { const id=iy*width+ix; if (!mask[id] || keep[id]) return; keep[id]=1; q.push(id); };
  for (let x=0;x<width;x++){ enqueue(x,0); enqueue(x,height-1);} 
  for (let y=0;y<height;y++){ enqueue(0,y); enqueue(width-1,y);} 
  const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
  while(q.length){ const id=q.shift()!; const ix=id%width, iy=Math.floor(id/width);
    for (const [dx,dy] of dirs){ const nx=ix+dx, ny=iy+dy; if (nx<0||ny<0||nx>=width||ny>=height) continue; const nid=ny*width+nx; if (mask[nid] && !keep[nid]) { keep[nid]=1; q.push(nid);} }
  }
  // Clear enclosed bg-like regions (mask=1 and keep=0)
  for (let i=0;i<width*height;i++){ if (mask[i] && !keep[i]) { data[i*4+3]=0; } }
}

function removeEnclosedBackgroundLikeRegions(imageData: ImageData, width: number, height: number, bg1: [number,number,number], bg2: [number,number,number], protectedMask?: Uint8Array) {
  const data = imageData.data;
  const visited = new Uint8Array(width*height);
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const q: number[] = [];
  const isCandidate = (r:number,g:number,b:number,a:number) => {
    if (a === 0) return false;
    const p: [number,number,number] = [r,g,b];
    if (luminance(p) > 0.9 && lowSaturation(p, 0.08)) return false; // protect strong whites
    return lowSaturation(p, 0.18) || isNearGray(p, 26);
  };
  for (let y=0; y<height; y++) {
    for (let x=0; x<width; x++) {
      const idx = y*width + x;
      if (visited[idx]) continue;
      const p = idx*4;
      const r=data[p], g=data[p+1], b=data[p+2], a=data[p+3];
      if (!isCandidate(r,g,b,a)) { visited[idx]=1; continue; }
      // BFS region
      let touchesBorder = (x===0||y===0||x===width-1||y===height-1);
      let sum:[number,number,number]=[0,0,0];
      let count = 0;
      const pixels:number[] = [];
      const coords:number[] = [];
      q.push(idx); visited[idx]=1;
      while(q.length){
        const id = q.shift()!; pixels.push(id);
        const pp = id*4;
        const rr=data[pp], gg=data[pp+1], bb=data[pp+2];
        sum[0]+=rr; sum[1]+=gg; sum[2]+=bb; count++;
        const ix = id % width, iy = Math.floor(id/width);
        if (ix===0||iy===0||ix===width-1||iy===height-1) touchesBorder = true;
        coords.push(ix, iy);
        for (const [dx,dy] of dirs){
          const nx=ix+dx, ny=iy+dy;
          if (nx<0||ny<0||nx>=width||ny>=height) continue;
          const nid = ny*width + nx;
          if (visited[nid]) continue;
          const np = nid*4;
          const nr=data[np], ng=data[np+1], nb=data[np+2], na=data[np+3];
          if (!isCandidate(nr,ng,nb,na)) { visited[nid]=1; continue; }
          visited[nid]=1; q.push(nid);
        }
      }
      if (!touchesBorder && count>9) {
        const avg:[number,number,number]=[Math.round(sum[0]/count),Math.round(sum[1]/count),Math.round(sum[2]/count)];
        // fraction of pixels close to bg
        let close=0;
        for (const id of pixels){
          const pp = id*4; const pr=data[pp], pg=data[pp+1], pb=data[pp+2];
          if (deltaE([pr,pg,pb] as any, bg1) < 16 || deltaE([pr,pg,pb] as any, bg2) < 16) close++;
        }
        const frac = close / pixels.length;
        const parityScore = computeCheckerParityScore(coords, pixels, data, width, bg1, bg2);
        if (frac > 0.72 && parityScore > 0.60 && (deltaE(avg,bg1) < 16 || deltaE(avg,bg2) < 16)) {
          for (const id of pixels) {
            if (!protectedMask || !protectedMask[id]) data[id*4+3]=0;
          }
        }
      }
    }
  }
}

function computeCheckerParityScore(coords: number[], pixels: number[], data: Uint8ClampedArray, width: number, bg1: [number,number,number], bg2: [number,number,number]): number {
  // Expect alternating 4x4 tiles of bg1/bg2
  if (pixels.length === 0) return 0;
  let matches = 0;
  for (let i=0, ci=0; i<pixels.length; i++, ci+=2){
    const x = coords[ci];
    const y = coords[ci+1];
    const parity = ((x>>2) + (y>>2)) & 1;
    const id = pixels[i]*4;
    const p:[number,number,number] = [data[id], data[id+1], data[id+2]];
    const d1 = deltaE(p, bg1);
    const d2 = deltaE(p, bg2);
    if (parity ? (d1 < d2 && d1 < 16) : (d2 < d1 && d2 < 16)) matches++;
  }
  return matches / pixels.length;
}

function finalizeByConnectivity(imageData: ImageData, width: number, height: number, bg1: [number,number,number], bg2: [number,number,number], _protectedMask?: Uint8Array) {
  // Note: protectedMask handled earlier; here we only drop tiny components
  const data = imageData.data;
  // 1) Build background mask using learned bg colors with conservative thresholds
  const bgMask = new Uint8Array(width*height);
  for (let y=0; y<height; y++) {
    for (let x=0; x<width; x++) {
      const idx = y*width + x; const p = idx*4;
      const r=data[p], g=data[p+1], b=data[p+2], a=data[p+3];
      if (a === 0) { bgMask[idx]=1; continue; }
      const rgb:[number,number,number] = [r,g,b];
      // background if low-sat/near-gray AND close to bg1/bg2
      if ((lowSaturation(rgb, 0.20) || isNearGray(rgb, 30)) && (deltaE(rgb,bg1) < 14 || deltaE(rgb,bg2) < 14)) {
        bgMask[idx] = 1;
      }
    }
  }
  // 2) Keep only background regions connected to border; others => transparent
  const keepBg = new Uint8Array(width*height);
  const q:number[] = [];
  const push = (ix:number, iy:number) => {
    const id = iy*width + ix; if (keepBg[id] || !bgMask[id]) return; keepBg[id]=1; q.push(id);
  };
  for (let x=0; x<width; x++){ push(x,0); push(x,height-1);} 
  for (let y=0; y<height; y++){ push(0,y); push(width-1,y);} 
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  while(q.length){
    const id = q.shift()!; const ix = id % width, iy = Math.floor(id/width);
    for (const [dx,dy] of dirs){ const nx=ix+dx, ny=iy+dy; if (nx<0||ny<0||nx>=width||ny>=height) continue; const nid=ny*width+nx; if (!keepBg[nid] && bgMask[nid]) { keepBg[nid]=1; q.push(nid);} }
  }
  for (let i=0; i<width*height; i++) {
    if (bgMask[i] && !keepBg[i]) { data[i*4+3] = 0; }
  }
  // 3) Foreground components: keep enough largest to reach 98% of area (handles multi-part logos), drop tiny fragments (e.g., TM)
  const visited = new Uint8Array(width*height);
  const comps: { pixels:number[]; area:number }[] = [];
  for (let y=0; y<height; y++) {
    for (let x=0; x<width; x++) {
      const idx = y*width + x; const p = idx*4; 
      if (visited[idx] || data[p+3] === 0 || bgMask[idx]) { visited[idx]=1; continue; }
      const pixels:number[] = []; const qq:number[] = [idx]; visited[idx]=1;
      while(qq.length){
        const id = qq.shift()!; pixels.push(id);
        const ix = id % width, iy = Math.floor(id/width);
        for (const [dx,dy] of dirs){ const nx=ix+dx, ny=iy+dy; if (nx<0||ny<0||nx>=width||ny>=height) continue; const nid=ny*width+nx; if (visited[nid]) continue; const np=nid*4; if (data[np+3]===0 || bgMask[nid]) { visited[nid]=1; continue; } visited[nid]=1; qq.push(nid);} 
      }
      comps.push({ pixels, area: pixels.length });
    }
  }
  comps.sort((a,b)=>b.area-a.area);
  const totalArea = comps.reduce((s,c)=>s+c.area, 0);
  let kept = 0; let cutoff = comps.length;
  for (let i=0; i<comps.length; i++) { kept += comps[i].area; if (kept/Math.max(1,totalArea) >= 0.98 || i>=5) { cutoff=i+1; break; } }
  for (let i=cutoff; i<comps.length; i++) {
    const c = comps[i];
    if (c.area < (comps[0]?.area || 0) * 0.01) {
      for (const id of c.pixels) data[id*4+3] = 0;
    }
  }
}


