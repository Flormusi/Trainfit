import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const DemoPage = () => {
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handlePlanSelection = async (planType: string) => {
    setLoadingPlan(planType);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoadingPlan(null);
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Bar */}
      <nav className="bg-black py-4 border-b border-red-600">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/images/trainfit-logo.svg" alt="TrainFit Logo" className="h-10" />
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-white hover:text-red-500 transition-colors">Home</a>
            <a href="#" className="text-white hover:text-red-500 transition-colors">Services</a>
            <a href="#" className="text-white hover:text-red-500 transition-colors">Schedule</a>
            <a href="#" className="text-white hover:text-red-500 transition-colors">About Us</a>
            <a href="#" className="text-white hover:text-red-500 transition-colors">Contact</a>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-transparent border border-red-600 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-black to-gray-900 py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <h1 className="text-5xl font-bold mb-6">SHAPE <span className="text-red-600">YOURSELF</span></h1>
            <p className="text-xl mb-8">Gym, Boxing & Yoga - Your Personal Fitness Journey Starts Here</p>
            <p className="mb-8 text-gray-400">Join our community of fitness enthusiasts and transform your body with our expert trainers and state-of-the-art facilities.</p>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/register')}
                className="bg-red-600 text-white px-8 py-3 rounded font-semibold hover:bg-red-700 transition-colors"
              >
                BECOME MEMBER
              </button>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 opacity-20 rounded-lg"></div>
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                alt="Fitness Training" 
                className="rounded-lg relative z-10 w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-black py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our <span className="text-red-600">Services</span></h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-gray-900 p-8 rounded-lg border-t-2 border-red-600 hover:transform hover:scale-105 transition-transform duration-300">
              <h3 className="text-2xl font-semibold mb-4">Personal Training</h3>
              <p className="text-gray-400">Get personalized workout plans tailored to your fitness goals with our expert trainers</p>
            </div>
            <div className="bg-gray-900 p-8 rounded-lg border-t-2 border-red-600 hover:transform hover:scale-105 transition-transform duration-300">
              <h3 className="text-2xl font-semibold mb-4">Progress Tracking</h3>
              <p className="text-gray-400">Monitor your fitness journey with detailed progress analytics and regular assessments</p>
            </div>
            <div className="bg-gray-900 p-8 rounded-lg border-t-2 border-red-600 hover:transform hover:scale-105 transition-transform duration-300">
              <h3 className="text-2xl font-semibold mb-4">Expert Guidance</h3>
              <p className="text-gray-400">Connect with certified trainers for professional guidance and motivation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Membership Plans */}
      <div className="bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Membership <span className="text-red-600">Plans</span>
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="bg-black p-8 rounded-lg border border-gray-800 hover:border-red-600 transition-colors"
            >
              <h3 className="text-2xl font-semibold mb-4">Basic</h3>
              <p className="text-3xl font-bold mb-6">$29<span className="text-sm text-gray-400">/month</span></p>
              <ul className="space-y-3 mb-8">
                <motion.li 
                  whileHover={{ x: 10 }}
                  className="flex items-center cursor-pointer hover:text-red-500 transition-colors"
                >
                  <span className="text-red-600 mr-2">✓</span> Access to gym facilities
                </motion.li>
                <li className="flex items-center"><span className="text-red-600 mr-2">✓</span> Basic workout plans</li>
                <li className="flex items-center"><span className="text-red-600 mr-2">✓</span> Progress tracking</li>
              </ul>
              <button 
                onClick={() => handlePlanSelection('basic')}
                disabled={loadingPlan === 'basic'}
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors relative"
              >
                {loadingPlan === 'basic' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                  />
                ) : (
                  'Choose Plan'
                )}
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-black p-8 rounded-lg border-2 border-red-600 relative"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 text-sm rounded-bl"
              >
                Popular
              </motion.div>
              <h3 className="text-2xl font-semibold mb-4">Gold</h3>
              <p className="text-3xl font-bold mb-6">$49<span className="text-sm text-gray-400">/month</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><span className="text-red-600 mr-2">✓</span> All Basic features</li>
                <li className="flex items-center"><span className="text-red-600 mr-2">✓</span> Personal trainer</li>
                <li className="flex items-center"><span className="text-red-600 mr-2">✓</span> Nutrition guidance</li>
                <li className="flex items-center"><span className="text-red-600 mr-2">✓</span> Group classes</li>
              </ul>
              <button className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors">
                Choose Plan
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-black p-8 rounded-lg border border-gray-800 hover:border-red-600 transition-colors"
            >
              <h3 className="text-2xl font-semibold mb-4">Platinum</h3>
              <p className="text-3xl font-bold mb-6">$79<span className="text-sm text-gray-400">/month</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><span className="text-red-600 mr-2">✓</span> All Gold features</li>
                <li className="flex items-center"><span className="text-red-600 mr-2">✓</span> Priority scheduling</li>
                <li className="flex items-center"><span className="text-red-600 mr-2">✓</span> Exclusive classes</li>
                <li className="flex items-center"><span className="text-red-600 mr-2">✓</span> Spa access</li>
              </ul>
              <button className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors">
                Choose Plan
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img src="/images/trainfit-logo.svg" alt="TrainFit Logo" className="h-8 mb-4" />
              <p className="text-gray-400">Your journey to a better you starts here.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-red-600">About Us</a></li>
                <li><a href="#" className="hover:text-red-600">Classes</a></li>
                <li><a href="#" className="hover:text-red-600">Schedule</a></li>
                <li><a href="#" className="hover:text-red-600">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li>123 Fitness Street</li>
                <li>Buenos Aires, Argentina</li>
                <li>+54 11 1234-5678</li>
                <li>info@trainfit.com</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-red-600">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-red-600">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-red-600">
                  <i className="fab fa-twitter"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DemoPage;