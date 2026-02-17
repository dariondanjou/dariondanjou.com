import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import "./Home.css";

function Home() {
    const [images, setImages] = useState([]);
    const [virtualImages, setVirtualImages] = useState([]);
    const [expandedImageIndex, setExpandedImageIndex] = useState(null);
    const [hoveredImage, setHoveredImage] = useState(null);
    const [hoverTimeout, setHoverTimeout] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        axios.get("/api/images")
            .then(response => {
                setImages(response.data);
                setVirtualImages([...response.data, ...response.data]);
            })
            .catch(error => {
                console.error("Error fetching images:", error);
            });
    }, []);

    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
            setVirtualImages(prev => [...prev, ...images]);
        }
    }, [images]);

    const openImage = (index) => {
        setExpandedImageIndex(index);
    };

    const closeImage = () => {
        setExpandedImageIndex(null);
    };

    const handleKeyDown = useCallback((event) => {
        if (expandedImageIndex !== null) {
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                setExpandedImageIndex((prevIndex) => (prevIndex + 1) % images.length);
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                setExpandedImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
            } else if (event.key === 'Escape') {
                closeImage();
            }
        }
    }, [expandedImageIndex, images.length]);

    const handleWheel = useCallback((event) => {
        if (expandedImageIndex !== null) {
            if (event.deltaY > 0) {
                setExpandedImageIndex((prevIndex) => (prevIndex + 1) % images.length);
            } else if (event.deltaY < 0) {
                setExpandedImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
            }
        }
    }, [expandedImageIndex, images.length]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('wheel', handleWheel);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('wheel', handleWheel);
        };
    }, [handleKeyDown, handleWheel]);

    return (
        <>
            <div className="page-content">
                <div className="gallery-container" ref={containerRef} onScroll={handleScroll}>
                    <div className="image-grid">
                        {virtualImages.map((image, index) => (
                            <div key={index} className="image-wrapper"
                                 onClick={() => openImage(index)}
                                 onMouseEnter={() => {
                                     const timeout = setTimeout(() => setHoveredImage(image), 3000);
                                     setHoverTimeout(timeout);
                                 }}
                                 onMouseLeave={() => {
                                     clearTimeout(hoverTimeout);
                                     setHoveredImage(null);
                                 }}
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

            {expandedImageIndex !== null && (
                <div className="fullscreen-image-container" onClick={closeImage}>
                    <img src={virtualImages[expandedImageIndex].url} alt="Expanded" className="fullscreen-image" />
                    <div className="fullscreen-info">
                        <p className="expanded-description">{virtualImages[expandedImageIndex].description}</p>
                        <p className="expanded-notes">{virtualImages[expandedImageIndex].notes}</p>
                    </div>
                </div>
            )}
        </>
    );
}

export default Home;
