import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, Mail, Globe, MapPin } from 'lucide-react';
import { ContactButton } from './ContactButton';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '3D Modeling',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({ name: '', email: '', service: '3D Modeling', message: '' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0C0C0C]/90 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-2xl rounded-[32px] sm:rounded-[40px] border-2 border-[#D7E2EA]/20 bg-[#121212] p-6 sm:p-10 text-[#D7E2EA] shadow-2xl z-10 my-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-[#1e1e1e] hover:bg-[#2a2a2a] text-[#D7E2EA] transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#B600A8]/20 flex items-center justify-center text-[#B600A8] mb-2">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="hero-heading text-3xl font-black uppercase tracking-tight">
                  Message Received
                </h3>
                <p className="text-[#D7E2EA]/80 max-w-md font-light text-sm sm:text-base leading-relaxed">
                  Thanks for reaching out! Jack will review your message and respond within 24 hours.
                </p>
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-full border border-[#D7E2EA]/30 hover:border-[#D7E2EA] text-xs font-medium uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Send Another
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-full bg-[#D7E2EA] text-[#0C0C0C] font-semibold text-xs uppercase tracking-widest hover:bg-white transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-8">
                  <h3 className="hero-heading text-3xl sm:text-4xl font-black uppercase tracking-tight">
                    Let&apos;s Work Together
                  </h3>
                  <p className="text-[#D7E2EA]/70 font-light text-sm sm:text-base mt-2">
                    Have a project in mind or want to collaborate? Drop a line below.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-medium tracking-wider text-[#D7E2EA]/60 mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-2xl bg-[#1A1A1A] border border-[#D7E2EA]/15 text-[#D7E2EA] placeholder-[#D7E2EA]/30 text-sm focus:outline-none focus:border-[#B600A8] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-medium tracking-wider text-[#D7E2EA]/60 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-2xl bg-[#1A1A1A] border border-[#D7E2EA]/15 text-[#D7E2EA] placeholder-[#D7E2EA]/30 text-sm focus:outline-none focus:border-[#B600A8] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-medium tracking-wider text-[#D7E2EA]/60 mb-1.5">
                      Service Requested
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#1A1A1A] border border-[#D7E2EA]/15 text-[#D7E2EA] text-sm focus:outline-none focus:border-[#B600A8] transition-colors cursor-pointer"
                    >
                      <option value="3D Modeling">3D Modeling</option>
                      <option value="Rendering">Rendering & Visualization</option>
                      <option value="Motion Design">Motion Design</option>
                      <option value="Branding">Branding & Identity</option>
                      <option value="Web Design">Web Design</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-medium tracking-wider text-[#D7E2EA]/60 mb-1.5">
                      Project Details
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell me about your project goals, timelines, and ideas..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#1A1A1A] border border-[#D7E2EA]/15 text-[#D7E2EA] placeholder-[#D7E2EA]/30 text-sm focus:outline-none focus:border-[#B600A8] transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div className="hidden sm:flex items-center gap-3 text-xs text-[#D7E2EA]/50">
                      <Mail className="w-4 h-4 text-[#B600A8]" />
                      <span>jack@3dcreator.design</span>
                    </div>

                    <ContactButton label="Submit Request" className="w-full sm:w-auto" />
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
