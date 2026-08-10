"use client";

import { useEffect, useRef, useState } from "react";
import { BlackHoleHeroSection } from "@/components/ui/blackhole-hero-section";
import { SmoothScroll } from "@/components/smooth-scroll";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** True while the viewport is narrow. Drives the layout swap below. */
function useNarrow(query = "(max-width: 767px)") {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const sync = () => setNarrow(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, [query]);
  return narrow;
}

export default function BlackHoleHeroSectionDemo() {
  const narrow = useNarrow();
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      // Intro entrance timeline
      gsap.fromTo(
        [headingRef.current, textRef.current, ctaRef.current].filter(Boolean),
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          delay: 0.1,
        }
      );

      // ScrollTrigger Parallax and Smooth Fade
      gsap.to(contentRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom 30%",
          scrub: true,
          fastScrollEnd: true,
        },
        y: -40,
        opacity: 0.2,
        ease: "power1.inOut",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScroll>
      <section ref={sectionRef} className="relative min-h-[92svh] w-full md:min-h-180">
        <BlackHoleHeroSection
          focus={narrow ? [0.5, 0.76] : [0.72, 0.46]}
          scrim={narrow ? "top" : "left"}
          scrimStrength={0.9}
          distance={24}
          elevation={narrow ? -7 : -5.5}
          fov={narrow ? 58 : 42}
          glow={narrow ? 0.75 : 0.9}
          steps={narrow ? 120 : 160}
          resolution={narrow ? 0.5 : 0.6}
          maxDpr={1.25}
        >
          <div
            ref={contentRef}
            className="flex h-full min-h-[92svh] items-start px-6 pt-14 sm:px-10 md:min-h-180 md:items-center md:pt-0 lg:px-20 transform-gpu"
          >
            <div className="max-w-136">
              <h1
                ref={headingRef}
                className="text-[2.5rem] font-light leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl lg:text-[4.25rem]"
              >
                Light does not
                <br />
                leave here
              </h1>

              <p
                ref={textRef}
                className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-white/60 md:mt-7"
              >
                The ring above the shadow is the far side of the disc, bent over
                the top. Nothing put it there but gravity.
              </p>

              <div ref={ctaRef} className="mt-8 flex flex-wrap items-center gap-3 md:mt-10">
                <Link
                  href="/signup"
                  className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
                >
                  Get started
                </Link>
                <Link
                  href="/"
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </BlackHoleHeroSection>
      </section>
    </SmoothScroll>
  );
}
