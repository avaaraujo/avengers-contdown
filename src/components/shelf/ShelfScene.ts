import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { dotDate, hm, thumb } from '@/lib/format';

export type Rect = { l: number; t: number; r: number; b: number };
export type ShelfFilm = { n: number; title: string; year: number; runtime: number; cover: string; phase: number };

/** one lacquer per MCU phase; the premiere belongs to the last one */
export const PHASE_COLORS: Record<number, number> = { 1: 0xb3141c, 2: 0x1f5fae, 3: 0x6a2fa0, 4: 0x0d7c78, 5: 0xc25a10, 6: 0xb0246b };
const LAST_PHASE = 6;
export type ShelfFinale = { n: number; title: string; cover: string; premiereAt: number };
export type ShelfCallbacks = {
  onReady(): void;
  onHover(n: number | null, x: number, y: number): void;
  onPick(n: number): void;
  /** the opened spread lies flat: the HTML page takes over from this rect */
  onHandoff(n: number, rect: Rect): void;
  onTrackHeight(px: number): void;
};

type Item = {
  n: number; tag: string; g: THREE.Group; pages: THREE.Mesh; cover: THREE.Mesh; coverPivot: THREE.Group;
  bag: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>; stamp: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  front: THREE.MeshStandardMaterial; label: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  watched: boolean; sat: number; bagOff: number; stampPop: number; hover: number; sel: number; open: number; isNext: boolean;
  home: THREE.Vector3;
};
type Uniforms = { uSat: { value: number }; uBright: { value: number } };

const W = 1, H = 1.52, T = 0.022, CT = 0.006, GX = 0.36, RH = H + 0.62;
const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

type RedrawTex = THREE.CanvasTexture & { userData: { redraw: (fn: (g: CanvasRenderingContext2D, w: number, h: number) => void) => void } };
function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void): RedrawTex {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d')!; draw(g, w, h);
  const t = new THREE.CanvasTexture(c) as RedrawTex; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  t.userData.redraw = fn => { g.clearRect(0, 0, w, h); fn(g, w, h); t.needsUpdate = true; };
  return t;
}

/**
 * The comic-book shelf: a wall of lacquered ledges holding one comic per film, in watch order.
 * Imperative three.js, driven by the React app through this small API.
 */
export class ShelfScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  private key = new THREE.DirectionalLight(0xffe9cc, 2.8);
  private shelf = new THREE.Group();
  private items: Item[] = [];
  private wall: THREE.Mesh | null = null;
  private ledges: THREE.Mesh[] = [];
  /** the Nº on each shelf slot, left to right and top to bottom; empty means story order */
  private order: number[] = [];
  private ray = new THREE.Raycaster();
  private pointer = new THREE.Vector2(9, 9);
  private pointerPx = { x: 0, y: 0 };
  private hovered: number | null = null;
  private selected: number | null = null;
  private pageShown = false;
  private closing = false;
  private watched = new Set<number>();
  private nextN: number | null = null;
  private cols = 8; private rows = 1; private shelfW = 1; private pxPerWorld = 100; private camZ = 10; private camBaseY = 0; private scrollRangeWorld = 0;
  private insets = { top: 200, bottom: 160 };
  private camX = 0; private camYOff = 0; private frame = 0; private simT = 0; private last = performance.now();
  private raf = 0;
  private font: string;
  private reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  private disposed = false;
  /** phones and tablets: smaller textures, no MSAA/transmission/clearcoat, lower pixel ratio, throttled frames */
  private lite = matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 600;
  private activeUntil = 0; private lastScrollY = -1; private shadowTick = 0;

  constructor(private canvas: HTMLCanvasElement, private films: ShelfFilm[], private finaleData: ShelfFinale, private cb: ShelfCallbacks) {
    this.font = getComputedStyle(document.body).getPropertyValue('--font-archivo').trim() || 'sans-serif';
    const lite = this.lite;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, powerPreference: lite ? 'default' : 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, lite ? 1.5 : 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.needsUpdate = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoftShadowMap was removed from three.js
    if (lite) this.renderer.shadowMap.autoUpdate = false; // re-rendered every other frame, see update()

    const s = this.scene;
    s.background = new THREE.Color(0x121318);
    s.fog = new THREE.Fog(0x121318, 14, 26);
    s.environment = new THREE.PMREMGenerator(this.renderer).fromScene(new RoomEnvironment(), 0.04).texture;
    s.environmentIntensity = 0.35;
    s.add(new THREE.HemisphereLight(0xfff1dd, 0x101018, 0.6));
    const key = this.key;
    key.castShadow = true; key.shadow.mapSize.set(lite ? 1024 : 2048, lite ? 1024 : 2048); key.shadow.bias = -0.0004; key.shadow.radius = 4;
    Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 0.5, far: 30 }); key.shadow.camera.updateProjectionMatrix();
    s.add(key, key.target);
    const rim = new THREE.DirectionalLight(0x9fb4ff, 0.35); rim.position.set(6, -2, 4); s.add(rim);
    s.add(this.shelf);

    this.wake();
    addEventListener('pointermove', this.onPointerMove);
    addEventListener('click', this.onClick);
    document.addEventListener('pointerleave', this.onLeave);
    addEventListener('resize', this.onResize);
    void this.build();
  }

  /* ---------- public API ---------- */
  setWatched(set: Set<number>, nextN: number | null) {
    this.wake();
    this.watched = new Set(set);
    for (const it of this.items) it.watched = set.has(it.n);
    if (nextN !== this.nextN) { this.nextN = nextN; this.redrawLabels(); }
  }
  /** pop the VISTO! stamp on a comic sitting on the shelf */
  popStamp(n: number) { this.wake(); const it = this.items[n - 1]; if (it) it.stampPop = 1; }
  /** rearrange the shelf: the comics glide to their new slots */
  setOrder(order: number[]) {
    this.wake();
    this.order = order;
    if (this.items.length) { this.layout(); this.redrawLabels(); }
  }
  private nAt(slot: number) { return this.order[slot] ?? slot + 1; }
  private slotOf(n: number) { const i = this.order.indexOf(n); return i < 0 ? n - 1 : i; }
  setInsets(top: number, bottom: number) { this.insets = { top, bottom }; this.layout(); }
  /** take a comic off the shelf and open it; before the shelf is built the page hands off right away */
  open(n: number) {
    this.wake();
    this.selected = n;
    this.cb.onHover(null, 0, 0);
    if (!this.items[n - 1]) { this.pageShown = true; this.cb.onHandoff(n, this.centerRect()); }
  }
  /** the issue the shelf has taken down, if any */
  get current() { return this.selected; }
  /** a direct link: the page already covers the canvas, so the comic is simply taken off the shelf behind it */
  openInstant(n: number) {
    this.goTo(n);
    this.pageShown = true;
    this.cb.onHover(null, 0, 0);
  }
  /** swap the issue while the page covers the canvas */
  goTo(n: number) {
    this.wake();
    const old = this.items[(this.selected ?? 0) - 1];
    if (old) { old.sel = 0; old.open = 0; old.g.position.copy(old.home); old.coverPivot.rotation.y = 0; }
    this.selected = n;
    const it = this.items[n - 1];
    if (it) { it.sel = 1; it.open = 1; }
  }
  /** the page starts shrinking: render again and return the rect it should shrink into */
  beginClose(): Rect {
    this.wake();
    this.closing = true; this.pageShown = false;
    this.update(0);
    const it = this.items[(this.selected ?? 0) - 1];
    return it ? this.spreadRect(it) : this.centerRect();
  }
  /** the page is gone: close the cover and put the comic back */
  release() { this.wake(); this.selected = null; this.closing = false; this.pageShown = false; }
  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    removeEventListener('pointermove', this.onPointerMove);
    removeEventListener('click', this.onClick);
    document.removeEventListener('pointerleave', this.onLeave);
    removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
  /** a frame-rate hint for the lite mode: render at full pace for a moment, then idle slowly */
  private wake() { this.activeUntil = performance.now() + 1600; }
  /** testing aid: advance the animation without requestAnimationFrame */
  settle(frames = 90) { for (let i = 0; i < frames; i++) this.update(1 / 30); }

  /* ---------- build ---------- */
  private shadedMaterial(tex: THREE.Texture | null) {
    const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.62 });
    const u: Uniforms = { uSat: { value: 0.12 }, uBright: { value: 0.42 } };
    m.userData.u = u;
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, u);
      sh.fragmentShader = 'uniform float uSat; uniform float uBright;\n' + sh.fragmentShader.replace('#include <map_fragment>',
        '#include <map_fragment>\n float gL = dot(diffuseColor.rgb, vec3(.299,.587,.114));\n diffuseColor.rgb = mix(vec3(gL), diffuseColor.rgb, uSat) * uBright;');
    };
    return m;
  }
  private stampTexture() {
    return canvasTex(512, 240, (g, w, h) => {
      g.translate(w / 2, h / 2); g.rotate(-0.12);
      g.strokeStyle = '#e2231a'; g.lineWidth = 14; g.lineJoin = 'round'; g.strokeRect(-210, -82, 420, 164);
      g.lineWidth = 4; g.strokeRect(-194, -66, 388, 132);
      g.fillStyle = '#e2231a'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `900 112px ${this.font}`; g.fillText('VISTO!', 0, 8);
      g.globalCompositeOperation = 'destination-out';
      let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 260; i++) { g.beginPath(); g.arc((rnd() - 0.5) * 440, (rnd() - 0.5) * 180, rnd() * 3.2, 0, 7); g.fill(); }
    });
  }
  /** the first inside page: a sketch of the panel layout the detail screen opens into */
  private innerPageTexture() {
    return canvasTex(640, 973, (g, w, h) => {
      g.fillStyle = '#efe3c8'; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(120,84,30,.10)';
      for (let y = 0; y < h; y += 6) for (let x = ((y / 6) % 2) * 3; x < w; x += 6) g.fillRect(x, y, 1.6, 1.6);
      const m = 22, gap = 16, ink = '#111';
      const panel = (x: number, y: number, pw: number, ph: number, fill: string) => { g.fillStyle = fill; g.fillRect(x, y, pw, ph); g.lineWidth = 7; g.strokeStyle = ink; g.strokeRect(x, y, pw, ph); };
      let y = m;
      panel(m, y, w - 2 * m, 200, '#f7c600');
      g.fillStyle = 'rgba(17,17,17,.55)'; for (let i = 0; i < 6; i++) g.fillRect(m + 26, y + 36 + i * 26, (w - 2 * m - 52) * (i === 5 ? 0.6 : 1), 9);
      y += 200 + gap;
      panel(m, y, w - 2 * m, 250, '#fbf4e4');
      g.save(); g.translate(m + 100, y + 125); g.beginPath();
      for (let i = 0; i < 32; i++) { const a = (i / 32) * Math.PI * 2, r = i % 2 ? 50 : 82; g.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.8); }
      g.closePath(); g.fillStyle = '#f7c600'; g.fill(); g.lineWidth = 4; g.stroke(); g.restore();
      for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? '#1d5fb4' : '#e2231a'; g.fillRect(m + 210, y + 30 + i * 44, 300 - i * 30, 14); g.fillStyle = 'rgba(17,17,17,.7)'; g.fillRect(m + 210, y + 58 + i * 44, w - 2 * m - 232, 3); }
      y += 250 + gap;
      panel(m, y, w - 2 * m, 170, '#ffffff');
      for (let i = 0; i < 3; i++) { g.lineWidth = 5; g.strokeRect(m + 30 + i * 170, y + 70, 150, 54); g.fillStyle = ['#0b2a4a', '#e50914', '#1a1a1a'][i]; g.fillRect(m + 38 + i * 170, y + 78, 38, 38); }
      g.fillStyle = ink; g.fillRect(m + 30, y + 28, 300, 18); y += 170 + gap;
      const ah = h - y - m - 110 - gap;
      panel(m, y, w - 2 * m, ah, '#e2231a');
      g.fillStyle = 'rgba(0,0,0,.22)';
      for (let yy = y + 6; yy < y + ah; yy += 10) for (let x = m + 6 + ((yy / 10) % 2) * 5; x < w - m; x += 10) { g.beginPath(); g.arc(x, yy, 2.6, 0, 7); g.fill(); }
      g.save(); g.translate(w * 0.38, y + ah / 2); g.beginPath();
      for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2, r = i % 2 ? 70 : 110; g.lineTo(Math.cos(a) * r * 1.5, Math.sin(a) * r * 0.6); }
      g.closePath(); g.fillStyle = '#f7c600'; g.fill(); g.lineWidth = 5; g.strokeStyle = ink; g.stroke(); g.restore();
      g.beginPath(); g.ellipse(w - m - 100, y + ah / 2, 70, 46, 0, 0, 7); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 5; g.stroke();
      y += ah + gap;
      panel(m, y, (w - 2 * m - gap) / 2, 110, '#f7c600'); panel(m + (w - 2 * m + gap) / 2, y, (w - 2 * m - gap) / 2, 110, '#f7c600');
    });
  }
  /** Nº on the left; the runtime (or, for the premiere, its date) on the right */
  private phaseOf(n: number) { return n === this.finaleData.n ? LAST_PHASE : this.films[n - 1]?.phase || LAST_PHASE; }
  private ledgeLabelDraw(n: number, tag: string, isNext: boolean) {
    return (g: CanvasRenderingContext2D, w: number, h: number) => {
      if (isNext) { g.fillStyle = '#f2c200'; g.fillRect(0, 0, w, h); }
      g.fillStyle = isNext ? '#121318' : '#f6ece0'; g.textBaseline = 'middle';
      g.font = `900 52px ${this.font}`; g.textAlign = 'left'; g.fillText('Nº ' + n, 18, h / 2 + 2);
      g.font = `700 44px ${this.font}`; g.textAlign = 'right'; g.fillText(tag, w - 18, h / 2 + 2);
    };
  }

  private async build() {
    await document.fonts.ready;
    const loader = new THREE.TextureLoader();
    const aniso = Math.min(this.renderer.capabilities.getMaxAnisotropy(), this.lite ? 2 : 8);
    const load = (url: string) => new Promise<THREE.Texture | null>(res => loader.load(this.lite ? thumb(url) : url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; res(t); }, undefined, () => res(null)));
    const texes = await Promise.all([...this.films.map(f => load(f.cover)), load(this.finaleData.cover)]);
    if (this.disposed) return;

    const paperMat = new THREE.MeshStandardMaterial({ color: 0xe9e1d2, roughness: 0.85 });
    const bagOpts = { color: 0xffffff, transparent: true, opacity: 0.16, roughness: 0.08, depthWrite: false, envMapIntensity: 2.4 };
    const bagMat = this.lite ? new THREE.MeshStandardMaterial(bagOpts) : new THREE.MeshPhysicalMaterial({ ...bagOpts, clearcoat: 1, clearcoatRoughness: 0.05 });
    const innerMat = new THREE.MeshStandardMaterial({ map: this.innerPageTexture(), roughness: 0.9 });
    const stampTex = this.stampTexture();
    const pagesGeo = new THREE.BoxGeometry(W * 0.99, H * 0.99, T);
    const coverGeo = new THREE.BoxGeometry(W, H, CT).translate(W / 2, 0, 0); // hinged on the spine
    const bagGeo = new THREE.PlaneGeometry(W * 1.08, H * 1.05);
    const stampGeo = new THREE.PlaneGeometry(W * 0.66, W * 0.31);
    const labelGeo = new THREE.PlaneGeometry(W * 0.92, W * 0.17);

    // the premiere sits at the end of the shelf as one more issue, still in its bag
    const issues = [...this.films.map(f => ({ n: f.n, tag: hm(f.runtime) })), { n: this.finaleData.n, tag: dotDate(this.finaleData.premiereAt) }];
    issues.forEach((f, i) => {
      const front = this.shadedMaterial(texes[i]);
      const inside = new THREE.MeshStandardMaterial({ map: texes[i], roughness: 0.75 }); // the splash seen when the cover swings open
      const g = new THREE.Group();
      const pages = new THREE.Mesh(pagesGeo, [paperMat, paperMat, paperMat, paperMat, innerMat, paperMat]);
      pages.castShadow = true; pages.receiveShadow = true; pages.userData.n = f.n;
      const coverPivot = new THREE.Group(); coverPivot.position.set(-W / 2, 0, T / 2 + CT / 2 + 0.001);
      const cover = new THREE.Mesh(coverGeo, [paperMat, paperMat, paperMat, paperMat, front, inside]);
      cover.castShadow = true; cover.userData.n = f.n;
      const stamp = new THREE.Mesh(stampGeo, new THREE.MeshBasicMaterial({ map: stampTex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
      stamp.position.set(W / 2 + W * 0.12, -H * 0.3, CT / 2 + 0.002); stamp.rotation.z = 0.18;
      cover.add(stamp); coverPivot.add(cover);
      const bag = new THREE.Mesh(bagGeo, bagMat.clone()); bag.position.z = T / 2 + CT + 0.016; bag.renderOrder = 2;
      g.add(pages, coverPivot, bag); this.shelf.add(g);
      const label = new THREE.Mesh(labelGeo, new THREE.MeshBasicMaterial({ map: canvasTex(512, 96, this.ledgeLabelDraw(f.n, f.tag, false)), transparent: true, toneMapped: false }));
      this.shelf.add(label);
      const seen = this.watched.has(f.n);
      this.items.push({ n: f.n, tag: f.tag, g, pages, cover, coverPivot, bag, stamp, front, label, watched: seen,
        sat: seen ? 1 : 0, bagOff: seen ? 1 : 0, stampPop: 0, hover: 0, sel: 0, open: 0, isNext: false, home: new THREE.Vector3() });
    });

    this.layout();
    this.redrawLabels();
    this.update(0.016);
    this.cb.onReady();
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      const now = performance.now();
      if (scrollY !== this.lastScrollY) { this.lastScrollY = scrollY; this.wake(); }
      if (this.lite && now - this.last < (now < this.activeUntil ? 30 : 90)) return; // ~30fps while moving, ~11fps at rest
      this.update(Math.min((now - this.last) / 1000, 0.1));
      this.last = now;
    };
    this.raf = requestAnimationFrame(loop);
  }

  private redrawLabels() {
    for (const it of this.items) {
      it.isNext = it.n === this.nextN;
      (it.label.material.map as RedrawTex).userData.redraw(this.ledgeLabelDraw(it.n, it.tag, it.isNext));
    }
  }

  /* ---------- layout & camera ---------- */
  private layout = () => {
    if (!this.items.length) return;
    const w = innerWidth, h = innerHeight;
    const cols = (this.cols = w < 560 ? 3 : w < 900 ? 5 : w < 1300 ? 7 : 8);
    const rows = (this.rows = Math.ceil(this.items.length / cols));
    const shelfW = (this.shelfW = cols * W + (cols - 1) * GX);
    this.ledges.forEach(l => this.shelf.remove(l)); this.ledges = [];
    if (this.wall) this.shelf.remove(this.wall);
    const mats = new Map<number, THREE.MeshPhysicalMaterial>();
    const matFor = (phase: number) => {
      let m = mats.get(phase);
      if (!m) { m = new THREE.MeshPhysicalMaterial({ color: PHASE_COLORS[phase] ?? PHASE_COLORS[LAST_PHASE], roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.18 }); mats.set(phase, m); }
      return m;
    };
    this.wall = new THREE.Mesh(new THREE.PlaneGeometry(shelfW + 30, rows * RH + 30), new THREE.MeshStandardMaterial({ color: 0x17181f, roughness: 0.92 }));
    this.wall.position.set(0, (-(rows - 1) * RH) / 2, -0.32); this.wall.receiveShadow = true; this.shelf.add(this.wall);
    for (let r = 0; r < rows; r++) {
      const y = -r * RH - H / 2 - 0.05;
      // the ledge is cut into one segment under each comic, lacquered in that film's phase color
      for (let c = 0; c < cols; c++) {
        const slotN = this.nAt(Math.min(r * cols + c, this.items.length - 1));
        const mat = matFor(this.phaseOf(slotN));
        const edge = c === 0 || c === cols - 1 ? 0.35 - GX / 2 : 0;
        const segW = W + GX + edge;
        const x = -shelfW / 2 + W / 2 + c * (W + GX) + (c === 0 ? -edge / 2 : c === cols - 1 ? edge / 2 : 0);
        const ledge = new THREE.Mesh(new THREE.BoxGeometry(segW, 0.07, 0.62), mat);
        ledge.position.set(x, y, -0.02); ledge.castShadow = true; ledge.receiveShadow = true;
        const lip = new THREE.Mesh(new THREE.BoxGeometry(segW, 0.2, 0.05), mat);
        lip.position.set(x, y + 0.065, 0.3); lip.castShadow = true;
        this.shelf.add(ledge, lip); this.ledges.push(ledge, lip);
      }
    }
    const x0 = -shelfW / 2 + W / 2;
    this.items.forEach(it => {
      const slot = this.slotOf(it.n), c = slot % cols, r = Math.floor(slot / cols);
      it.home.set(x0 + c * (W + GX), -r * RH + 0.02, 0.06);
      it.label.position.set(it.home.x, -r * RH - H / 2 + 0.017, 0.33);
    });

    const cam = this.camera;
    cam.aspect = w / h; cam.updateProjectionMatrix();
    const vFov = THREE.MathUtils.degToRad(cam.fov);
    this.camZ = (shelfW + (w < 560 ? 0.5 : 1.4)) / 2 / (Math.tan(vFov / 2) * cam.aspect);
    this.pxPerWorld = h / (2 * Math.tan(vFov / 2) * this.camZ);
    const firstTop = H / 2 + 0.3, lastBottom = -(rows - 1) * RH - H / 2 - 0.35;
    this.camBaseY = firstTop - (h / 2 - this.insets.top - 8) / this.pxPerWorld;
    this.scrollRangeWorld = Math.max(0, this.camBaseY - (lastBottom + (h / 2 - this.insets.bottom - 8) / this.pxPerWorld));
    this.cb.onTrackHeight(h + this.scrollRangeWorld * this.pxPerWorld + 40);
    this.renderer.setSize(w, h, false);
  };
  private onResize = () => { clearTimeout((this as unknown as { rz: number }).rz); (this as unknown as { rz: number }).rz = window.setTimeout(this.layout, 80); };

  /* ---------- screen rects for the page hand-off ---------- */
  private rectOf(points: [number, number, number][], obj: THREE.Object3D): Rect {
    obj.updateMatrixWorld(true);
    const v = new THREE.Vector3();
    let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
    for (const [x, y, z] of points) {
      v.set(x, y, z); obj.localToWorld(v); v.project(this.camera);
      const px = ((v.x + 1) / 2) * innerWidth, py = ((1 - v.y) / 2) * innerHeight;
      l = Math.min(l, px); r = Math.max(r, px); t = Math.min(t, py); b = Math.max(b, py);
    }
    return { l, t, r, b };
  }
  private spreadRect(it: Item) { return this.rectOf([[-1.5 * W, -H / 2, T / 2], [-1.5 * W, H / 2, T / 2], [0.5 * W, -H / 2, T / 2], [0.5 * W, H / 2, T / 2]], it.g); }
  private centerRect(): Rect { return { l: innerWidth / 2 - 40, r: innerWidth / 2 + 40, t: innerHeight / 2 - 60, b: innerHeight / 2 + 60 }; }

  /* ---------- interaction ---------- */
  private overUI = (e: Event) => !!(e.target as Element | null)?.closest?.('[data-ui]');
  private onPointerMove = (e: PointerEvent) => {
    if (this.overUI(e)) { this.pointer.set(9, 9); return; }
    this.pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    this.pointerPx = { x: e.clientX, y: e.clientY };
    this.wake();
  };
  private onLeave = () => this.pointer.set(9, 9);
  private onClick = (e: MouseEvent) => {
    if (this.overUI(e) || (e.target as Element).closest('button, a, input') || this.selected !== null) return;
    // raycast at the click itself: touch has no hover, and a fast click can beat the hover frame
    this.pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    this.pointerPx = { x: e.clientX, y: e.clientY };
    this.pick();
    if (this.hovered) this.cb.onPick(this.hovered);
    if ((e as PointerEvent).pointerType !== 'mouse') this.pointer.set(9, 9);
  };
  private pick() {
    this.ray.setFromCamera(this.pointer, this.camera);
    const targets: THREE.Object3D[] = this.items.flatMap(i => [i.cover, i.pages]);
    const n = (this.ray.intersectObjects(targets, false)[0]?.object.userData.n as number | undefined) ?? null;
    const changed = n !== this.hovered;
    this.hovered = n;
    if (changed) document.body.style.cursor = n && this.selected === null ? 'pointer' : '';
    this.cb.onHover(this.selected === null ? n : null, this.pointerPx.x, this.pointerPx.y);
  }

  /* ---------- animation ---------- */
  private update(dt: number) {
    if (!this.items.length) return;
    this.simT += dt; const t = this.simT;
    const rm = this.reduceMotion, sp = rm ? 60 : 9, cam = this.camera, sel = this.selected;
    const sy = scrollY / this.pxPerWorld;
    const px = this.pointer.x < 2 && sel === null ? this.pointer.x : 0, py = this.pointer.y < 2 && sel === null ? this.pointer.y : 0;
    this.camX = damp(this.camX, rm ? 0 : px * 0.35, 3, dt);
    this.camYOff = damp(this.camYOff, rm ? 0 : py * 0.2, 3, dt);
    cam.position.set(this.camX, this.camBaseY - sy + this.camYOff, this.camZ);
    cam.lookAt(this.camX * 0.4, this.camBaseY - sy, 0);
    this.key.position.set(cam.position.x - 4, cam.position.y + 7, 9); this.key.target.position.set(0, cam.position.y - 1, 0);
    if (++this.frame % 2 === 0) this.pick();

    // where an open comic sits: centered in front of the camera, the two-page spread nearly filling the screen
    const dist = this.camZ * 0.42, dir = new THREE.Vector3();
    cam.getWorldDirection(dir);
    const stage = cam.position.clone().addScaledVector(dir, dist);
    const visH = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * dist, visW = visH * cam.aspect;
    const fit = Math.min((0.9 * visW) / (2 * W), (0.78 * visH) / H);
    const v = new THREE.Vector3();

    for (const it of this.items) {
      const isSel = sel === it.n, k = rm ? 40 : 1;
      it.open = damp(it.open, isSel && it.sel > 0.86 ? 1 : 0, 4.2 * k, dt);
      it.sel = damp(it.sel, isSel || it.open > 0.06 ? 1 : 0, 5.5 * k, dt);
      it.hover = damp(it.hover, this.hovered === it.n && sel === null ? 1 : 0, 12, dt);
      it.sat = damp(it.sat, it.watched ? 1 : 0, 4, dt);
      it.bagOff = damp(it.bagOff, it.watched || isSel ? 1 : 0, 3.2 * k, dt);
      it.stampPop = damp(it.stampPop, 0, 5, dt);
      const busy = sel !== null && !isSel ? 0.5 : 1;
      const nextLift = it.isNext && !it.watched ? 1 : 0;
      const u = it.front.userData.u as Uniforms;
      u.uSat.value = 0.1 + Math.max(it.sat, nextLift * 0.28, it.sel) * 0.9; // the next one is lifted, not colored: color is for what was watched
      u.uBright.value = (0.46 + Math.max(it.sat, nextLift * 0.75, it.sel) * 0.54 + it.hover * 0.14) * busy;
      it.bag.material.opacity = 0.16 * (1 - it.bagOff);
      it.bag.position.y = it.bagOff * H * 1.15;
      it.bag.visible = it.bagOff < 0.98;
      it.stamp.material.opacity = it.sat > 0.5 ? Math.min(1, (it.sat - 0.5) * 2) * 0.92 : 0;
      it.stamp.scale.setScalar(1 + it.stampPop * 0.9);

      // shelf pose: leaning back; the next one pulled forward and breathing
      const bob = it.isNext && !rm ? Math.sin(t * 2) * 0.03 : 0;
      v.copy(it.home);
      v.z += it.hover * 0.22 + (it.isNext ? 0.28 : 0);
      v.y += it.hover * 0.08 + (it.isNext ? 0.06 + bob : 0);
      let rx = -0.13 + it.hover * 0.1 + (it.isNext ? 0.08 : 0), ry = 0, s = 1;
      if (it.sel > 0.001) {
        const o = ease(Math.min(1, it.open));
        const target = stage.clone(); target.x += (W / 2) * fit * o; // keep the opening spread centered
        v.lerp(target, it.sel);
        rx = THREE.MathUtils.lerp(rx, 0, it.sel);
        ry = -0.35 * it.sel * (1 - o); // turns toward you on the way, flattens as it opens
        s = THREE.MathUtils.lerp(1, fit, it.sel);
      }
      it.g.position.lerp(v, 1 - Math.exp(-(it.sel > 0.001 ? 14 : sp) * dt));
      it.g.rotation.x = damp(it.g.rotation.x, rx, sp, dt);
      it.g.rotation.y = damp(it.g.rotation.y, ry, sp, dt);
      it.g.scale.setScalar(damp(it.g.scale.x, s, 14, dt));
      it.coverPivot.rotation.y = -Math.PI * 0.995 * ease(Math.min(1, it.open));
      it.g.renderOrder = it.sel > 0.01 ? 10 : 0;

      // hand-off: once the spread lies flat, the page grows out of it
      if (isSel && !this.pageShown && !this.closing && it.open > 0.94 && Math.abs(it.g.scale.x - fit) < 0.05) {
        this.pageShown = true;
        this.cb.onHandoff(it.n, this.spreadRect(it));
      }
    }

    if (!this.pageShown) {
      if (this.lite && ++this.shadowTick % 2 === 0) this.renderer.shadowMap.needsUpdate = true;
      this.renderer.render(this.scene, cam);
    } // the page covers the canvas while reading
  }
}
