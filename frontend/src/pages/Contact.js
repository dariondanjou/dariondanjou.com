import React, { useState, useRef, useEffect } from "react";
import NavBar from "../components/NavBar";
import axios from "axios";
import "../App.css";

const BASE_IMAGE_URL = process.env.REACT_APP_IMAGE_BASE_URL;

function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        projectType: "narrative film",
        projectSubject: "",
        projectDescription: "",
        trainingType: "midjourney quickstart (1 hour one-on-one $250)",
    });

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [trainingDropdownOpen, setTrainingDropdownOpen] = useState(false);
    const [showTrainingOptions, setShowTrainingOptions] = useState(false);
    const [showCalendly, setShowCalendly] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [promoImage, setPromoImage] = useState("");

    const dropdownRef = useRef(null);
    const trainingDropdownRef = useRef(null);

    const projectTypes = [
        "narrative film", "commercial", "music video", "game", "digital experience",
        "website", "application", "training", "consultation", "other"
    ];

    const trainingOptions = {
        "midjourney quickstart (1 hour one-on-one $250)": `${BASE_IMAGE_URL}/image%20(22).png`,
        "midjourney quickstart (2 hour group $50)": `${BASE_IMAGE_URL}/image%20(29).png`,
        "ai filmmaking quickstart (1 hour one-on-one $250)": `${BASE_IMAGE_URL}/image%20(96).png`,
        "ai filmmaking quickstart (2 hour group $50)": `${BASE_IMAGE_URL}/image%20(18).png`,
        "custom consultation (1 hour one-on-one $250)": `${BASE_IMAGE_URL}/image%20(15).png`,
        "10 minute free consultation (one-on-one $0)": `${BASE_IMAGE_URL}/image%20(10).png`
    };

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });

        if (name === "projectType") {
            setShowTrainingOptions(value === "training");
            setDropdownOpen(false);
            setShowCalendly(false);
            setPromoImage(trainingOptions[formData.trainingType]);
        }

        if (name === "trainingType") {
            setShowCalendly(true);
            setPromoImage(trainingOptions[value]);
            setTrainingDropdownOpen(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const subjectLine = `new project: ${formData.projectType.toUpperCase()} - ${formData.projectSubject}`;
        const emailBody = `
            new project submission:
            name: ${formData.name}
            email: ${formData.email}
            
            ${formData.projectType.toUpperCase()} - ${formData.projectSubject}
            
            ${formData.projectDescription}
        `;

        try {
            await axios.post("/api/send-email", {
                to: "dariondanjou@gmail.com",
                subject: subjectLine,
                body: emailBody,
            });

            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000);
            setFormData({
                name: "",
                email: "",
                projectType: "narrative film",
                projectSubject: "",
                projectDescription: "",
                trainingType: "midjourney quickstart (1 hour one-on-one $250)",
            });
            setShowTrainingOptions(false);
            setShowCalendly(false);
            setPromoImage(trainingOptions["midjourney quickstart (1 hour one-on-one $250)"]);
        } catch (error) {
            console.error("error sending email:", error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (trainingDropdownRef.current && !trainingDropdownRef.current.contains(event.target)) {
                setTrainingDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <div className="contact-container">
                <div className="contact-left">
                    <p className="contact-intro">
                        darion d’anjou provides visual development for and production of narrative films, commercials, music videos, games, digital experiences, and apps, as well as creative and technical training and consultation
                    </p>

                    {showTrainingOptions && (
                        <div className="training-info">
                            <img src={promoImage} alt="Training Promo" className="promo-image" />
                            <p>personalized training to elevate your creative skills</p>
                        </div>
                    )}

                    <p className="contact-footer">
                        darion d’anjou is an ai powered creative studio that leverages the latest in technology to deliver best of class creative and technology solutions
                    </p>
                </div>

                <div className="contact-right">
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <input type="text" name="name" value={formData.name} placeholder="your name" onChange={(e) => handleChange("name", e.target.value)} required />

                        <input type="email" name="email" value={formData.email} placeholder="your@email.com" onChange={(e) => handleChange("email", e.target.value)} required />

                        <label>what kind of project do you have in mind?</label>
                        <div className="custom-dropdown" ref={dropdownRef}>
                            <div className="dropdown-header" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                {formData.projectType}
                            </div>
                            {dropdownOpen && (
                                <ul className="dropdown-list">
                                    {projectTypes.map((type, index) => (
                                        <li key={index} className="dropdown-item" onClick={() => handleChange("projectType", type)}>
                                            {type}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {showTrainingOptions && (
                            <>
                                <label>which training are you interested in?</label>
                                <div className="custom-dropdown" ref={trainingDropdownRef}>
                                    <div className="dropdown-header" onClick={() => setTrainingDropdownOpen(!trainingDropdownOpen)}>
                                        {formData.trainingType}
                                    </div>
                                    {trainingDropdownOpen && (
                                        <ul className="dropdown-list">
                                            {Object.keys(trainingOptions).map((option, index) => (
                                                <li key={index} className="dropdown-item" onClick={() => handleChange("trainingType", option)}>
                                                    {option}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </>
                        )}

                        <input type="text" name="projectSubject" value={formData.projectSubject} placeholder="working title for your project" onChange={(e) => handleChange("projectSubject", e.target.value)} required />

                        <textarea name="projectDescription" value={formData.projectDescription} placeholder="enter details about your project here" onChange={(e) => handleChange("projectDescription", e.target.value)} required />

                        <button type="submit" className="submit-button">submit!</button>
                    </form>

                    {submitted && <p className="thank-you-message">thank you! if you need to add detail, feel free to submit another form.</p>}
                </div>
            </div>

            <NavBar />
        </>
    );
}

export default Contact;
