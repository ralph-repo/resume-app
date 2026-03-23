// useCardViewportVar.js
import { useLayoutEffect } from "react";
 
export function useCardViewportVar(cardRef) {
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
 
    const setVar = () => {
      card.style.setProperty('--card-h', `${card.clientHeight}px`);
    };
 
    setVar();
    let ro;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(setVar);
      ro.observe(card);
      return () => ro.disconnect();
    } else {
      const onResize = () => setVar();
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }
  }, [cardRef]);
}