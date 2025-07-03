import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Bot, BarChart2 } from 'lucide-react';

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
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Smart Resume Screening",
      description: "Our AI instantly analyzes resumes against job descriptions to find the perfect fit, saving you hours of manual work."
    },
    {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: "AI-Powered Interviews",
      description: "Conduct automated, unbiased video interviews that assess skills, experience, and communication abilities."
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-primary" />,
      title: "In-Depth Analytics",
      description: "Receive comprehensive candidate reports with performance scores, transcripts, and malpractice detection."
    }
  ];

  return (
    <motion.div 
      className="space-y-16 md:space-y-24"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Section */}
      <motion.section
        className="text-center pt-12 md:pt-20"
        variants={itemVariants}
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
          The Future of Hiring is Here.
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl mb-8">
          Streamline your recruitment process with our AI-powered platform. From intelligent screening to automated interviews, find the best talent, faster.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/jobs">Find Your Next Job</Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            {/* We'll create this route later */}
            <Link to="/employer/dashboard">Post a Job Opening</Link> 
          </Button>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section variants={itemVariants}>
        <h2 className="text-3xl font-bold text-center mb-10">Why Choose Our Platform?</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                  {feature.icon}
                </div>
                <CardTitle className="pt-4">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* Final Call to Action */}
      <motion.section 
        className="text-center bg-secondary p-12 rounded-lg"
        variants={itemVariants}
      >
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-6">
          Join hundreds of companies and thousands of candidates revolutionizing the hiring process.
        </p>
        <Button size="lg" asChild>
          <Link to="/register">Sign Up for Free</Link>
        </Button>
      </motion.section>
    </motion.div>
  );
};

export default Home;