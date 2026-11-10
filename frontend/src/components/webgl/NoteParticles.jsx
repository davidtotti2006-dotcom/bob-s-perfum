'use client';

/**
 * ═══════════════════════════════════════════════════════════════
 *  NOTE PARTICLES — la pyramide olfactive rendue en WebGL
 * ═══════════════════════════════════════════════════════════════
 *  Trois strates superposées, une par étage de la pyramide :
 *
 *    TÊTE  — fines, rapides, montent et s'évaporent      (volatilité ++)
 *    CŒUR  — moyennes, orbitent au centre, persistent    (tenue ~)
 *    FOND  — larges, lentes, sédimentent vers le bas     (fixateur)
 *
 *  Les couleurs viennent de `pyramid` dans les tokens olfactifs : changer
 *  de famille rejoue la scène dans une autre ambiance, sans toucher au code.
 *
 *  Budget : 1 draw call par strate (THREE.Points), shader additif, aucune
 *  texture. DPR plafonné à 1.75, boucle stoppée hors écran et onglet caché.
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { family } from '@/lib/olfactory';

/** Profil de chaque strate de la pyramide. */
const STRATA = [
  { count: 420, size: 2.2, rise: 0.055, spread: 9, opacity: 0.55, drift: 0.9 },  // tête
  { count: 300, size: 4.0, rise: 0.012, spread: 6, opacity: 0.45, drift: 0.45 }, // cœur
  { count: 180, size: 7.5, rise: -0.02, spread: 7, opacity: 0.3, drift: 0.2 },   // fond
];

const VERT = `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  uniform float uTime;
  uniform float uRise;
  uniform float uDrift;
  uniform float uPointer;
  uniform float uIntensity;
  varying float vFade;

  void main() {
    vec3 p = position;
    float span = 14.0;

    // ascension, ou sedimentation si uRise < 0, bouclee sur la hauteur
    p.y = mod(p.y + uTime * uRise * aSpeed + span * 0.5, span) - span * 0.5;

    // derive organique : deux sinus decales, aucun motif perceptible
    p.x += sin(uTime * 0.25 * aSpeed + aPhase) * uDrift;
    p.z += cos(uTime * 0.19 * aSpeed + aPhase * 1.7) * uDrift;

    // la souris deplace la nappe : la fragrance reagit au geste
    p.x += uPointer * 0.6 * aSpeed;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);

    // fondu aux extremites verticales : pas de pop en bord de boucle
    vFade = smoothstep(0.0, 2.5, span * 0.5 - abs(p.y)) * uIntensity;

    gl_PointSize = aSize * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;

  void main() {
    // disque a bord doux, sans texture : gradient radial analytique
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float alpha = pow(1.0 - d * 2.0, 1.8) * uOpacity * vFade;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export default function NoteParticles({
  familyKey = 'neutral',
  /** 'ink' : fond sombre, blending additif. 'cream' : fond clair, blending normal. */
  surface = 'ink',
  className = '',
}) {
  const hostRef = useRef(null);
  const apiRef = useRef(null);

  // Montage unique. Les changements de famille passent par les uniforms.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      });
    } catch {
      return; // pas de WebGL : le dégradé CSS sous le canvas reste visible
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      host.clientWidth / Math.max(host.clientHeight, 1),
      0.1,
      100
    );
    camera.position.z = 11;

    const blending = surface === 'ink' ? THREE.AdditiveBlending : THREE.NormalBlending;

    const layers = STRATA.map((s) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(s.count * 3);
      const size = new Float32Array(s.count);
      const phase = new Float32Array(s.count);
      const speed = new Float32Array(s.count);

      for (let i = 0; i < s.count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * s.spread * 2.2;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
        pos[i * 3 + 2] = (Math.random() - 0.5) * s.spread;
        size[i] = s.size * (0.55 + Math.random() * 0.9);
        phase[i] = Math.random() * Math.PI * 2;
        speed[i] = 0.6 + Math.random() * 0.8;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
      geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
      geo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));

      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uRise: { value: s.rise },
          uDrift: { value: s.drift },
          uPointer: { value: 0 },
          uIntensity: { value: 0 },
          uColor: { value: new THREE.Color('#c687a3') },
          uOpacity: { value: s.opacity * (surface === 'ink' ? 1 : 0.75) },
        },
        transparent: true,
        depthWrite: false,
        blending,
      });

      const points = new THREE.Points(geo, mat);
      scene.add(points);
      return { points, geo, mat };
    });

    // Interaction pointeur : lissée, jamais appliquée brute
    const pointer = { target: 0, current: 0 };
    const onMove = (e) => {
      pointer.target = (e.clientX / window.innerWidth - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let raf = null;
    let running = false;
    let t = 0;
    const clock = new THREE.Clock();
    const fade = { target: 1, current: 0 };

    const frame = () => {
      // clamp du delta : pas de saut au retour d'un onglet en veille
      const dt = Math.min(clock.getDelta(), 0.05);
      t += dt;
      pointer.current += (pointer.target - pointer.current) * 0.04;
      fade.current += (fade.target - fade.current) * 0.03;

      for (const l of layers) {
        l.mat.uniforms.uTime.value = reduced ? 0 : t;
        l.mat.uniforms.uPointer.value = pointer.current;
        l.mat.uniforms.uIntensity.value = fade.current;
      }
      if (!reduced) scene.rotation.y += dt * 0.012;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      clock.getDelta(); // purge le delta accumulé pendant la pause
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.01 }
    );
    io.observe(host);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    const ro = new ResizeObserver(() => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(host);

    apiRef.current = {
      setFamily(key) {
        const pal = family(key).pyramid;
        layers.forEach((l, i) => l.mat.uniforms.uColor.value.set(pal[i] || pal[0]));
      },
    };
    apiRef.current.setFamily(familyKey);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVisibility);
      layers.forEach((l) => {
        l.geo.dispose();
        l.mat.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
      apiRef.current = null;
    };
    // `surface` fixe le mode de blending : recréation assumée s'il change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surface]);

  // Changement de famille : on ne remonte pas la scène, on transite les couleurs.
  useEffect(() => {
    apiRef.current?.setFamily(familyKey);
  }, [familyKey]);

  return <div ref={hostRef} aria-hidden="true" className={`pointer-events-none ${className}`} />;
}
