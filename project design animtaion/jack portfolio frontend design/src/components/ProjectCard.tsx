import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ProjectItem } from '../types';
import { LiveProjectButton } from './LiveProjectButton';

interface ProjectCardProps {
  project: ProjectItem;
  index: number;
  totalCards: number;
  onLiveProjectClick?: (project: ProjectItem) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  totalCards,
  onLiveProjectClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'start start'],
  });

  const targetScale = 1 - (totalCards - 1 - index) * 0.03;
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);

  return (
    <div
      ref={containerRef}
      className="sticky top-20 md:top-28 w-full flex items-center justify-center mb-16 md:mb-24"
      style={{
        top: `calc(5rem + ${index * 28}px)`,
      }}
    >
      <motion.div
        style={{
          scale,
        }}
        className="w-full max-w-6xl rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:p-6 md:p-8 flex flex-col justify-between gap-6 shadow-2xl overflow-hidden"
      >
        {/* Top Row Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D7E2EA]/15 pb-4 sm:pb-6">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            {/* Number */}
            <span
              className="font-black text-[#D7E2EA] leading-none select-none"
              style={{ fontSize: 'clamp(2.2rem, 6vw, 80px)' }}
            >
              {project.number}
            </span>

            {/* Category */}
            <span className="uppercase font-medium tracking-widest text-[#D7E2EA]/70 text-xs sm:text-sm md:text-base px-3 sm:px-4 py-1 sm:py-1.5 bg-[#D7E2EA]/5 rounded-full border border-[#D7E2EA]/15">
              {project.category}
            </span>

            {/* Project Name */}
            <h3 className="font-medium uppercase text-[#D7E2EA] text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-tight ml-1 sm:ml-2">
              {project.name}
            </h3>
          </div>

          {/* Live Project Button */}
          <div>
            <LiveProjectButton
              onClick={() => onLiveProjectClick && onLiveProjectClick(project)}
            />
          </div>
        </div>

        {/* Bottom Row - Two Column Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-stretch w-full">
          {/* Left Column (40% width approx - col-span-5) */}
          <div className="md:col-span-5 flex flex-col gap-4 md:gap-6">
            {/* Col1 Image 1 */}
            <div
              className="w-full rounded-[30px] sm:rounded-[40px] md:rounded-[50px] overflow-hidden bg-[#181818]"
              style={{ height: 'clamp(130px, 16vw, 230px)' }}
            >
              <img
                src={project.col1Image1}
                alt={`${project.name} preview 1`}
                className="w-full h-full object-cover rounded-[30px] sm:rounded-[40px] md:rounded-[50px]"
                loading="lazy"
              />
            </div>

            {/* Col1 Image 2 */}
            <div
              className="w-full rounded-[30px] sm:rounded-[40px] md:rounded-[50px] overflow-hidden bg-[#181818]"
              style={{ height: 'clamp(160px, 22vw, 340px)' }}
            >
              <img
                src={project.col1Image2}
                alt={`${project.name} preview 2`}
                className="w-full h-full object-cover rounded-[30px] sm:rounded-[40px] md:rounded-[50px]"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right Column (60% width approx - col-span-7) */}
          <div className="md:col-span-7 flex">
            <div className="w-full h-full min-h-[280px] sm:min-h-[360px] md:min-h-full rounded-[30px] sm:rounded-[40px] md:rounded-[50px] overflow-hidden bg-[#181818]">
              <img
                src={project.col2Image}
                alt={`${project.name} main showcase`}
                className="w-full h-full object-cover rounded-[30px] sm:rounded-[40px] md:rounded-[50px]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
