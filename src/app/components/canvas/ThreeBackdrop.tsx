"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeBackdropProps {
  className?: string;
  speed?: number;
  density?: number;
  palette?: [string, string, string];
}

const BASE_POINT_COUNT = 240;
const MAX_PIXEL_RATIO = 2;

function createPointField(
  pointCount: number,
  colors: [THREE.Color, THREE.Color, THREE.Color]
) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(pointCount * 3);
  const vertexColors = new Float32Array(pointCount * 3);

  for (let i = 0; i < pointCount; i += 1) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 70;
    positions[i3 + 1] = (Math.random() - 0.5) * 40;
    positions[i3 + 2] = (Math.random() - 0.5) * 60;

    const mix = Math.random();
    const accent =
      mix < 0.5
        ? colors[0].clone().lerp(colors[1], Math.random())
        : colors[1].clone().lerp(colors[2], Math.random());
    vertexColors[i3] = accent.r;
    vertexColors[i3 + 1] = accent.g;
    vertexColors[i3 + 2] = accent.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(vertexColors, 3));

  const material = new THREE.PointsMaterial({
    vertexColors: true,
    size: 0.6,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometry, material);
}

function createWireOrb(color: string, radius: number) {
  const geometry = new THREE.IcosahedronGeometry(radius, 1);
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    wireframe: true,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Mesh(geometry, material);
}

export default function ThreeBackdrop({
  className,
  speed,
  density,
  palette,
}: ThreeBackdropProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resolvedSpeed =
      typeof speed === "number" && Number.isFinite(speed) ? speed : 1;
    const resolvedDensity =
      typeof density === "number" && Number.isFinite(density) ? density : 1;
    const densityScale = Math.min(2.5, Math.max(0.4, resolvedDensity));
    const speedScale = Math.max(0, resolvedSpeed);
    const paletteColors = palette ?? ["#60a5fa", "#a78bfa", "#fbbf24"];
    const baseColors: [THREE.Color, THREE.Color, THREE.Color] = [
      new THREE.Color(paletteColors[0]),
      new THREE.Color(paletteColors[1]),
      new THREE.Color(paletteColors[2]),
    ];

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x05060b, 18, 110);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    camera.position.set(0, 0, 60);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.setClearColor(0x000000, 0);
    if ("outputColorSpace" in renderer) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    const group = new THREE.Group();

    const points = createPointField(
      Math.round(BASE_POINT_COUNT * densityScale),
      baseColors
    );
    group.add(points);

    const orbA = createWireOrb(paletteColors[1] ?? "#a78bfa", 12.5);
    orbA.position.set(-14, 8, -10);
    group.add(orbA);

    const orbB = createWireOrb(paletteColors[0] ?? "#38bdf8", 8.5);
    orbB.position.set(16, -6, -18);
    group.add(orbB);

    const orbC = createWireOrb(paletteColors[2] ?? "#fbbf24", 6.2);
    orbC.position.set(6, 12, 12);
    group.add(orbC);

    scene.add(group);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let frame = 0;
    let raf = 0;
    const animate = () => {
      frame += 1 * speedScale;
      if (!prefersReducedMotion) {
        group.rotation.y = frame * 0.0018;
        group.rotation.x = Math.sin(frame * 0.0014) * 0.16;
        orbA.rotation.y += 0.0035;
        orbB.rotation.x += 0.0022;
        orbC.rotation.z += 0.0018;
        orbA.position.y = 8 + Math.sin(frame * 0.004) * 1.2;
        orbB.position.x = 16 + Math.sin(frame * 0.003) * 0.9;
        orbC.position.y = 12 + Math.cos(frame * 0.0035) * 1.1;
      }
      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
      scene.remove(group);
      points.geometry.dispose();
      (points.material as THREE.Material).dispose();
      [orbA, orbB, orbC].forEach((orb) => {
        orb.geometry.dispose();
        (orb.material as THREE.Material).dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [density, palette, speed]);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
    />
  );
}
