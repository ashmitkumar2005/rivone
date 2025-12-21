"use client"
import { useEffect, useRef } from "react"

export function LiquidEffectAnimation() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const appRef = useRef<any>(null)

    useEffect(() => {
        if (!canvasRef.current) return

        // Load the script dynamically
        const script = document.createElement("script")
        script.type = "module"
        script.textContent = `
      import LiquidBackground from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js';
      const canvas = document.getElementById('liquid-canvas');
      if (canvas) {
        const app = LiquidBackground(canvas);
        app.loadImage('/sky.jpg');
        const isMobile = window.innerWidth < 768;
        const defaultScale = isMobile ? 0.05 : 0.4;

        app.liquidPlane.material.metalness = 0.9;
        app.liquidPlane.material.roughness = 0.1;
        app.liquidPlane.uniforms.displacementScale.value = defaultScale;
        app.liquidPlane.uniforms.uFrequency = { value: isMobile ? 0.2 : 0.5 };
        app.liquidPlane.uniforms.uSpeed = { value: 0.02 };
        app.setRain(false);
        window.__liquidApp = app;

        function animate() {
          if (window.__isHoveringUI) {
            app.liquidPlane.uniforms.displacementScale.value = 0;
          } else {
            app.liquidPlane.uniforms.displacementScale.value = defaultScale;
          }
          window.__liquidAnimFrame = requestAnimationFrame(animate);
        }
        animate();
      }
    `
        document.body.appendChild(script)

        return () => {
            if (window.__liquidApp && window.__liquidApp.dispose) {
                window.__liquidApp.dispose()
            }
            if (window.__liquidAnimFrame) {
                cancelAnimationFrame(window.__liquidAnimFrame)
            }
            document.body.removeChild(script)
        }
    }, [])

    return (
        <div
            className="fixed inset-0 m-0 w-full h-full touch-none overflow-hidden -z-10 brightness-[0.8] contrast-[1.5]"
            style={{ fontFamily: '"Montserrat", serif' }}
        >
            <canvas ref={canvasRef} id="liquid-canvas" className="fixed inset-0 w-full h-full" />
        </div>
    )
}

declare global {
    interface Window {
        __liquidApp?: any;
        __isHoveringUI?: boolean;
        __liquidAnimFrame?: number;
    }
}
