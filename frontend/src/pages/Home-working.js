import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import NavBar from "../components/NavBar"; // ✅ Import Bottom Navigation
import "./Home.css"; // ✅ Import styles

function Home() {
    const [images, setImages] = useState([]);
    const [virtualImages, setVirtualImages] = useState([]);
    const [expandedImage, setExpandedImage] = useState(null);
    const [hoveredImage, setHoveredImage] = useState(null);
    const [hoverTimeout, setHoverTimeout] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        axios.get("http://localhost:5000/api/images")
            .then(response => {
                setImages(response.data);
                setVirtualImages([...response.data, ...response.data]); // Start with a looped list
            })
            .catch(error => {
                console.error("Error fetching images:", error);
            });
    }, []);

    // ✅ Infinite Scroll - Append more images when scrolling near bottom
    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
            setVirtualImages(prev => [...prev, ...images]); // Repeat images infinitely
        }
    }, [images]);

    // ✅ Expand image to full-screen on click
    const handleImageClick = (image) => {
        setExpandedImage(image);
    };

    // ✅ Close expanded image when clicked
    const closeExpandedImage = () => {
        setExpandedImage(null);
    };

    // ✅ Handle Hover Delay for Showing Details
    const handleMouseEnter = (image) => {
        const timeout = setTimeout(() => {
            setHoveredImage(image);
        }, 3000); // 3-second delay
        setHoverTimeout(timeout);
    };

    const handleMouseLeave = () => {
        clearTimeout(hoverTimeout);
        setHoveredImage(null);
    };

    return (
        <>
            <div className="page-content">
                <div className="gallery-container" ref={containerRef} onScroll={handleScroll}>
                    <div className="image-grid">
                        {virtualImages.map((image, index) => (
                            <div key={index} className="image-wrapper"
                                 onClick={() => handleImageClick(image)}
                                 onMouseEnter={() => handleMouseEnter(image)}
                                 onMouseLeave={handleMouseLeave}
                            >
                                <img src={image.url} alt="Portfolio" className="portfolio-image" />
                                {hoveredImage === image && (
                                    <div className="image-overlay">
                                        <p className="image-description">{image.description}</p>
                                        <p className="image-notes">{image.notes}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ✅ Full-Screen Image Modal */}
            {expandedImage && (
                <div className="fullscreen-image-container" onClick={closeExpandedImage}>
                    <img src={expandedImage.url} alt="Expanded" className="fullscreen-image" />
                    <div className="fullscreen-info">
                        <p className="expanded-description">{expandedImage.description}</p>
                        <p className="expanded-notes">{expandedImage.notes}</p>
                    </div>
                </div>
            )}

            <NavBar expandedImage={expandedImage} /> {/* ✅ Pass expandedImage state */}
        </>
    );
}

export default Home;
