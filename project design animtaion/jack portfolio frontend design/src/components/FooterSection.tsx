import React from 'react';
import { ArrowUp, Instagram, Twitter, Linkedin, Dribbble, Globe } from 'lucide-react';
import { ContactButton } from './ContactButton';

interface FooterSectionProps {
  onContactClick?: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ onContactClick }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-[#0C0C0C] text-[#D7E2EA] pt-16 pb-12 px-6 md:px-10 border-t border-[#D7E2EA]/10 select-none">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        {/* Top Callout */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-[#D7E2EA]/10">
          <div className="max-w-xl">
            <h3 className="hero-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-none mb-3">
              Ready to elevate your vision?
            </h3>
            <p className="text-[#D7E2EA]/60 font-light text-sm sm:text-base uppercase tracking-wider">
              Available for freelance projects, 3D direction, and full design commissions.
            </p>
          </div>

          <ContactButton onClick={onContactClick} />
        </div>

        {/* Links & Socials */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs sm:text-sm font-light uppercase tracking-widest text-[#D7E2EA]/70">
          <div>
            <span className="block text-[#D7E2EA]/40 text-[10px] mb-1">Direct Contact</span>
            <a
              href="mailto:jack@3dcreator.design"
              className="hover:text-white transition-colors underline decoration-[#B600A8] underline-offset-4"
            >
              jack@3dcreator.design
            </a>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Twitter / X
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://behance.net"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Behance
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              LinkedIn
            </a>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 p-3 rounded-full border border-[#D7E2EA]/20 hover:border-[#D7E2EA] transition-colors cursor-pointer"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#D7E2EA]/40 uppercase tracking-widest pt-6 border-t border-[#D7E2EA]/5">
          <span>&copy; {new Date().getFullYear()} Jack. All rights reserved.</span>
          <span>3D Creator Portfolio</span>
        </div>
      </div>
    </footer>
  );
};
