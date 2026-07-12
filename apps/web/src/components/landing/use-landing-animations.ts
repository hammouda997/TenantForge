'use client';

import { useEffect, type RefObject } from 'react';

type GsapLike = typeof import('gsap').default;

function revealFromTop(
  gsap: GsapLike,
  targets: string | Element | Element[],
  trigger: Element | string,
  options: { y?: number; duration?: number; stagger?: number; delay?: number } = {},
) {
  const { y = 36, duration = 0.55, stagger, delay } = options;
  gsap.from(targets, {
    scrollTrigger: { trigger, start: 'top 90%', once: true },
    y,
    opacity: 0,
    duration,
    stagger,
    delay,
    ease: 'power2.out',
    immediateRender: false,
  });
}

export function useLandingAnimations(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    void (async () => {
      try {
        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ]);

        if (cancelled || !rootRef.current) {
          return;
        }

        gsap.registerPlugin(ScrollTrigger);

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          gsap.set(
            '[data-nav], [data-hero-badge], [data-hero-title], [data-hero-subtitle], [data-hero-highlight], [data-hero-stat], [data-hero-cta] > *, [data-floating-icon], [data-floating-icon-svg], [data-preview], [data-feature], [data-feature-icon], [data-feature-icon-svg], [data-step], [data-step-icon], [data-step-number], [data-step-icon-svg], [data-section-title], [data-marquee-item], [data-marquee-icon], [data-code-block], [data-footer-cta], [data-hero-bg], [data-aurora-beam], [data-aurora-ray], [data-aurora-glow]',
            { opacity: 1, y: 0, x: 0, scale: 1, filter: 'none', clearProps: 'transform,color,backgroundColor' },
          );
          return;
        }

        ctx = gsap.context(() => {
          root.classList.add('landing-gsap-active');

          gsap
            .timeline({ defaults: { ease: 'power2.out' } })
            .from('[data-nav]', { y: -16, opacity: 0, duration: 0.55 })
            .from('[data-nav-link]', { y: -8, opacity: 0, stagger: 0.06, duration: 0.4 }, '-=0.3')
            .from('[data-hero-badge]', { y: 12, opacity: 0, duration: 0.45 }, '-=0.15')
            .from('[data-hero-title]', { y: 20, opacity: 0, duration: 0.6 }, '-=0.1')
            .from(
              '[data-hero-highlight]',
              { scaleX: 0, transformOrigin: 'left center', duration: 0.55, ease: 'power2.inOut' },
              '-=0.35',
            )
            .from('[data-hero-subtitle]', { y: 16, opacity: 0, duration: 0.55 }, '-=0.3')
            .from('[data-hero-stat]', { y: 16, opacity: 0, stagger: 0.06, duration: 0.45 }, '-=0.25')
            .from('[data-floating-icon]', { opacity: 0, stagger: 0.06, duration: 0.5 }, '-=0.3')
            .from('[data-hero-cta] > *', { y: 16, opacity: 0, stagger: 0.08, duration: 0.45 }, '-=0.2');

          gsap.from('[data-hero-bg]', { opacity: 0, duration: 1.2, ease: 'power2.out' });
          gsap.to('[data-aurora-glow]', {
            scale: 1.12,
            opacity: 0.55,
            duration: 5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
          gsap.to('[data-aurora-ray]', {
            opacity: 0.7,
            scale: 1.04,
            duration: 6,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
          gsap.to('[data-floating-icon]', {
            y: 'random(-14, 14)',
            duration: 'random(3.5, 5)',
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            stagger: { each: 0.45, from: 'random' },
          });

          root.querySelectorAll<SVGElement>('[data-floating-icon-svg]').forEach((svg, index) => {
            const color =
              svg.closest('[data-floating-icon]')?.getAttribute('data-floating-color') ??
              '59,130,246';
            gsap.fromTo(
              svg,
              { color: `rgba(${color}, 0.45)` },
              {
                color: `rgba(${color}, 0.85)`,
                duration: gsap.utils.random(2.5, 4),
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: index * 0.35,
              },
            );
          });

          gsap.from('[data-preview]', {
            y: 32,
            opacity: 0,
            duration: 0.7,
            delay: 0.4,
            ease: 'power2.out',
          });
          gsap.to('[data-preview-glow]', {
            opacity: 0.5,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });

          root.querySelectorAll('[data-stat-value]').forEach((el, index) => {
            const target = Number(el.getAttribute('data-stat-value') ?? 0);
            const counter = { val: 0 };
            gsap.to(counter, {
              val: target,
              duration: 1.5,
              ease: 'power2.out',
              delay: 0.55 + index * 0.08,
              onUpdate: () => {
                el.textContent = String(Math.round(counter.val));
              },
            });
          });

          const featuresSection = root.querySelector('#features');
          if (featuresSection) {
            revealFromTop(gsap, '[data-feature]', featuresSection, { y: 40, stagger: 0.06 });
          }

          const architectureSection = root.querySelector('#architecture');
          if (architectureSection) {
            revealFromTop(gsap, '[data-step]', architectureSection, { y: 36, stagger: 0.08 });
            revealFromTop(gsap, '[data-code-block]', architectureSection, {
              y: 28,
              delay: 0.15,
              duration: 0.5,
            });
          }

          gsap.utils.toArray<HTMLElement>('[data-section-title]').forEach((title) => {
            revealFromTop(gsap, title, title, { y: 28, duration: 0.5 });
          });

          revealFromTop(gsap, '[data-footer-cta]', '[data-footer-cta]', { y: 32, duration: 0.55 });

          const marquee = root.querySelector('[data-marquee-track]');
          if (marquee) {
            gsap.to(marquee, { xPercent: -50, duration: 32, repeat: -1, ease: 'none' });
            gsap.to('[data-marquee-icon]', {
              scale: 1.12,
              opacity: 1,
              duration: 2,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              stagger: { each: 0.12, from: 'random' },
            });
          }

          ScrollTrigger.refresh();
        }, root);
      } catch {
        return;
      }
    })();

    return () => {
      cancelled = true;
      root.classList.remove('landing-gsap-active');
      ctx?.revert();
    };
  }, [rootRef]);
}
