import React, { useState, useEffect } from "react";
import ChatWidget from "./ChatWidget";

const BIO_TEXT = `Darion D'Anjou is an award-winning writer, director, ai creative architect, trainer, and speaker based in atlanta, georgia. Darion operates darion d'anjou, an ai powered creative studio delivering world-class creative and technical solutions for small to medium businesses, Fortune 500 companies and government organizations including CNN, Coca-Cola, AT&T Time Warner, HBO, Disney, Marvel Studios, SONY Pictures Entertainment, Nike, and the Centers for Disease Control.

Darion's science fiction short film "Pony" screened and won several awards at film festivals in atlanta, new york, los angeles, london, and berlin, and his one-take horror short "Mommy" has generated over 1.8 million views online.

as a visual effects trainer at Digital Domain, the multi-award-winning studio founded by James Cameron, Darion contributed to Academy Award and Emmy-nominated productions such as Spider-man: No Way Home, Black Panther: Wakanda Forever, HBO's Last of Us and more. Darion now serves as a generative ai artist for Meta, where his visual generations were selected as flagship examples shared by Mark Zuckerberg during the 2025 debut of Meta Vibes.`;

const STUDIO_DESCRIPTION =
  "darion d'anjou is an ai powered creative studio that leverages the latest in technology to deliver best of class creative and technology solutions";

function StudioOverlay({ isOpen, onClose }) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(70);

  useEffect(() => {
    if (!isOpen) return;
    const measure = () => {
      const nav = document.querySelector(".navbar");
      if (nav) setNavbarHeight(nav.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="studio-overlay" style={{ bottom: navbarHeight }}>
      {/* Close button */}
      <button className="studio-close" onClick={onClose}>&#x2715;</button>

      <div
        className="studio-overlay-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Column */}
        <div className="studio-overlay-left">
          <div className="studio-overlay-left-top">
            <div className={`studio-bio-section ${bioExpanded ? "bio-expanded" : ""}`}>
              <img
                src="/dariondanjou-profilepicture-large.png"
                alt="Darion D'Anjou"
                className="studio-headshot"
              />
              <h2 className="studio-title">
                ai artist | filmmaker | engineer
              </h2>
              <div className="studio-bio">{BIO_TEXT}</div>
              <button
                className="bio-toggle"
                onClick={() => setBioExpanded(!bioExpanded)}
              >
                {bioExpanded ? "less..." : "more..."}
              </button>
            </div>
            <div className="studio-description">{STUDIO_DESCRIPTION}</div>
          </div>
        </div>

        {/* Right Column */}
        <div className="studio-overlay-right">
          <ChatWidget />
        </div>
      </div>
    </div>
  );
}

export default StudioOverlay;
