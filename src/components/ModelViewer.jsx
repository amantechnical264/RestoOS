import { useEffect, useRef } from 'react';

/**
 * A proper React wrapper around <model-viewer>.
 * Using dangerouslySetInnerHTML causes model-viewer to not initialise properly
 * because React doesn't fire custom-element lifecycle callbacks on innerHTML injection.
 * This component creates the element imperatively so the browser upgrades it correctly.
 */
export default function ModelViewer({
  src,
  ar = false,
  autoRotate = true,
  cameraControls = true,
  className = '',
  style = {},
  onLoad,
}) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    // Ensure the model-viewer script is loaded
    if (!customElements.get('model-viewer')) {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !src) return;

    // Remove previous viewer if any
    if (viewerRef.current) {
      viewerRef.current.remove();
      viewerRef.current = null;
    }

    const mv = document.createElement('model-viewer');
    mv.setAttribute('src', src);
    mv.setAttribute('camera-controls', '');
    mv.setAttribute('touch-action', 'pan-y');
    mv.setAttribute('camera-orbit', '0deg 75deg 105%');
    mv.setAttribute('min-camera-orbit', 'auto auto 50%');
    mv.setAttribute('max-camera-orbit', 'auto auto 200%');
    mv.setAttribute('shadow-intensity', '1');
    mv.setAttribute('environment-image', 'neutral');
    mv.setAttribute('exposure', '1.1');
    mv.setAttribute('interaction-prompt', 'auto');

    if (autoRotate) {
      mv.setAttribute('auto-rotate', '');
      mv.setAttribute('auto-rotate-delay', '0');
      mv.setAttribute('rotation-per-second', '12deg');
    }

    if (ar) {
      mv.setAttribute('ar', '');
      mv.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
      mv.setAttribute('ar-scale', 'auto');
      mv.setAttribute('ar-placement', 'floor');
    }

    mv.style.width = '100%';
    mv.style.height = '100%';
    mv.style.setProperty('--poster-color', 'transparent');

    if (onLoad) mv.addEventListener('load', onLoad);

    container.appendChild(mv);
    viewerRef.current = mv;

    return () => {
      if (onLoad) mv.removeEventListener('load', onLoad);
      mv.remove();
      viewerRef.current = null;
    };
  }, [src, ar, autoRotate, onLoad]);

  return (
    <div ref={containerRef} className={className} style={style} />
  );
}
