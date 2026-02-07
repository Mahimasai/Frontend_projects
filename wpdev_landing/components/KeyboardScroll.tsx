"use client";

import { useRef, useEffect, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function KeyboardScroll() {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Initialize scroll hook
  const { scrollYProgress } = useScroll();

  // Map scroll (0-1) to frame index (0-79)
  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, 79]);

  // Load images
  useEffect(() => {
    const loadImages = async () => {
      const loadedImages: HTMLImageElement[] = [];
      const frameCount = 80;

      for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        const frameNumber = i.toString().padStart(3, "0");
        img.src = `/final_animation/final_animation_${frameNumber}.jpg`;
        await new Promise((resolve, reject) => {
            img.onload = () => resolve(true);
            img.onerror = () => {
                console.error(`Failed to load image: ${img.src}`);
                resolve(false); // Resolve false on error to skip
            };
        });
        if (img.complete && img.naturalWidth !== 0) {
            loadedImages.push(img);
        }
        setLoadingProgress(Math.round(((i + 1) / frameCount) * 100));
      }

      setImages(loadedImages);
      setLoaded(true);
    };

    loadImages();
  }, []);

  // Render canvas
  useEffect(() => {
    if (!loaded || images.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    
    const render = (index: number) => {
      const idx = Math.min(
        images.length - 1,
        Math.max(0, Math.round(index))
      );
      const img = images[idx];
      
      if (!img) return;

      // Calculate 'cover' fit with zoom to hide watermark
      const canvasWidth = canvas.clientWidth;
      const canvasHeight = canvas.clientHeight;
      
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      ctx.scale(dpr, dpr);

      const imgRatio = img.width / img.height;
      const canvasRatio = canvasWidth / canvasHeight;
      
      let drawWidth, drawHeight;

      // Cover logic
      if (imgRatio > canvasRatio) {
        // Image is wider than canvas. Fit height.
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imgRatio;
      } else {
         // Image is taller/narrower or equal. Fit width.
         drawWidth = canvasWidth;
         drawHeight = canvasWidth / imgRatio;
      }

      // Add slight zoom to crop watermark (1.1x)
      const zoom = 1.1;
      drawWidth *= zoom;
      drawHeight *= zoom;

      const x = (canvasWidth - drawWidth) / 2;
      const y = (canvasHeight - drawHeight) / 2;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, x, y, drawWidth, drawHeight);
    };

    // Render initial frame
    render(frameIndex.get());

    // Subscribe to scroll changes
    const unsubscribe = frameIndex.on("change", (latest) => {
      requestAnimationFrame(() => render(latest));
    });

    // Handle resize
    const handleResize = () => {
        render(frameIndex.get());
    }
    
    window.addEventListener('resize', handleResize);

    return () => {
        unsubscribe();
        window.removeEventListener('resize', handleResize);
    }
  }, [loaded, images, frameIndex]);

  // Text Overlay Opacity Maps
  const opacity1 = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.25], [0, -20]);

  const opacity2 = useTransform(scrollYProgress, [0.2, 0.3, 0.45, 0.55], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.2, 0.3], [20, 0]);

  const opacity3 = useTransform(scrollYProgress, [0.5, 0.6, 0.75, 0.85], [0, 1, 1, 0]);
  const y3 = useTransform(scrollYProgress, [0.5, 0.6], [20, 0]);
  
  const opacity4 = useTransform(scrollYProgress, [0.8, 0.9, 1], [0, 1, 1]);
  const y4 = useTransform(scrollYProgress, [0.8, 0.9], [20, 0]);

  if (!loaded) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-fog text-black/60">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="font-medium">Loading WpDev sequence... {loadingProgress}%</p>
      </div>
    );
  }

  return (
    <div className="h-[400vh] relative bg-fog">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
            <canvas 
                ref={canvasRef}
                className="w-full h-full object-contain"
            />
            
            {/* Overlay 1: Start (Centered) */}
            <motion.div 
                style={{ opacity: opacity1, y: y1 }}
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
                <h1 className="text-6xl md:text-8xl font-medium tracking-tighter text-black/90 mb-4">Dev Keyboard.</h1>
                <p className="text-xl md:text-2xl text-black/60">Engineered clarity.</p>
            </motion.div>

            {/* Overlay 2: 25% (Left) */}
            <motion.div 
                style={{ opacity: opacity2, y: y2 }}
                className="absolute inset-0 flex items-center px-8 md:px-24 pointer-events-none"
            >
                <div className="max-w-xl">
                    <h2 className="text-5xl md:text-7xl font-medium tracking-tighter text-black/90 mb-4">Built for Precision.</h2>
                    <p className="text-xl md:text-2xl text-black/60">Every detail, measured.</p>
                </div>
            </motion.div>

            {/* Overlay 3: 60% (Right) */}
            <motion.div 
                style={{ opacity: opacity3, y: y3 }}
                className="absolute inset-0 flex items-center justify-end px-8 md:px-24 pointer-events-none"
            >
                 <div className="max-w-xl text-right">
                    <h2 className="text-5xl md:text-7xl font-medium tracking-tighter text-black/90 mb-4">Layered Engineering.</h2>
                    <p className="text-xl md:text-2xl text-black/60">See what&apos;s inside.</p>
                </div>
            </motion.div>

            {/* Overlay 4: End (Centered CTA) */}
            <motion.div 
                style={{ opacity: opacity4, y: y4 }}
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
                <h2 className="text-5xl md:text-7xl font-medium tracking-tighter text-black/90 mb-4">Assembled. Ready.</h2>
                <p className="text-xl md:text-2xl text-black/60">Scroll back to replay.</p>
            </motion.div>
        </div>
    </div>
  );
}
