"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const PlasmaCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene & Camera setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    // Renderer setup with alpha transparency and antialiasing
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // GLSL Uniforms
    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uIntensity: { value: 1.0 },
    };

    // Target mouse for smooth lerping
    const targetMouse = new THREE.Vector2(0.5, 0.5);

    // Custom GLSL Shaders
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform float uIntensity;
      varying vec2 vUv;

      void main() {
        vec2 st = gl_FragCoord.xy / uResolution.xy;
        vec2 mouseOffset = (uMouse - 0.5) * 0.15;
        vec2 p = (st - 0.5) * 2.0 + mouseOffset;
        
        float t = uTime * 0.35;
        
        float v1 = sin(p.x * 2.2 + t);
        float v2 = sin(p.y * 2.8 - t * 0.7);
        float v3 = sin((p.x + p.y) * 1.8 + t * 1.1);
        float v4 = sin(length(p) * 3.5 - t * 1.3);
        
        float plasma = (v1 + v2 + v3 + v4) * 0.25;
        
        // Deep obsidian base palette (#06070a) -> Indigo (#6366f1) -> Cyan (#00dbe9)
        vec3 colorBase = vec3(0.024, 0.027, 0.039);
        vec3 colorIndigo = vec3(0.243, 0.255, 0.650);
        vec3 colorCyan = vec3(0.0, 0.859, 0.914);
        
        vec3 finalColor = mix(colorBase, colorIndigo, clamp(plasma * 0.35 + 0.1, 0.0, 1.0));
        finalColor = mix(finalColor, colorCyan, clamp(pow(plasma + 0.45, 3.5) * 0.12, 0.0, 1.0));
        
        // Soft vignette
        float vignette = 1.0 - smoothstep(0.4, 1.4, length(st - 0.5));
        finalColor *= vignette;

        gl_FragColor = vec4(finalColor * uIntensity, 0.75);
      }
    `;

    // Geometry & Material
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Mouse Tracking Event Listener
    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = e.clientX / window.innerWidth;
      targetMouse.y = 1.0 - e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Resize Handler
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      uniforms.uResolution.value.set(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop with Lerp & Visibility Throttling
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      // Throttle completely when tab is hidden
      if (!document.hidden) {
        const delta = clock.getDelta();
        uniforms.uTime.value += delta;

        // Smooth mouse lerping
        uniforms.uMouse.value.x += (targetMouse.x - uniforms.uMouse.value.x) * 0.05;
        uniforms.uMouse.value.y += (targetMouse.y - uniforms.uMouse.value.y) * 0.05;

        renderer.render(scene, camera);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.85 }}
    />
  );
};
