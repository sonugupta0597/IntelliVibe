import { useEffect } from 'react';

const LightScatteringEffect = () => {
  useEffect(() => {
    let effectsActive = true;
    let lastScrollTime = 0;

    const createLightParticle = () => {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(233, 30, 99, 0.4) 100%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 999;
        opacity: 0;
        left: ${Math.random() * window.innerWidth}px;
        top: ${Math.random() * window.innerHeight}px;
        animation: scatterParticle 3s ease-out forwards;
        animation-delay: ${Math.random() * 300}ms;
      `;
      document.body.appendChild(particle);
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 3500);
    };

    const createLightRay = () => {
      const ray = document.createElement('div');
      const randomRotation = (Math.random() - 0.5) * 60;
      const randomDrift = (Math.random() - 0.5) * 100;
      ray.style.cssText = `
        position: fixed;
        width: 2px;
        height: 80px;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0.6) 0%, rgba(233, 30, 99, 0.4) 50%, transparent 100%);
        pointer-events: none;
        z-index: 999;
        opacity: 0;
        left: ${Math.random() * window.innerWidth}px;
        top: ${Math.random() * window.innerHeight}px;
        transform-origin: center;
        animation: lightRayScatter 2s ease-out forwards;
        animation-delay: ${Math.random() * 200}ms;
        --rotation: ${randomRotation}deg;
        --drift: ${randomDrift}px;
      `;
      document.body.appendChild(ray);
      setTimeout(() => {
        if (ray.parentNode) {
          ray.parentNode.removeChild(ray);
        }
      }, 2200);
    };

    const createLightOrb = () => {
      const orb = document.createElement('div');
      const randomX = Math.random() * window.innerWidth;
      const randomY = Math.random() * (window.innerHeight * 0.7) + (window.innerHeight * 0.3);
      const floatDistance = -(Math.random() * 300 + 150);
      orb.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: radial-gradient(circle, rgba(156, 39, 176, 0.6) 0%, rgba(233, 30, 99, 0.3) 60%, transparent 100%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 998;
        opacity: 0;
        left: ${randomX}px;
        top: ${randomY}px;
        animation: floatOrb 4s ease-in-out forwards;
        animation-delay: ${Math.random() * 500}ms;
        --float-distance: ${floatDistance}px;
      `;
      document.body.appendChild(orb);
      setTimeout(() => {
        if (orb.parentNode) {
          orb.parentNode.removeChild(orb);
        }
      }, 4500);
    };

    const createSparkle = () => {
      const sparkle = document.createElement('div');
      sparkle.style.cssText = `
        position: fixed;
        width: 3px;
        height: 3px;
        background: rgba(255, 255, 255, 0.9);
        pointer-events: none;
        z-index: 997;
        opacity: 0;
        left: ${Math.random() * window.innerWidth}px;
        top: ${Math.random() * window.innerHeight}px;
        animation: sparkleEffect 1.5s ease-in-out forwards;
        animation-delay: ${Math.random() * 100}ms;
      `;
      document.body.appendChild(sparkle);
      setTimeout(() => {
        if (sparkle.parentNode) {
          sparkle.parentNode.removeChild(sparkle);
        }
      }, 1600);
    };

    const createAmbientEffects = () => {
      if (!effectsActive) return;
      if (Math.random() > 0.4) createLightParticle();
      if (Math.random() > 0.6) createSparkle();
      if (Math.random() > 0.7) createLightRay();
      if (Math.random() > 0.8) createLightOrb();
      setTimeout(createAmbientEffects, Math.random() * 800 + 400);
    };

    const createParticleStream = () => {
      if (!effectsActive) return;
      for (let i = 0; i < Math.random() * 2 + 1; i++) {
        createLightParticle();
      }
      setTimeout(createParticleStream, 600);
    };

    const createSparkleBurst = () => {
      if (!effectsActive) return;
      for (let i = 0; i < Math.random() * 5 + 3; i++) {
        setTimeout(() => createSparkle(), Math.random() * 500);
      }
      setTimeout(createSparkleBurst, Math.random() * 4000 + 3000);
    };

    const handleScroll = () => {
      const currentTime = Date.now();
      if (currentTime - lastScrollTime > 60) {
        for (let i = 0; i < Math.random() * 6 + 3; i++) {
          createLightParticle();
        }
        for (let i = 0; i < Math.random() * 3 + 1; i++) {
          createLightRay();
        }
        for (let i = 0; i < Math.random() * 4 + 2; i++) {
          createSparkle();
        }
        if (Math.random() > 0.7) {
          createLightOrb();
        }
        lastScrollTime = currentTime;
      }
    };

    // Add keyframe animations to document
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scatterParticle {
        0% {
          opacity: 0;
          transform: translateY(0) scale(0.5) rotate(0deg);
        }
        20% {
          opacity: 1;
          transform: translateY(-20px) scale(1) rotate(90deg);
        }
        100% {
          opacity: 0;
          transform: translateY(-120px) scale(0.2) rotate(180deg);
        }
      }
      @keyframes lightRayScatter {
        0% {
          opacity: 0;
          transform: scaleY(0) rotate(var(--rotation, 0deg)) translateX(0);
        }
        30% {
          opacity: 1;
          transform: scaleY(1) rotate(var(--rotation, 0deg)) translateX(var(--drift, 0px));
        }
        100% {
          opacity: 0;
          transform: scaleY(0.3) rotate(var(--rotation, 0deg)) translateX(var(--drift, 0px));
        }
      }
      @keyframes floatOrb {
        0% {
          opacity: 0;
          transform: scale(0) translateY(0);
        }
        10% {
          opacity: 1;
          transform: scale(1) translateY(-10px);
        }
        90% {
          opacity: 1;
          transform: scale(1.2) translateY(var(--float-distance, -200px));
        }
        100% {
          opacity: 0;
          transform: scale(0) translateY(var(--float-distance, -200px));
        }
      }
      @keyframes sparkleEffect {
        0%, 100% {
          opacity: 0;
          transform: scale(0) rotate(0deg);
        }
        50% {
          opacity: 1;
          transform: scale(1) rotate(180deg);
        }
      }
    `;
    document.head.appendChild(style);

    setTimeout(createAmbientEffects, 500);
    setTimeout(createParticleStream, 1000);
    setTimeout(createSparkleBurst, 2000);
    window.addEventListener('scroll', handleScroll);

    return () => {
      effectsActive = false;
      window.removeEventListener('scroll', handleScroll);
      document.head.removeChild(style);
    };
  }, []);
  return null;
};

export default LightScatteringEffect; 