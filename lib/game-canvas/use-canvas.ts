"use client";

import { useEffect, useRef, type RefObject } from "react";

export type UseCanvasOptions = {
  /** Internal drawing width in game units (canvas is scaled to fit its container). */
  internalWidth: number;
  /** Internal drawing height in game units. */
  internalHeight: number;
};

export type CanvasHandle = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  /** 2D context sized to internal units; null until the canvas mounts. */
  getContext: () => CanvasRenderingContext2D | null;
};

/**
 * DPR-aware canvas setup with a fixed internal resolution. The backing store
 * scales with devicePixelRatio for crispness while game code always draws in
 * internal units.
 */
export function useCanvas({ internalWidth, internalHeight }: UseCanvasOptions): CanvasHandle {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const applySize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(internalWidth * dpr);
      canvas.height = Math.round(internalHeight * dpr);

      const context = canvas.getContext("2d");
      if (context) {
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        contextRef.current = context;
      }
    };

    applySize();

    const media = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    media.addEventListener("change", applySize);
    return () => media.removeEventListener("change", applySize);
  }, [internalWidth, internalHeight]);

  return {
    canvasRef,
    getContext: () => contextRef.current,
  };
}
