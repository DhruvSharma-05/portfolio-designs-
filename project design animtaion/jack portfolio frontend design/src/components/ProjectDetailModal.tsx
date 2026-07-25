import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ArrowRight, Layers, Tag, CheckCircle } from 'lucide-react';
import { ProjectItem } from '../types';

interface ProjectDetailModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0C0C0C]/90 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative w-full max-w-4xl rounded-[32px] sm:rounded-[48px] border-2 border-[#D7E2EA]/20 bg-[#121212] p-6 sm:p-10 text-[#D7E2EA] shadow-2xl z-10 my-auto max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 rounded-full bg-[#1e1e1e] hover:bg-[#2a2a2a] text-[#D7E2EA] transition-colors cursor-pointer z-20"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col gap-3 mb-8 border-b border-[#D7E2EA]/15 pb-6">
            <div className="flex items-center gap-3">
              <span className="font-black text-[#D7E2EA] text-2xl sm:text-3xl">
                {project.number}
              </span>
              <span className="uppercase text-xs font-semibold tracking-widest text-[#D7E2EA]/70 px-3 py-1 bg-[#D7E2EA]/10 rounded-full border border-[#D7E2EA]/15">
                {project.category}
              </span>
            </div>
            <h2 className="hero-heading text-3xl sm:text-5xl font-black uppercase tracking-tight">
              {project.name}
            </h2>
            <p className="text-[#D7E2EA]/70 font-light text-sm sm:text-base max-w-2xl">
              High-impact 3D visual direction, lighting, materials, and interactive web layout crafted for {project.name}.
            </p>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div className="rounded-3xl overflow-hidden bg-[#181818] border border-[#D7E2EA]/10">
              <img
                src={project.col2Image}
                alt={`${project.name} main view`}
                className="w-full h-64 sm:h-80 object-cover"
              />
            </div>
            <div className="grid grid-rows-2 gap-4">
              <div className="rounded-2xl overflow-hidden bg-[#181818] border border-[#D7E2EA]/10">
                <img
                  src={project.col1Image1}
                  alt={`${project.name} detail 1`}
                  className="w-full h-36 sm:h-38 object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden bg-[#181818] border border-[#D7E2EA]/10">
                <img
                  src={project.col1Image2}
                  alt={`${project.name} detail 2`}
                  className="w-full h-36 sm:h-38 object-cover"
                />
              </div>
            </div>
          </div>

          {/* Project Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#1A1A1A] border border-[#D7E2EA]/10 mb-8">
            <div>
              <span className="block text-xs uppercase font-medium text-[#D7E2EA]/50 mb-1">
                Role
              </span>
              <span className="font-medium text-sm text-[#D7E2EA]">
                3D Art Director & Web Lead
              </span>
            </div>
            <div>
              <span className="block text-xs uppercase font-medium text-[#D7E2EA]/50 mb-1">
                Tools
              </span>
              <span className="font-medium text-sm text-[#D7E2EA]">
                Blender, Cinema 4D, Octane, React
              </span>
            </div>
            <div>
              <span className="block text-xs uppercase font-medium text-[#D7E2EA]/50 mb-1">
                Year
              </span>
              <span className="font-medium text-sm text-[#D7E2EA]">2026</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#D7E2EA]/60">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Live Case Study & Interactive Demo</span>
            </div>

            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#D7E2EA] text-[#0C0C0C] font-semibold text-xs sm:text-sm uppercase tracking-widest hover:bg-white transition-colors cursor-pointer"
            >
              <span>Close Case Study</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
