import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Bot, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
    },
  },
};

const Home = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-white" />,
      title: "AI Resume Screening",
      description: "Advanced AI instantly analyzes resumes and job descriptions to find the perfect fit, saving you hours of manual work."
    },
    {
      icon: <Bot className="h-8 w-8 text-white" />,
      title: "Automated AI Interviews",
      description: "Conduct unbiased, automated video interviews that assess skills, experience, and communication abilities using AI."
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-white" />,
      title: "AI Analytics & Insights",
      description: "Receive comprehensive candidate reports with AI-powered performance scores, transcripts, and fraud detection."
    }
  ];

  useEffect(() => {
    // Light scattering effects
    let effectsActive = true;
    let lastScrollTime = 0;

    // Create light particle anywhere on screen
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

    // Create light ray anywhere on screen
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

    // Create floating light orb
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

    // Create sparkle effect
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

    // Continuous ambient light effects
    const createAmbientEffects = () => {
      if (!effectsActive) return;
      
      if (Math.random() > 0.4) createLightParticle();
      if (Math.random() > 0.6) createSparkle();
      if (Math.random() > 0.7) createLightRay();
      if (Math.random() > 0.8) createLightOrb();
      
      setTimeout(createAmbientEffects, Math.random() * 800 + 400);
    };

    // Particle stream
    const createParticleStream = () => {
      if (!effectsActive) return;
      
      for (let i = 0; i < Math.random() * 2 + 1; i++) {
        createLightParticle();
      }
      
      setTimeout(createParticleStream, 600);
    };

    // Sparkle burst
    const createSparkleBurst = () => {
      if (!effectsActive) return;
      
      for (let i = 0; i < Math.random() * 5 + 3; i++) {
        setTimeout(() => createSparkle(), Math.random() * 500);
      }
      
      setTimeout(createSparkleBurst, Math.random() * 4000 + 3000);
    };

    // Scroll effect handler
    const handleScroll = () => {
      const currentTime = Date.now();
      
      if (currentTime - lastScrollTime > 60) {
        // Create multiple effects per scroll
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

    // Start effects
    setTimeout(createAmbientEffects, 500);
    setTimeout(createParticleStream, 1000);
    setTimeout(createSparkleBurst, 2000);
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll);

    return () => {
      effectsActive = false;
      window.removeEventListener('scroll', handleScroll);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div 
      className="min-h-screen text-white relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a0b2e 0%, #16213e 50%, #0f3460 100%)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(233, 30, 99, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(156, 39, 176, 0.3) 0%, transparent 50%)`
        }}
      />

      <motion.div 
        className="space-y-16 md:space-y-24 relative z-10 px-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Hero Section */}
        <motion.section
          className="text-center pt-12 md:pt-20 mx-auto max-w-4xl"
          variants={itemVariants}
        >
          <div 
            className="p-8 md:p-12 rounded-2xl border backdrop-blur-md shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
              <span 
                className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"
                style={{
                  background: 'linear-gradient(45deg, #e91e63, #9c27b0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                AI Recruitment System
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl mb-8 text-white leading-relaxed">
              Smarter, faster, and fairer hiring powered by advanced artificial intelligence. Automate screening, interviews, and analytics to find the best talent effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="px-8 py-3 text-lg font-semibold text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{
                  background: 'linear-gradient(45deg, #e91e63, #9c27b0)',
                  boxShadow: '0 8px 25px rgba(233, 30, 99, 0.4)'
                }}
                onClick={() => navigate('/jobs')}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = '0 12px 35px rgba(233, 30, 99, 0.6)';
                  e.target.style.transform = 'translateY(-2px) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = '0 8px 25px rgba(233, 30, 99, 0.4)';
                  e.target.style.transform = 'translateY(0) scale(1)';
                }}
              >
                Explore AI Jobs
              </button>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section variants={itemVariants}>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
            Why Choose AI Recruiter?
          </h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-xl border backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                whileHover={{ 
                  scale: 1.07, 
                  boxShadow: '0 20px 40px rgba(233, 30, 99, 0.3)',
                  borderColor: 'rgba(233, 30, 99, 0.5)'
                }}
                variants={itemVariants}
              >
                <div 
                  className="mx-auto p-4 rounded-full w-fit mb-4 shadow-lg"
                  style={{
                    background: 'linear-gradient(45deg, #e91e63, #9c27b0)',
                    boxShadow: '0 8px 25px rgba(233, 30, 99, 0.4)'
                  }}
                >
                  {feature.icon}
                </div>
                <div className="text-xl font-semibold mb-3 text-white">
                  {feature.title}
                </div>
                <p className="text-white leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section variants={itemVariants} className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How AI Recruitment Works
            </h2>
            <p className="text-white text-lg max-w-2xl mx-auto">
              Get started in minutes with our simple, AI-powered process
            </p>
          </div>
          <div className="flex flex-wrap gap-8 justify-center max-w-6xl mx-auto">
            {[
              {
                step: "01",
                title: "Upload & AI Analyze",
                description: "Upload your resume or job description. Our AI instantly analyzes and extracts key skills and requirements."
              },
              {
                step: "02", 
                title: "AI Quiz Assessment",
                description: "Take an interactive, AI-generated quiz to showcase your skills and boost your application ranking."
              },
              {
                step: "03",
                title: "AI-Powered Interview",
                description: "Participate in automated, unbiased video interviews or set up AI-driven interview flows for candidates."
              },
              {
                step: "04",
                title: "Get AI Insights",
                description: "Receive detailed analytics, match scores, and recommendations powered by advanced AI algorithms."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="text-center p-8 rounded-xl backdrop-blur-md relative w-full sm:w-[320px]"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                whileHover={{ scale: 1.02, borderColor: 'rgba(233, 30, 99, 0.5)' }}
              >
                <div 
                  className="text-6xl mb-4"
                >
                  {step.icon}
                </div>
                <div 
                  className="text-sm font-bold mb-2 px-3 py-1 rounded-full inline-block"
                  style={{
                    background: 'linear-gradient(45deg, #e91e63, #9c27b0)',
                    color: 'white'
                  }}
                >
                  STEP {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {step.title}
                </h3>
                <p className="text-white leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section variants={itemVariants} className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-white text-lg max-w-2xl mx-auto">
              Real stories from companies and candidates who found success with our platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "This platform reduced our hiring time by 70% while finding better candidates. The AI screening is incredibly accurate.",
                author: "Sarah Chen",
                role: "HR Director",
                company: "TechCorp Inc."
              },
              {
                quote: "As a developer, I loved the fair, unbiased interview process. Got hired within 2 weeks of applying!",
                author: "Marcus Rodriguez", 
                role: "Software Engineer",
                company: "StartupXYZ"
              },
              {
                quote: "The analytics and candidate reports are game-changing. We make data-driven hiring decisions now.",
                author: "Jennifer Kim",
                role: "Talent Acquisition Lead", 
                company: "Global Solutions"
              },
              {
                quote: "Finally, a platform that understands both technical skills and cultural fit. Highly recommended!",
                author: "David Thompson",
                role: "CTO",
                company: "InnovateNow"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="p-8 rounded-xl backdrop-blur-md"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                whileHover={{ scale: 1.02, borderColor: 'rgba(233, 30, 99, 0.3)' }}
              >
                <div className="text-4xl mb-4 opacity-50">"</div>
                <p className="text-white mb-6 leading-relaxed italic">
                  {testimonial.quote}
                </p>
                <div className="flex items-center">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mr-4 text-white font-bold"
                    style={{
                      background: 'linear-gradient(45deg, #e91e63, #9c27b0)'
                    }}
                  >
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{testimonial.author}</div>
                    <div className="text-pink-100 text-sm">{testimonial.role}</div>
                    <div className="text-pink-100 text-xs">{testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>


        {/* Newsletter Section */}
        <motion.section variants={itemVariants} className="py-16">
          <div 
            className="text-center p-8 md:p-12 rounded-2xl backdrop-blur-md max-w-4xl mx-auto"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay Updated
            </h2>
            <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
              Get the latest hiring insights, AI updates, and exclusive features delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              />
              <button 
                className="px-6 py-3 font-semibold text-white rounded-lg transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(45deg, #e91e63, #9c27b0)',
                  boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)'
                }}
                onClick={() => alert('Subscribed to newsletter!')}
              >
                Subscribe
              </button>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer variants={itemVariants} className="py-16 mt-8">
          <div 
            className="backdrop-blur-md border-t max-w-6xl mx-auto"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="p-8 text-center">
              {/* Company Info */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(45deg, #e91e63, #9c27b0)'
                    }}
                  >
                    <span className="text-white font-bold">AI</span>
                  </div>
                  <span className="text-xl font-bold text-white">HireFlow</span>
                </div>
                <p className="text-white mb-4 max-w-md mx-auto">
                  Revolutionizing recruitment with AI-powered screening, automated interviews, and intelligent candidate matching.
                </p>
                <div className="flex justify-center gap-4">
                  {['Twitter', 'LinkedIn', 'GitHub', 'Discord'].map((social, index) => (
                    <button
                      key={index}
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                      onClick={() => alert(`Opening ${social}...`)}
                    >
                      <span className="text-white text-sm">{social[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Bottom */}
              <div 
                className="pt-6 border-t"
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="text-pink-100 text-sm">
                  © 2024 HireFlow. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </motion.footer>
      </motion.div>
    </div>
  );
};

export default Home;