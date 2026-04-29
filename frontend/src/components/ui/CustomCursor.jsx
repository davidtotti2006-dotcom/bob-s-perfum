'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const ringRef  = useRef(null);
  const dotRef   = useRef(null);
  const pos      = useRef({ x: -200, y: -200 });
  const ringPos  = useRef({ x: -200, y: -200 });
  const raf      = useRef(null);
  const [isHover, setIsHover] = useState(false);
  const [isClick, setIsClick] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isFine = window.matchMedia('(pointer: fine)').matches;
    if (!isFine) return;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const onEnter = (e) => {
      const t = e.target;
      if (
        t.tagName === 'A' ||
        t.tagName === 'BUTTON' ||
        t.closest('a') ||
        t.closest('button') ||
        t.getAttribute('role') === 'button'
      ) {
        setIsHover(true);
      }
    };
    const onLeave = () => setIsHover(false);

    const onDown  = () => setIsClick(true);
    const onUp    = () => setIsClick(false);

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onEnter);
    document.addEventListener('mouseout',  onLeave);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup',   onUp);

    const animate = () => {
      // ring follows with spring
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 3}px, ${pos.current.y - 3}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x - 20}px, ${ringPos.current.y - 20}px)`;
      }
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onEnter);
      document.removeEventListener('mouseout',  onLeave);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup',   onUp);
      cancelAnimationFrame(raf.current);
    };
  }, [visible]);

  return (
    <>
      {/* Outer ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 40, height: 40,
          borderRadius: '50%',
          border: `1px solid ${isHover ? '#c687a3' : 'rgba(198,135,163,0.6)'}`,
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease, border-color 0.3s ease, width 0.3s ease, height 0.3s ease, margin 0.3s ease',
          mixBlendMode: 'difference',
          ...(isHover && {
            width: 56,
            height: 56,
            marginTop: -8,
            marginLeft: -8,
          }),
          ...(isClick && {
            width: 28,
            height: 28,
            marginTop: 6,
            marginLeft: 6,
          }),
        }}
      />
      {/* Inner dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 6, height: 6,
          borderRadius: '50%',
          backgroundColor: '#c687a3',
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease, transform 0.1s ease, width 0.2s ease, height 0.2s ease',
          ...(isHover && { width: 4, height: 4 }),
        }}
      />
    </>
  );
}
