import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Bot, BarChart2, ArrowRight, CheckCircle, Users, Target, Zap, Star, Sparkles, Brain, Rocket } from 'lucide-react';
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
      icon: <Brain className="h-8 w-8 text-blue-600" />,
      title: "AI Resume Screening",
      description: "Advanced AI instantly analyzes resumes and job descriptions to find the perfect fit, saving you hours of manual work.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Bot className="h-8 w-8 text-purple-600" />,
      title: "Automated AI Interviews",
      description: "Conduct unbiased, automated video interviews that assess skills, experience, and communication abilities using AI.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-emerald-600" />,
      title: "AI Analytics & Insights",
      description: "Receive comprehensive candidate reports with AI-powered performance scores, transcripts, and fraud detection.",
      gradient: "from-emerald-500 to-teal-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      
      <motion.div 
        className="relative space-y-32 p-6 md:p-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Hero Section */}
        <motion.section
          className="relative"
          variants={itemVariants}
        >
          <div className="w-full mx-auto py-20 lg:py-32">
            <div className="text-center mx-auto relative">
              {/* Floating elements */}
              <div className="absolute -top-10 left-1/4 w-20 h-20 bg-blue-400/20 rounded-full animate-bounce animation-delay-1000"></div>
              <div className="absolute top-20 right-1/4 w-16 h-16 bg-purple-400/20 rounded-full animate-bounce animation-delay-2000"></div>
              
              <motion.div 
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-white/40 rounded-full px-6 py-3 mb-8 shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-slate-700">Powered by Advanced AI Technology</span>
              </motion.div>
              
              <h1 className="text-6xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 mb-8 leading-tight">
                AI-Powered
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Recruitment System
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed max-w-4xl mx-auto">
                Transform your hiring process with intelligent automation. Screen candidates, conduct interviews, and make data-driven decisions with our 
                <span className="font-semibold text-blue-600"> advanced AI platform.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <motion.button 
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-3 overflow-hidden"
                  onClick={() => navigate('/jobs')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">Get Started Today</span>
                  <ArrowRight className="h-6 w-6 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
                
                <motion.button 
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-700 text-lg font-semibold rounded-2xl hover:bg-white hover:border-slate-300 transition-all duration-300 shadow-lg hover:shadow-xl"
                  onClick={() => alert('Contact sales coming soon!')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Contact Sales
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section variants={itemVariants}>
          <div className="w-full mx-auto">
            <div className="text-center mb-20">
              <motion.div 
                className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 rounded-full px-4 py-2 mb-6 font-semibold"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Star className="h-4 w-4" />
                Why Choose Our Platform?
              </motion.div>
              
              <h2 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-8">
                Revolutionary Features
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Streamline your recruitment process with cutting-edge AI technology designed for modern hiring needs.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="group relative bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/90 transition-all duration-500 text-center shadow-xl hover:shadow-2xl hover:-translate-y-2"
                  whileHover={{ y: -5 }}
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  {/* Gradient border effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  <div className={`bg-gradient-to-br ${feature.gradient} p-4 rounded-2xl w-fit mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section variants={itemVariants}>
          <div className="w-full mx-auto">
            <div className="text-center mb-20">
              <motion.div 
                className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-6 font-semibold"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Rocket className="h-4 w-4" />
                Simple Process
              </motion.div>
              
              <h2 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-8">
                How It Works
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Get started in minutes with our simple, AI-powered recruitment process
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  icon: <FileText className="h-8 w-8" />,
                  title: "Upload & Analyze",
                  description: "Upload resumes or job descriptions. Our AI instantly analyzes and extracts key skills and requirements.",
                  color: "blue"
                },
                {
                  step: "02", 
                  icon: <Target className="h-8 w-8" />,
                  title: "Skills Assessment",
                  description: "Candidates take AI-generated quizzes to showcase their skills and boost their application ranking.",
                  color: "purple"
                },
                {
                  step: "03",
                  icon: <Bot className="h-8 w-8" />,
                  title: "AI Interview",
                  description: "Conduct automated, unbiased video interviews with real-time analysis and scoring.",
                  color: "emerald"
                },
                {
                  step: "04",
                  icon: <BarChart2 className="h-8 w-8" />,
                  title: "Get Insights",
                  description: "Receive detailed analytics, match scores, and recommendations for informed hiring decisions.",
                  color: "orange"
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="group relative bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/20 text-center hover:bg-white/90 transition-all duration-500 shadow-xl hover:shadow-2xl hover:-translate-y-2"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`bg-gradient-to-br from-${step.color}-500 to-${step.color}-600 p-4 rounded-2xl w-fit mx-auto mb-6 shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                    {step.icon}
                  </div>
                  <div className={`bg-gradient-to-r from-${step.color}-600 to-${step.color}-700 text-white text-sm font-bold px-4 py-2 rounded-full inline-block mb-6 shadow-lg`}>
                    STEP {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Modern connection line */}
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 opacity-60"></div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
        
        {/* CTA Section */}
        <motion.section variants={itemVariants}>
          <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 lg:p-20 text-center overflow-hidden shadow-2xl">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl"></div>
            
            {/* Floating elements */}
            <div className="absolute top-10 left-10 w-16 h-16 bg-white/20 rounded-full animate-bounce animation-delay-1000"></div>
            <div className="absolute bottom-10 right-10 w-20 h-20 bg-white/20 rounded-full animate-bounce animation-delay-3000"></div>
            
            <div className="relative z-10">
              <motion.div 
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white rounded-full px-4 py-2 mb-8 font-semibold"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <Zap className="h-4 w-4" />
                Ready to Get Started?
              </motion.div>
              
              <h2 className="text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
                Transform Your Hiring
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                  Process Today
                </span>
              </h2>
              <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                Join hundreds of companies using AI to find the best talent faster and more efficiently than ever before.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <motion.button 
                  className="px-8 py-4 bg-white text-blue-600 text-lg font-bold rounded-2xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:scale-105"
                  onClick={() => navigate('/jobs')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started Today
                  <ArrowRight className="h-6 w-6" />
                </motion.button>
                <motion.button 
                  className="px-8 py-4 border-2 border-white text-white text-lg font-bold rounded-2xl hover:bg-white hover:text-blue-600 transition-all duration-300 backdrop-blur-sm shadow-xl hover:shadow-2xl"
                  onClick={() => alert('Contact sales coming soon!')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Contact Sales
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Newsletter Section */}
        <motion.section variants={itemVariants}>
          <div className="w-full mx-auto">
            <motion.div 
              className="bg-white/80 backdrop-blur-xl p-8 lg:p-16 rounded-3xl border border-white/20 text-center shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="max-w-2xl mx-auto">
                <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">
                  Stay Updated
                </h2>
                <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                  Get the latest hiring insights, AI updates, and exclusive features delivered to your inbox
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/60 backdrop-blur-sm text-lg placeholder:text-slate-400"
                  />
                  <motion.button 
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 whitespace-nowrap shadow-lg hover:shadow-xl"
                    onClick={() => alert('Subscribed to newsletter!')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Subscribe Now
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </motion.div>
      
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Home;