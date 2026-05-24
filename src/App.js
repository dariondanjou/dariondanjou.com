import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Training from "./pages/Training";
import Admin from "./pages/Admin";
import NextWeek from "./pages/NextWeek";
import NavBar from "./components/NavBar";
import StudioOverlay from "./components/StudioOverlay";
import "./App.css";

function App() {
    const [overlayOpen, setOverlayOpen] = useState(false);
    const location = useLocation();
    const isNextWeek = location.pathname.startsWith("/nextweek");

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
                    <Route path="/nextweek" element={<NextWeek />} />
                </Routes>
            </div>

            {/* Studio Overlay (pull-up) — hidden on /nextweek so its own page chrome stands alone */}
            {!isNextWeek && (
                <StudioOverlay isOpen={overlayOpen} onClose={handleCloseOverlay} />
            )}

            {/* Fixed Bottom Navigation — hidden on /nextweek */}
            {!isNextWeek && <NavBar onToggleOverlay={handleToggleOverlay} />}
        </div>
    );
}

export default App;
