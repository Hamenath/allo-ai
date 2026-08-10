"use client";

import { useEffect, useRef, useState } from "react";
import { BlackHoleHeroSection } from "@/components/ui/blackhole-hero-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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

export function HeroBlackHole() {
  const narrow = useNarrow();
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      // Intro Stagger Animation
      const targets = [
        badgeRef.current,
        headingRef.current,
        textRef.current,
        ctaRef.current,
      ].filter(Boolean);

      gsap.fromTo(
        targets,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.2,
        }
      );

      // Smooth ScrollTrigger Parallax & Fade on Scroll
      gsap.to(contentRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
        y: -80,
        opacity: 0.15,
        ease: "none",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[85vh] w-full md:min-h-175">
      <BlackHoleHeroSection
        focus={narrow ? [0.5, 0.75] : [0.72, 0.46]}
        scrim={narrow ? "top" : "left"}
        scrimStrength={0.88}
        distance={24}
        elevation={narrow ? -7 : -5.5}
        fov={narrow ? 58 : 42}
        glow={narrow ? 0.85 : 1}
        steps={narrow ? 200 : 300}
        resolution={narrow ? 0.6 : 0.7}
      >
        <div
          ref={contentRef}
          className="flex h-full min-h-[85vh] items-center px-6 py-16 sm:px-10 md:min-h-175 lg:px-20"
        >
          <div className="max-w-xl">
            <div
              ref={badgeRef}
              className="inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md bg-white/10 text-white mb-8"
            >
              <Sparkles className="mr-2 h-3.5 w-3.5 text-amber-300" />
              Meet the all-in-one AI workspace
            </div>
            <h1
              ref={headingRef}
              className="text-[2.5rem] font-light leading-[1.08] tracking-[-0.03em] text-white sm:text-6xl lg:text-[4.25rem]"
            >
              Everything you need. <br />
              <span className="font-normal text-white/70">One place.</span>
            </h1>

            <p
              ref={textRef}
              className="mt-6 max-w-md text-[0.98rem] leading-relaxed text-white/70 md:mt-7"
            >
              ALLO brings powerful AI tools for work, career, business, development, and everyday productivity into one simple, unified workspace.
            </p>

            <div ref={ctaRef} className="mt-8 flex flex-wrap items-center gap-4 md:mt-10">
              <Link href="/signup">
                <Button size="lg" className="rounded-full bg-white px-7 text-black hover:bg-white/90 font-medium text-base h-12">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/tools">
                <Button variant="outline" size="lg" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-md font-medium text-base h-12">
                  Explore Tools
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </BlackHoleHeroSection>
    </section>
  );
}
