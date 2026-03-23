// useHeroOverlayZoom.js
import { useEffect } from "react";
 
/**
 * Drives an overlay title that is centered over the card and zooms beyond the card edges.
 * Also reveals content inside the card once the title opacity drops below a threshold.
 */
export function useHeroOverlayZoom(refs, opts = {}) {
  const { wrapRef, cardRef, overlayTitleRef, contentRef } = refs;
 
  useEffect(() => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    const title = overlayTitleRef.current;
    const content = contentRef?.current;
    if (!wrap || !card || !title) return;
 
    // Tunables
    const inFrac        = opts.inFrac        ?? 0.22; // first portion for “focus” zoom-in
    const endFactor     = opts.endFactor     ?? 0.85; // total effect scroll distance (× card height)
    const scaleStart    = opts.scaleStart    ?? 0.9;
    const scalePeak     = opts.scalePeak     ?? 1.15;
    const scaleEnd      = opts.scaleEnd      ?? 3.5;  // go big for "out of the screen"
    const fadeStartFrac = opts.fadeStartFrac ?? 0.55; // when to start fading title
    const fadeEndFrac   = opts.fadeEndFrac   ?? 0.9;  // when title fully fades (≈0)
    const revealAlpha   = opts.revealAlpha   ?? 0.2;  // when to reveal content
    const contentEase   = opts.contentEase   ?? 0.12; // window to fade content in
 
    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const lerp = (a, b, t) => a + (b - a) * t;
 
    let rafId = null;
 
    // Keep overlay exactly over the card area (in case layout changes)
    const positionOverlay = () => {
      // The overlay is absolutely positioned to the wrap,
      // so as long as wrap bounding box matches the card,
      // no further math is needed.
      // If wrap padding differs from card padding, adjust here.
    };
 
    const animate = () => {
      const H = card.clientHeight;
      const endScroll = H * endFactor;
      const p = clamp01(card.scrollTop / endScroll); // 0..1
 
      // 1) Scale: two-stage (focus, then blow up)
      let scale;
      if (p <= inFrac) {
        const tA = p / inFrac;         // 0..1
        scale = lerp(scaleStart, scalePeak, tA);
      } else {
        const tB = (p - inFrac) / (1 - inFrac);
        scale = lerp(scalePeak, scaleEnd, tB);
      }
 
      // 2) Opacity: fade during the latter portion
      let alpha = 1;
      if (p >= fadeStartFrac) {
        const t = clamp01((p - fadeStartFrac) / (fadeEndFrac - fadeStartFrac));
        const ease = t * t * (3 - 2 * t); // smoothstep
        alpha = 1 - ease;
      }
 
      // Apply to overlay title (no translate, scale from center)
      title.style.transform = `scale(${scale})`;
      title.style.opacity = String(alpha);
 
      // 3) Reveal the content inside the card
      if (content) {
        if (alpha > revealAlpha) {
          content.style.opacity = "0";
          content.style.pointerEvents = "none";
        } else {
          const windowStart = revealAlpha;
          const windowEnd = Math.max(0.0001, revealAlpha - contentEase);
          const t = clamp01((alpha - windowEnd) / (windowStart - windowEnd)); // 1..0
          const contentOpacity = 1 - t; // 0 -> 1
          content.style.opacity = String(contentOpacity);
          content.style.pointerEvents = contentOpacity > 0.01 ? "auto" : "none";
        }
      }
 
      rafId = null;
    };
 
    const onScroll = () => {
      if (rafId == null) rafId = requestAnimationFrame(animate);
    };
    const onResize = () => {
      positionOverlay();
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(animate);
    };
 
    // Initial
    positionOverlay();
    animate();
 
    // Listeners
    card.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
 
    return () => {
      card.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [wrapRef, cardRef, overlayTitleRef, contentRef,
      opts.inFrac, opts.endFactor, opts.scaleStart, opts.scalePeak, opts.scaleEnd,
      opts.fadeStartFrac, opts.fadeEndFrac, opts.revealAlpha, opts.contentEase]);
}