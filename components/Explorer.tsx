"use client";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { PLANETS } from "@/lib/planets";

// Display scale: radii and distances are compressed so the whole system fits on screen (labelled in the UI).
const R = (km: number) => 0.18 + Math.pow(km / 6371, 0.55) * 0.42;
const D = (au: number) => 3.2 + Math.pow(au, 0.62) * 5.2;
const loader = new THREE.TextureLoader();
const tex = (n: string) => { const t = loader.load(`/tex/${n}.webp`); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

export type Ctl = { speed: number; focus: string | null; paused: boolean };
function System({ ctl, onPick, onReady }: { ctl: MutableRefObject<Ctl>; onPick: (id: string | null) => void; onReady: () => void }) {
  const { camera, gl } = useThree();
  const t = useRef(2026.8 * 365.25);
  const refs = useRef<Record<string, THREE.Group>>({});
  const spin = useRef<Record<string, THREE.Mesh>>({});
  const moon = useRef<THREE.Mesh>(null); const clouds = useRef<THREE.Mesh>(null);
  const look = useRef(new THREE.Vector3()); const camPos = useRef(new THREE.Vector3(0, 9, 30));
  const drag = useRef({ yaw: 0.6, pitch: 0.38, dist: 30, down: false, x: 0, y: 0 });
  const mats = useMemo(() => Object.fromEntries(PLANETS.map((p) => [p.id, new THREE.MeshStandardMaterial({ map: tex(p.tex), roughness: 0.9, metalness: 0 })])), []);
  const sunMat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex("sun"), toneMapped: false, color: new THREE.Color(1.6, 1.35, 1.1) }), []);
  const glow = useMemo(() => { const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d")!; const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, "rgba(255,210,140,.9)"); gr.addColorStop(0.25, "rgba(255,170,80,.35)"); gr.addColorStop(1, "rgba(255,140,60,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); const tx = new THREE.CanvasTexture(c); return new THREE.SpriteMaterial({ map: tx, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }); }, []);
  const ring = useMemo(() => { const g = new THREE.RingGeometry(1.25, 2.3, 128, 1); const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(p, i); uv.setXY(i, (v.length() - 1.25) / 1.05, 0.5); } const t = loader.load("/tex/saturn_ring.png"); t.colorSpace = THREE.SRGBColorSpace; return { g, m: new THREE.MeshStandardMaterial({ map: t, transparent: true, side: THREE.DoubleSide, roughness: 1, depthWrite: false }) }; }, []);
  const orbits = useMemo(() => PLANETS.map((p) => { const pts = Array.from({ length: 257 }, (_, i) => { const a = (i / 256) * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * D(p.au), 0, Math.sin(a) * D(p.au)); }); return new THREE.BufferGeometry().setFromPoints(pts); }), []);
  const lineM = useMemo(() => new THREE.LineBasicMaterial({ color: 0x8fa3c8, transparent: true, opacity: 0.18 }), []);
  const stars = useMemo(() => { const t = tex("stars_milky_way"); return new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, toneMapped: false, color: new THREE.Color(0.55, 0.55, 0.6) }); }, []);
  const ready = useRef(false);
  useEffect(() => {
    const el = gl.domElement;
    const dn = (e: PointerEvent) => { drag.current.down = true; drag.current.x = e.clientX; drag.current.y = e.clientY; };
    const mv = (e: PointerEvent) => { const d = drag.current; if (!d.down) return; d.yaw -= (e.clientX - d.x) * 0.005; d.pitch = Math.min(1.3, Math.max(0.05, d.pitch + (e.clientY - d.y) * 0.004)); d.x = e.clientX; d.y = e.clientY; };
    const up = () => { drag.current.down = false; };
    const wh = (e: WheelEvent) => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); drag.current.dist = Math.min(60, Math.max(6, drag.current.dist * (1 + e.deltaY * 0.001))); };
    el.addEventListener("pointerdown", dn); window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up); el.addEventListener("wheel", wh, { passive: false });
    return () => { el.removeEventListener("pointerdown", dn); window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); el.removeEventListener("wheel", wh); };
  }, [gl]);
  useFrame((_, dt) => {
    const c = ctl.current; if (!c.paused) t.current += dt * c.speed;
    for (const p of PLANETS) { const g = refs.current[p.id]; if (!g) continue; const a = (t.current / p.orbitDays) * Math.PI * 2; g.position.set(Math.cos(a) * D(p.au), 0, -Math.sin(a) * D(p.au)); const s = spin.current[p.id]; if (s && !c.paused) s.rotation.y += dt * 0.25; }
    if (moon.current) { const a = (t.current / 27.3) * Math.PI * 2; moon.current.position.set(Math.cos(a) * 0.95, 0, -Math.sin(a) * 0.95); }
    if (clouds.current && !c.paused) clouds.current.rotation.y += dt * 0.04;
    const d = drag.current, k = Math.min(1, dt * 2.5);
    let target = new THREE.Vector3(), dist = d.dist;
    if (c.focus && refs.current[c.focus]) { refs.current[c.focus].getWorldPosition(target); const p = PLANETS.find((q) => q.id === c.focus)!; dist = R(p.r) * (p.id === "saturn" ? 9 : 6.5); }
    look.current.lerp(target, k);
    // focused: sit on the sunlit side (sun at origin), 0.6 rad off-axis so the terminator shows; drag still adds yaw/pitch
    const sunYaw = c.focus ? Math.atan2(-target.x, -target.z) + 0.6 : 0;
    const yaw = d.yaw + sunYaw, pitch = c.focus ? Math.max(-1.2, Math.min(1.2, d.pitch * 0.5 + 0.18)) : d.pitch;
    const want = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(dist).add(look.current);
    camPos.current.lerp(want, k); camera.position.copy(camPos.current); camera.lookAt(look.current);
    if (!ready.current) { ready.current = true; requestAnimationFrame(() => onReady()); }
  });
  const pick = (id: string) => (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onPick(id); };
  return (
    <>
      <mesh material={stars} raycast={() => null}><sphereGeometry args={[400, 64, 32]} /></mesh>
      <mesh material={sunMat} onClick={(e) => { e.stopPropagation(); onPick(null); }}><sphereGeometry args={[1.9, 64, 32]} /></mesh>
      <sprite material={glow} scale={[11, 11, 1]} raycast={() => null} />
      <pointLight intensity={420} distance={0} decay={1.6} color="#fff1dc" />
      <ambientLight intensity={0.05} />
      {orbits.map((g, i) => <line key={i}><primitive object={g} attach="geometry" /><primitive object={lineM} attach="material" /></line>)}
      {PLANETS.map((p) => (
        <group key={p.id} ref={(g) => { if (g) refs.current[p.id] = g; }}>
          <group rotation={[0, 0, (p.tilt * Math.PI) / 180]}>
            <mesh ref={(m) => { if (m) spin.current[p.id] = m; }} material={mats[p.id]} onClick={pick(p.id)} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "")}><sphereGeometry args={[R(p.r), 64, 32]} /></mesh>
            {p.id === "earth" && <mesh ref={clouds} raycast={() => null}><sphereGeometry args={[R(p.r) * 1.015, 64, 32]} /><meshStandardMaterial map={tex("earth_clouds")} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>}
            {p.id === "saturn" && <mesh geometry={ring.g} material={ring.m} rotation={[-Math.PI / 2, 0, 0]} scale={R(p.r)} raycast={() => null} />}
          </group>
          {p.id === "earth" && <mesh ref={moon} onClick={pick("earth")}><sphereGeometry args={[0.1, 32, 16]} /><meshStandardMaterial map={tex("moon")} roughness={1} /></mesh>}
        </group>
      ))}
    </>
  );
}
export default function Explorer({ ctl, onPick, running, onReady }: { ctl: MutableRefObject<Ctl>; onPick: (id: string | null) => void; running: boolean; onReady: () => void }) {
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <Canvas frameloop={running ? "always" : "never"} dpr={[1, mobile ? 1.25 : 1.5]} camera={{ fov: mobile ? 55 : 38, near: 0.05, far: 1000, position: [0, 9, 30] }} gl={{ antialias: true, powerPreference: "high-performance" }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }} onPointerMissed={() => {}} style={{ touchAction: "pan-y" }}>
      <System ctl={ctl} onPick={onPick} onReady={onReady} />
    </Canvas>
  );
}
