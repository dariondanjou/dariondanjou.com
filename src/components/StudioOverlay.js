import React from "react";
import ChatWidget from "./ChatWidget";

const BIO_TEXT = `Darion D'Anjou is an award-winning writer, director, AI creative architect, and visual effects supervisor based in Atlanta, Georgia. He operates Darion D'Anjou Productions, a full-service film production company delivering world-class creative solutions for Fortune 500 companies and government organizations\u2014including CNN, Coca-Cola, AT&T Time Warner, HBO, Disney, Marvel Studios, SONY Pictures Entertainment, Nike, and the Centers for Disease Control.

His science fiction short film "Pony" won seven of eleven awards at the Constellation Film Festival, including Best Picture and Best Direction. His one-take horror short "Mommy" has generated over 1.8 million views online.

As a Visual Effects Trainer at Digital Domain\u2014the multi-award-winning studio founded by James Cameron\u2014Darion developed pioneering training programs leveraging generative AI and prompt engineering for VFX artists on Academy Award and Emmy-nominated productions. He now serves as a Generative AI Artist for Meta, where his visual generations were selected as flagship examples shared by Mark Zuckerberg during the 2025 debut of Vibes.`;

const STUDIO_DESCRIPTION =
  "darion d'anjou is an ai powered creative studio that leverages the latest in technology to deliver best of class creative and technology solutions";

function StudioOverlay({ isOpen, onClose }) {
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
            <div className="studio-header">
              <img
                src="/dariondanjou-profilepicture-large.png"
                alt="Darion D'Anjou"
                className="studio-headshot"
              />
              <div className="studio-header-text">
                <h2 className="studio-title">
                  AI Artist | Filmmaker | Engineer
                </h2>
              </div>
            </div>
            <div className="studio-bio">{BIO_TEXT}</div>
            <div className="studio-description">{STUDIO_DESCRIPTION}</div>
            <button
              className="studio-cta"
              onClick={() => {
                const chatInput = document.querySelector(".chat-input");
                if (chatInput) chatInput.focus();
              }}
            >
              Let's Work Together. Start a Chat &#x2192;
            </button>
          </div>
          <div className="studio-overlay-left-bottom">
            <span className="studio-label">AI Creative Studio</span>
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
