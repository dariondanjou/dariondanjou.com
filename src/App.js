import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Training from "./pages/Training";
import Admin from "./pages/Admin";
import NavBar from "./components/NavBar"; // ✅ Import Navbar
import "./App.css"; // ✅ Ensure styles are applied

function App() {
    return (
        <div className="App">
            {/* ✅ Page Content Wrapper to Prevent Overlap with Navbar */}
            <div className="page-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/training" element={<Training />} />
                    <Route path="/admin" element={<Admin />} />
                </Routes>
            </div>

            {/* ✅ Fixed Bottom Navigation */}
            <NavBar />
        </div>
    );
}

export default App;
