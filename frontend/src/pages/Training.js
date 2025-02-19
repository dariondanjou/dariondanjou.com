import React from "react";
import NavBar from "../components/NavBar"; // ✅ Import Bottom Navigation

function Training() {
    return (
        <>
            {/* ✅ Page Content Wrapper to Push Nav to Bottom */}
            <div className="page-content">
                <h1>Training Page</h1>
                <p>Learn new skills and enhance your knowledge.</p>
            </div>

            {/* ✅ Fixed Bottom Navigation Bar */}
            <NavBar />
        </>
    );
}

export default Training;
