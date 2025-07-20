import React from 'react';
import { Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-100 text-gray-800 py-16 mt-auto rounded-t-2xl shadow-inner border-t border-blue-100">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow text-white font-bold text-2xl">IV</div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent tracking-tight">IntelliVibe</span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md font-medium">
              Revolutionizing recruitment with AI-powered screening, automated interviews, and intelligent candidate matching.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 transition-colors">
                <Github className="h-6 w-6" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-blue-800">Product</h3>
            <ul className="space-y-2 text-blue-700">
              <li><button className="hover:text-blue-900 transition-colors">Features</button></li>
              <li><button className="hover:text-blue-900 transition-colors">Pricing</button></li>
              <li><button className="hover:text-blue-900 transition-colors">API</button></li>
              <li><button className="hover:text-blue-900 transition-colors">Documentation</button></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-blue-800">Support</h3>
            <ul className="space-y-2 text-blue-700">
              <li><button className="hover:text-blue-900 transition-colors">Help Center</button></li>
              <li><button className="hover:text-blue-900 transition-colors">Contact Us</button></li>
              <li><button className="hover:text-blue-900 transition-colors">Privacy Policy</button></li>
              <li><button className="hover:text-blue-900 transition-colors">Terms of Service</button></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-blue-100 pt-8 text-center text-blue-700">
          <p>© {new Date().getFullYear()} IntelliVibe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;