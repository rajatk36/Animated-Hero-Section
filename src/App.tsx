import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const stats = [
  { value: '58%', label: 'Increase in pickup point use' },
  { value: '27%', label: 'Increase in repeat sessions' },
  { value: '40%', label: 'Decrease in support calls' },
  { value: '24%', label: 'Decreased in customer phone calls'}
];

const App: React.FC = () => {
  const heroSectionRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const laneRef = useRef<HTMLDivElement | null>(null);
  const carRef = useRef<HTMLDivElement | null>(null); // circular scroll indicator
  const headlineStripRef = useRef<HTMLDivElement | null>(null);
  const statRefs = useRef<HTMLDivElement[]>([]);

  const setStatRef = (index: number) => (el: HTMLDivElement | null) => {
    if (el) {
      statRefs.current[index] = el;
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (laneRef.current) {
        tl.from(laneRef.current, {
          y: 40,
          opacity: 0,
          duration: 0.7,
        });
      }

      if (headlineStripRef.current) {
        tl.from(
          headlineStripRef.current,
          {
            opacity: 0,
            y: 24,
            duration: 0.8,
          },
          '-=0.4'
        );
      }

      if (carRef.current) {
        tl.from(
          carRef.current,
          {
            scale: 0.8,
            opacity: 0,
            duration: 0.6,
          },
          '-=0.5'
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);


  useEffect(() => {
    const section = heroSectionRef.current;
    const lane = laneRef.current;
    const car = carRef.current;
    const headlineStrip = headlineStripRef.current;

    if (!section || !lane || !car || !headlineStrip) return;

    let animationFrameId: number;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const windowHeight =
        window.innerHeight || document.documentElement.clientHeight;

      const totalScrollable = rect.height - windowHeight;
      const scrolled = -rect.top;
      const rawProgress = totalScrollable > 0 ? scrolled / totalScrollable : 0;
      const progress = gsap.utils.clamp(0, 1, rawProgress);
      const eased = gsap.parseEase('power3.out')(progress);

      const viewportWidth =
        window.innerWidth || document.documentElement.clientWidth;

      
      const indicatorTravel = viewportWidth * 0.4;
      const indicatorX = gsap.utils.mapRange(
        0,
        1,
        -indicatorTravel,
        indicatorTravel,
        eased
      );

      gsap.to(car, {
        x: indicatorX,
        ease: 'power3.out',
        duration: 0.3,
      });

     
      const stripTravel = viewportWidth * 0.9;
      const stripX = gsap.utils.mapRange(
        0,
        1,
        stripTravel,
        -stripTravel,
        eased
      );

      const headlineVisible = gsap.utils.clamp(
        0,
        1,
        gsap.utils.mapRange(0.05, 0.4, 0, 1, progress)
      );

      gsap.to(headlineStrip, {
        opacity: headlineVisible,
        x: stripX,
        y: gsap.utils.mapRange(0, 1, 24, 0, headlineVisible),
        ease: 'power3.out',
        duration: 0.25,
      });

     
      const ranges = [
        { start: 0.05, end: 0.35 },
        { start: 0.35, end: 0.7 },
        { start: 0.7, end: 1 },
      ];

      statRefs.current.forEach((el, index) => {
        const range = ranges[index];
        if (!range) return;

        const localRaw = (progress - range.start) / (range.end - range.start);
        const local = gsap.utils.clamp(0, 1, localRaw);

        if (local === 0) {
          gsap.to(el, {
            opacity: 0,
            y: 30,
            scale: 0.94,
            ease: 'power3.out',
            duration: 0.25,
          });
          return;
        }

        const opacity = gsap.utils.mapRange(0, 1, 0, 1, local);
        const translateY = gsap.utils.mapRange(0, 1, 30, 0, local);
        const scale = gsap.utils.mapRange(0, 1, 0.94, 1.02, local);

        gsap.to(el, {
          opacity,
          y: translateY,
          scale,
          ease: 'power3.out',
          duration: 0.25,
        });
      });
    };

    const handleScroll = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(onScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="app-root">
      <section ref={heroSectionRef} className="hero-scroll-section">
        <div ref={heroRef} className="hero-sticky">
          <div className="hero-background-glow" />
          <div className="hero-inner">
            <div className="hero-lane-wrapper">
              <div ref={laneRef} className="hero-lane">
                <div ref={headlineStripRef} className="hero-headline-strip">
                  <p className="hero-headline-text">
                    W E L C O M E I AM RAJAT 
                  </p>
                </div>
              </div>

              <div ref={carRef} className="hero-indicator">
                <div className="hero-indicator-inner" />
              </div>
            </div>

            
            <div className="hero-stats">
              <div
                ref={setStatRef(0)}
                className="stat-card stat-card--top"
              >
                <p className="stat-card__value">{stats[0].value}</p>
                <p className="stat-card__label">{stats[0].label}</p>
              </div>

              <div
                ref={setStatRef(1)}
                className="stat-card stat-card--right"
              >
                <p className="stat-card__value">{stats[1].value}</p>
                <p className="stat-card__label">{stats[1].label}</p>
              </div>

              <div
                ref={setStatRef(2)}
                className="stat-card stat-card--bottom"
              >
                <p className="stat-card__value">{stats[2].value}</p>
                <p className="stat-card__label">{stats[2].label}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;

