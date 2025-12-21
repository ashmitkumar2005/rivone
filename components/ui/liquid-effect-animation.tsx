import { useEffect, useRef, useState } from "react"

export function LiquidEffectAnimation() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        if (!canvasRef.current) return

        // Preload image first
        const image = new Image()
        image.src = '/sky.jpg'
        image.onload = () => {
            // Only load script once image is ready
            const script = document.createElement("script")
            script.type = "module"
            script.textContent = `
              import LiquidBackground from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js';
              const canvas = document.getElementById('liquid-canvas');
              if (canvas) {
                const app = LiquidBackground(canvas);
                app.loadImage('/sky.jpg');
                const isMobile = window.innerWidth < 768;
                const defaultScale = isMobile ? 0.05 : 0.2; // Reduced from 0.4
                const defaultFreq = isMobile ? 0.8 : 2.0; // Increased frequency for tightness
        
                app.liquidPlane.material.metalness = 0.9;
                app.liquidPlane.material.roughness = 0.1;
                app.liquidPlane.uniforms.displacementScale.value = defaultScale;
                app.liquidPlane.uniforms.uFrequency = { value: defaultFreq };
                app.liquidPlane.uniforms.uSpeed = { value: 0.02 };
                app.setRain(false);
                window.__liquidApp = app;
        
                function animate() {
                  const intensity = window.__audioIntensity || 0;
                  const dynamicScale = defaultScale * (1 + intensity * 4.0); // Balanced pulses with 4x multiplier
        
                  if (window.__isHoveringUI) {
                    app.liquidPlane.uniforms.displacementScale.value = 0;
                  } else {
                    app.liquidPlane.uniforms.displacementScale.value = dynamicScale;
                  }
                  window.__liquidAnimFrame = requestAnimationFrame(animate);
                }
                animate();
                
                // Signal React that animation is initialized
                window.dispatchEvent(new CustomEvent('liquid-ready'));
              }
            `
            document.body.appendChild(script)

            const onReady = () => setIsReady(true)
            window.addEventListener('liquid-ready', onReady)

            return () => {
                window.removeEventListener('liquid-ready', onReady)
                if (window.__liquidApp && window.__liquidApp.dispose) {
                    window.__liquidApp.dispose()
                }
                if (window.__liquidAnimFrame) {
                    cancelAnimationFrame(window.__liquidAnimFrame)
                }
                if (document.body.contains(script)) {
                    document.body.removeChild(script)
                }
            }
        }
    }, [])

    return (
        <div
            className={`fixed inset-0 m-0 w-full h-full touch-none overflow-hidden -z-10 brightness-[0.8] contrast-[1.5] transition-opacity duration-1000 scale-110 ${isReady ? "opacity-100" : "opacity-0"}`}
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
        __audioIntensity?: number;
    }
}
