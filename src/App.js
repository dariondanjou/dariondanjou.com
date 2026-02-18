import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Training from "./pages/Training";
import Admin from "./pages/Admin";
import NavBar from "./components/NavBar";
import StudioOverlay from "./components/StudioOverlay";
import "./App.css";

function App() {
    const [overlayOpen, setOverlayOpen] = useState(false);

    const handleToggleOverlay = () => {
        setOverlayOpen((prev) => !prev);
    };

    const handleCloseOverlay = () => {
        setOverlayOpen(false);
    };

    return (
        <div className="App">
            {/* Page Content */}
            <div className="page-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/training" element={<Training />} />
                    <Route path="/admin" element={<Admin />} />
                </Routes>
            </div>

            {/* Studio Overlay (pull-up) */}
            <StudioOverlay isOpen={overlayOpen} onClose={handleCloseOverlay} />

            {/* Fixed Bottom Navigation */}
            <NavBar onToggleOverlay={handleToggleOverlay} />
        </div>
    );
}

export default App;
