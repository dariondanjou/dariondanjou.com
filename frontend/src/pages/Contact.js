import React from "react";
import NavBar from "../components/NavBar"; // ✅ Import Bottom Navigation

function Contact() {
    return (
        <>
            {/* ✅ Page Content Wrapper to Push Nav to Bottom */}
            <div className="page-content">
                <h1>Contact</h1>
                <p>Feel free to reach out via email or social media.</p>
            </div>

            {/* ✅ Fixed Bottom Navigation Bar */}
            <NavBar />
        </>
    );
}

export default Contact;

