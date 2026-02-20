import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "../App.css";

const logoMain = process.env.REACT_APP_LOGO_MAIN;
const logoCategories = process.env.REACT_APP_LOGO_CATEGORIES;
// const iconContact = process.env.REACT_APP_ICON_CONTACT;
const iconYouTube = process.env.REACT_APP_ICON_YOUTUBE;
const iconInstagram = process.env.REACT_APP_ICON_INSTAGRAM;
const iconTikTok = process.env.REACT_APP_ICON_TIKTOK;
const iconX = process.env.REACT_APP_ICON_X;
// const iconTwitch = process.env.REACT_APP_ICON_TWITCH;
const iconLinkedIn = process.env.REACT_APP_ICON_LINKEDIN;
const iconDiscord = process.env.REACT_APP_ICON_DISCORD;
const iconWhatsapp = process.env.REACT_APP_ICON_WHATSAPP;
const iconShare = process.env.REACT_APP_ICON_SHARE;

function NavBar({ expandedImage, onToggleOverlay }) {
    const [expanded, setExpanded] = useState(false);
    const [expandedType, setExpandedType] = useState(null);
    const [email, setEmail] = useState("");
    const location = useLocation();

    // Expand/Collapse logic with smooth height transition
    const toggleExpand = (type) => {
        collapseExpanded(() => {
            if (expandedType !== type) {
                setTimeout(() => {
                    setExpanded(true);
                    setExpandedType(type);
                }, 100);
            }
        });
    };

    const collapseExpanded = (callback) => {
        const navbarElement = document.querySelector(".expanded-navbar");
        if (!navbarElement) return;

        navbarElement.classList.add("collapsing");

        setTimeout(() => {
            setExpanded(false);
            setExpandedType(null);
            navbarElement.classList.remove("collapsing");

            if (callback) {
                setTimeout(callback, 100);
            }
        }, 300);
    };

    const handleEmailSubmit = async () => {
        if (!email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
            alert("Please enter a valid email address.");
            return;
        }

        try {
            const response = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                alert("You have been subscribed successfully!");
                setEmail("");
                collapseExpanded();
            } else {
                alert("Failed to subscribe. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting email:", error);
            alert("An error occurred. Please try again.");
        }
    };

    const handleLogoClick = () => {
        // Collapse any expanded section first
        if (expanded) {
            collapseExpanded();
        }
        // Toggle the studio overlay
        if (onToggleOverlay) {
            onToggleOverlay();
        }
    };

    return (
        <>
            {/* Expanded Navbar Section */}
            <div className={`expanded-navbar ${expanded ? "expanded" : ""} ${expandedType === "email" ? "email-expanded" : ""} ${expandedType === "share" ? "sharing-expanded" : ""}`}>
                <div className="expanded-content">
                    {expandedType === "email" ? (
                        <div className="email-container">
                            <div className="email-input-container">
                                <input
                                    type="email"
                                    className="email-input"
                                    placeholder="enter your email to stay updated!"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <button className="email-submit" onClick={handleEmailSubmit}>&#x2192;</button>
                            </div>
                        </div>
                    ) : expandedType === "share" ? (
                        <div className="share-options">
                            <span className="share-label">share to: </span>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer"> Facebook </a>
                            <a href={`https://twitter.com/intent/tweet?url=${window.location.href}`} target="_blank" rel="noopener noreferrer"> Twitter </a>
                            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`} target="_blank" rel="noopener noreferrer"> LinkedIn </a>
                            <a href={`https://api.whatsapp.com/send?text=${window.location.href}`} target="_blank" rel="noopener noreferrer"> WhatsApp </a>
                            <a href={`mailto:?subject=Check this out&body=${window.location.href}`} target="_blank" rel="noopener noreferrer"> Email </a>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Main Navbar */}
            <nav className={`navbar ${expandedImage ? "expanded" : ""}`}>
                <div className="nav-left">
                    <button
                        className="nav-link-button"
                        onClick={handleLogoClick}
                    >
                        <img src={logoMain} alt="Darion D'Anjou | Creativity x Technology" className="nav-logo" />
                    </button>
                </div>

                {(location.pathname === "/" || location.pathname === "/portfolio") && (
                    <div className="nav-center">
                        <img src={logoCategories} alt="Still | Moving | Interactive" className="nav-categories" />
                    </div>
                )}

                <div className="nav-chat">
                    <button className="nav-link-button" onClick={handleLogoClick} title="chat with darion d'anjou ai">
                        <img src="/icon-chat.png" alt="Chat" className="nav-icon nav-icon-chat" />
                    </button>
                </div>

                <div className="nav-right">
                    {/* Email icon hidden for now
                    <button className="nav-link-button" onClick={() => toggleExpand("email")}>
                        <img src={iconContact} alt="Sign up for updates" className="nav-icon" />
                    </button>
                    */}
                    <a href="https://www.youtube.com/dariondanjou" target="_blank" rel="noopener noreferrer" title="darion d'anjou youtube">
                        <img src={iconYouTube} alt="YouTube" className="nav-icon" />
                    </a>
                    <a href="https://instagram.com/dariondanjou" target="_blank" rel="noopener noreferrer" title="darion d'anjou instagram">
                        <img src={iconInstagram} alt="Instagram" className="nav-icon" />
                    </a>
                    <a href="https://www.tiktok.com/dariondanjou" target="_blank" rel="noopener noreferrer" title="darion d'anjou tiktok">
                        <img src={iconTikTok} alt="TikTok" className="nav-icon" />
                    </a>
                    <a href="https://x.com/dariondanjou" target="_blank" rel="noopener noreferrer" title="darion d'anjou x">
                        <img src={iconX} alt="X" className="nav-icon" />
                    </a>
                    {/* Twitch hidden for now
                    <a href="https://www.twitch.tv/dariondanjou" target="_blank" rel="noopener noreferrer" title="darion d'anjou twitch">
                        <img src={iconTwitch} alt="Twitch" className="nav-icon" />
                    </a>
                    */}
                    <a href="https://www.linkedin.com/in/darion-d-anjou-39a3a926/" target="_blank" rel="noopener noreferrer" title="darion d'anjou linkedin">
                        <img src={iconLinkedIn} alt="LinkedIn" className="nav-icon" />
                    </a>
                    <a href="https://discord.gg/ejEBJss8gM" target="_blank" rel="noopener noreferrer" title="dariondanjou+ discord">
                        <img src={iconDiscord} alt="Discord" className="nav-icon" />
                    </a>
                    <a href="https://chat.whatsapp.com/GelyV1XoEL9HVnlA9QrxDn" target="_blank" rel="noopener noreferrer" title="ai makers generation whatsapp">
                        <img src={iconWhatsapp} alt="WhatsApp" className="nav-icon" />
                    </a>
                    <button className="nav-link-button" onClick={() => toggleExpand("share")} title="share">
                        <img src={iconShare} alt="Share" className="nav-icon" />
                    </button>
                </div>
            </nav>
        </>
    );
}

export default NavBar;
