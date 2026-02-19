import React, { useState } from "react";
import ChatWidget from "./ChatWidget";

const BIO_TEXT = `Darion D'Anjou is an award-winning writer, director, ai creative architect, and visual effects supervisor based in atlanta, georgia. he operates Darion D'Anjou Productions, a full-service film production company delivering world-class creative solutions for Fortune 500 companies and government organizations\u2014including CNN, Coca-Cola, AT&T Time Warner, HBO, Disney, Marvel Studios, SONY Pictures Entertainment, Nike, and the Centers for Disease Control.

his science fiction short film "Pony" won seven of eleven awards at the Constellation Film Festival, including best picture and best direction. his one-take horror short "Mommy" has generated over 1.8 million views online.

as a visual effects trainer at Digital Domain\u2014the multi-award-winning studio founded by James Cameron\u2014Darion developed pioneering training programs leveraging generative ai and prompt engineering for vfx artists on Academy Award and Emmy-nominated productions. he now serves as a generative ai artist for Meta, where his visual generations were selected as flagship examples shared by Mark Zuckerberg during the 2025 debut of Vibes.`;

const STUDIO_DESCRIPTION =
  "darion d'anjou is an ai powered creative studio that leverages the latest in technology to deliver best of class creative and technology solutions";

function StudioOverlay({ isOpen, onClose }) {
  const [bioExpanded, setBioExpanded] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="studio-overlay">
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
                {bioExpanded ? "less" : "more..."}
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
