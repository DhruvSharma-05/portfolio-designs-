import React, { useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { MarqueeSection } from './components/MarqueeSection';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { ProjectsSection } from './components/ProjectsSection';
import { FooterSection } from './components/FooterSection';
import { ContactModal } from './components/ContactModal';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { ProjectItem } from './types';

export default function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const handleOpenContact = () => {
    setIsContactOpen(true);
  };

  const handleCloseContact = () => {
    setIsContactOpen(false);
  };

  const handleOpenProject = (project: ProjectItem) => {
    setSelectedProject(project);
  };

  const handleCloseProject = () => {
    setSelectedProject(null);
  };

  return (
    <div className="bg-[#0C0C0C] text-[#D7E2EA] font-sans overflow-x-clip min-h-screen">
      {/* 1. HeroSection */}
      <HeroSection onContactClick={handleOpenContact} />

      {/* 2. MarqueeSection */}
      <MarqueeSection />

      {/* 3. AboutSection */}
      <AboutSection onContactClick={handleOpenContact} />

      {/* 4. ServicesSection */}
      <ServicesSection />

      {/* 5. ProjectsSection */}
      <ProjectsSection onLiveProjectClick={handleOpenProject} />

      {/* Footer Section */}
      <FooterSection onContactClick={handleOpenContact} />

      {/* Interactive Contact Modal */}
      <ContactModal isOpen={isContactOpen} onClose={handleCloseContact} />

      {/* Interactive Project Detail Modal */}
      <ProjectDetailModal project={selectedProject} onClose={handleCloseProject} />
    </div>
  );
}
