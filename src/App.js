import './App.css';
import Heading from "./Heading.js";
import Name from "./Name";
import resumeContent from "./content";
  
import { useHeroOverlayZoom } from "./useHeroOverlayZoom";    // new hook below
import { useCardViewportVar } from "./useCardViewportVar";       // sets --card-h
  
import React, { useEffect, useRef } from "react";
  
function useGlobalScrollToCard(cardRef) {
   useEffect(() => {
      const el = cardRef.current;
      if (!el) return;
  
      // ----- Wheel (mouse/trackpad) -----
      const onWheel = (e) => {
         // Always consume wheel and scroll the card
         e.preventDefault();
         // Smooth-ish step based on deltaY; adjust factor if you want
         el.scrollBy({ top: e.deltaY, left: 0, behavior: "auto" });
      };
  
      // ----- Keyboard -----
      const onKeyDown = (e) => {
         // Only handle typical scroll keys
         const { key } = e;
         const line = 40;                        // px per Arrow
         const page = el.clientHeight * 0.9; // px per PageUp/Down / Space
  
         let delta = 0;
         if (key === "ArrowDown") delta = line;
         else if (key === "ArrowUp") delta = -line;
         else if (key === "PageDown" || key === " ") delta = page;
         else if (key === "PageUp") delta = -page;
         else if (key === "Home") delta = -el.scrollTop; // jump to top
         else if (key === "End") delta = el.scrollHeight; // to bottom
         else return; // not a scroll key we handle
  
         e.preventDefault();
         el.scrollBy({ top: delta, left: 0, behavior: "auto" });
      };
  
      // ----- Touch (mobile) -----
      let lastY = null;
      const onTouchStart = (e) => {
         if (e.touches && e.touches.length > 0) {
            lastY = e.touches[0].clientY;
         }
      };
      const onTouchMove = (e) => {
         if (e.touches && e.touches.length > 0 && lastY != null) {
            const currentY = e.touches[0].clientY;
            const deltaY = lastY - currentY;   // swipe up -> positive
            if (Math.abs(deltaY) > 0) {
               e.preventDefault();
               el.scrollBy({ top: deltaY, left: 0, behavior: "auto" });
               lastY = currentY;
            }
         }
      };
      const onTouchEnd = () => { lastY = null; };
  
      // Attach to window/document to catch interactions anywhere
      const opts = { passive: false }; // must be non-passive to call preventDefault
      window.addEventListener("wheel", onWheel, opts);
      window.addEventListener("keydown", onKeyDown, opts);
      window.addEventListener("touchstart", onTouchStart, opts);
      window.addEventListener("touchmove", onTouchMove, opts);
      window.addEventListener("touchend", onTouchEnd, opts);
      window.addEventListener("touchcancel", onTouchEnd, opts);
  
      return () => {
         window.removeEventListener("wheel", onWheel, opts);
         window.removeEventListener("keydown", onKeyDown, opts);
         window.removeEventListener("touchstart", onTouchStart, opts);
         window.removeEventListener("touchmove", onTouchMove, opts);
         window.removeEventListener("touchend", onTouchEnd, opts);
         window.removeEventListener("touchcancel", onTouchEnd, opts);
      };
   }, [cardRef]);
}
  
function App() {
const wrapRef = useRef(null);
const cardRef = useRef(null);
const contentRef = useRef(null);
const overlayTitleRef = useRef(null);
  
useGlobalScrollToCard(cardRef);
useCardViewportVar(cardRef); // sets --card-h on the card so we can size overlay
  
// Drive overlay zoom/opacity & content reveal based on card scroll
useHeroOverlayZoom({ wrapRef, cardRef, overlayTitleRef, contentRef }, {
   inFrac: 0.22,
   endFactor: 0.85,
   scaleStart: 0.9,
   scalePeak: 1.15,
   scaleEnd: 3.5,       // bigger => more dramatic “out of the screen”
   fadeStartFrac: 0.55,
   fadeEndFrac: 0.9,
   revealAlpha: 0.2,
   contentEase: 0.12
});
  
   return (
        
<div className="page">
<nav className='navbar'>
<div className='navbarLeft'>
   Resume App
</div>
</nav>
{/* The wrapper creates a stacking & positioning context */}
<div ref={wrapRef} className="card-wrap">
            {/* 1) The non-clipped overlay title, centered over the card */}
            <div className="hero-overlay" aria-hidden="true">
               <div ref={overlayTitleRef} className="hero-overlay-title">
                  <Name text="Ritik Sharma" />
               </div>
            </div>
        
  
         <main
               ref={cardRef}
               className="card"
               role="region"
               aria-label="Content panel"
               tabIndex={0}
            >
               {/* A hero spacer to reserve scroll-room (no actual title here) */}
               <section className="hero-spacer" aria-hidden="true" />
  
               {/* Real content – initially hidden until the title is dim enough */}
               <section ref={contentRef} className="content">
  
         <Heading text="Professional Summary" />
         <p style={{ marginTop: 0 }}>{resumeContent.professionalSummary}</p>
         <Heading text="Education"/>
            <p className='L2'>{resumeContent.education[0].course}</p>
         <ul>
            <li className='L3'>{resumeContent.education[0].perf}</li>
         </ul>
         <Heading text="Professional Experience" />
            <p className='L2'>{resumeContent.professionalExperience[0].designation}</p>
            <ul>
            {resumeContent.professionalExperience[0].experience.map((item, index) => (
               <li key={index} className='L3'>{item}</li>
            ))}
         </ul>
         <Heading text="Projects" />
        
         <p className='L2'>{resumeContent.projects[0].name}</p>
         <ul>
            {resumeContent.projects[0].work.map((item, index) => (
               <li key={index} className='L3'>{item}</li>
            ))}
            </ul>
            <p className='L2'>{resumeContent.projects[1].name}</p>
            <ul>
            {resumeContent.projects[1].work.map((item, index) => (
               <li key={index} className='L3'>{item}</li>
            ))}
         </ul>
         <Heading text="Skills & Interests" />
            {resumeContent.skills.map((item, index) => (
               <button key={index} className='skills'>{item}</button>
            ))}
         <Heading text="Achievements" />
         <ul>
            {resumeContent.achievements.map((item, index) => (
               <li key={index}>{item}</li>
            ))}
         </ul>
         </section>
         </main>
</div>
<nav className="socialbar">
   <a href="mailto:ritik.rnsr@gmail.com?subject=Hello%20Ritik&body=Hi%20Ritik%2C%0D%0A" target='_blank' rel="noreferrer">
      📧Mail
      </a>
   <a href="https://www.linkedin.com/in/ritik-sharma-93b72b17a" target='_blank' rel="noreferrer">🔗in</a>
   <a href="https://github.com/ralph-repo" target='_blank' rel="noreferrer">💻Git</a>
   <a href="https://google.com/" target='_blank'rel="noreferrer">📞  8449177192</a>
   <a href="https://en.wikipedia.org/wiki/Bengaluru" target='_blank' rel="noreferrer">📍Bengaluru, India</a>
</nav>
      </div>
   );
}
  
export default App;
  