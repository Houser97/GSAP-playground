import slides from "./slides";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  let activeSlideIndex = 0;
  let previousProgress = 0;
  let isAnimatingSlide = false;
  let triggerDestroyed = false;

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const initialSlide = document.querySelector(".carousel .slide");
  gsap.set(initialSlide, {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  });
  gsap.set(initialSlide.querySelector(".slide-img img"), { y: "0%" });

  initMarqueeAnimation(initialSlide.querySelector(".marquee-container h1"));

  function updateProgressBars(progress) {
    const progressBars = document.querySelectorAll(".progress-bar");
    progressBars.forEach((bar, index) => {
      const barProgress = Math.min(Math.max(progress * 5 - index, 0), 1);
      bar.style.setProperty("--progress", barProgress);
    });
  }

  function initMarqueeAnimation(h1Element) {
    const text = h1Element.textContent;
    h1Element.textContent = text + " " + text + " " + text;

    gsap.to(h1Element, {
      x: "-33.33%",
      duration: 10,
      ease: "linear",
      repeat: -1,
      rotation: 0.01,
    });
  }

  function createAndAnimateSlide(index, isScrollingForward) {
    const carousel = document.querySelector(".carousel");
    if (!carousel) return;

    const currentSlide = document.querySelector(".carousel .slide");
    if (!currentSlide) {
      isAnimatingSlide = false;
      return;
    }

    const slideData = slides[index];

    const newSlide = document.createElement("div");
    newSlide.className = "slide";
    newSlide.innerHTML = `
        <div class="slide-img">
            <img src="/slide-img-${index + 1}.jpg" alt="" />
        </div>
        <div class="slide-copy">
            <div class="slide-tag">
            <p>${slideData.tag}</p>
            </div>
            <div class="slide-marquee">
            <div class="marquee-container">
                <h1>${slideData.marquee}</h1>
            </div>
            </div>
        </div>
    `;

    initMarqueeAnimation(newSlide.querySelector(".marquee-container h1"));

    const currentSlideImg = currentSlide.querySelector(".slide-img");
    const currentSlideCopy = currentSlide.querySelector(".slide-copy");

    if (!currentSlideImg || !currentSlideCopy) {
      isAnimatingSlide = false;
      return;
    }

    gsap.killTweensOf(currentSlide);
    gsap.killTweensOf(currentSlideImg);
    gsap.killTweensOf(currentSlideCopy);

    if (isScrollingForward) {
      const newSlideImg = newSlide.querySelector(".slide-img img");
      const newSlideCopy = newSlide.querySelector(".slide-copy");

      gsap.set(newSlide, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      });
      gsap.set(newSlideImg, { y: "25%" });
      gsap.set(newSlideCopy, { y: "100%" });

      carousel.appendChild(newSlide);

      gsap.to(newSlide, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        duration: 1,
        ease: "power4.inOut",
      });

      gsap.to([newSlideCopy, newSlideImg], {
        y: "0%",
        duration: 1,
        ease: "power4.inOut",
      });

      gsap.to(currentSlide, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 1,
        ease: "power4.inOut",
        onStart: () => {
          gsap.to(currentSlideImg, {
            y: "-25%",
            duration: 1,
            ease: "power4.inOut",
          });
          gsap.to(currentSlideCopy, {
            y: "-100%",
            duration: 1,
            ease: "power4.inOut",
          });
        },
        onComplete: () => {
          if (currentSlide.parentNode) {
            currentSlide.remove();
          }
          isAnimatingSlide = false;
        },
        onInterrupt: () => {
          isAnimatingSlide = false;
        },
      });
    } else {
      const newSlideImg = newSlide.querySelector(".slide-img img");
      const newSlideCopy = newSlide.querySelector(".slide-copy");

      gsap.set(newSlide, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      });
      gsap.set(newSlideImg, { y: "-25%" });
      gsap.set(newSlideCopy, { y: "-100%" });

      carousel.insertBefore(newSlide, currentSlide);

      gsap.to(newSlide, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1,
        ease: "power4.inOut",
      });

      gsap.to([newSlideImg, newSlideCopy], {
        y: "0%",
        duration: 1,
        ease: "power4.inOut",
      });

      gsap.to(currentSlide, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        duration: 1,
        ease: "power4.inOut",
        onStart: () => {
          gsap.to(currentSlideImg, {
            y: "25%",
            duration: 1,
            ease: "power4.inOut",
          });
          gsap.to(currentSlideCopy, {
            y: "100%",
            duration: 1,
            ease: "power4.inOut",
          });
        },
        onComplete: () => {
          if (currentSlide.parentNode) {
            currentSlide.remove();
          }
          isAnimatingSlide = false;
        },
        onInterrupt: () => {
          isAnimatingSlide = false;
        },
      });
    }
  }

  const scrollTrigger = ScrollTrigger.create({
    trigger: ".carousel",
    start: "top top",
    end: `+=${window.innerHeight * 15}px`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    onUpdate: (self) => {
      if (triggerDestroyed) return;

      const progress = self.progress;
      updateProgressBars(progress);

      if (isAnimatingSlide) {
        previousProgress = progress;
        return;
      }

      const isScrollingForward = progress > previousProgress;
      const targetSlideIndex = Math.min(Math.floor(progress * 5), 4);

      if (targetSlideIndex !== activeSlideIndex) {
        isAnimatingSlide = true;

        try {
          createAndAnimateSlide(targetSlideIndex, isScrollingForward);
          activeSlideIndex = targetSlideIndex;
        } catch (err) {
          isAnimatingSlide = false;
        }
      }

      previousProgress = progress;
    },
    onKill: () => {
      triggerDestroyed = true;
    },
  });
});
