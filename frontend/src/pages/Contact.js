import React, { useState, useRef, useEffect } from "react";
import NavBar from "../components/NavBar";
import axios from "axios";
import "../App.css";

const BASE_IMAGE_URL = process.env.REACT_APP_IMAGE_BASE_URL;

function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        projectType: "Narrative Film",
        projectSubject: "",
        projectDescription: "",
        trainingType: "",
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
        "Narrative Film", "Commercial", "Music Video", "Game", "Digital Experience",
        "Website", "Application", "Training", "Consultation", "Other"
    ];

    const trainingOptions = {
        "Midjourney Quickstart (1 Hour One-on-One $250)": `${BASE_IMAGE_URL}/midjourney-training.png`,
        "Midjourney Quickstart (2 Hour Group $50)": `${BASE_IMAGE_URL}/midjourney-training.png`,
        "AI Filmmaking Quickstart (1 Hour One-on-One $250)": `${BASE_IMAGE_URL}/filmmaking-training.png`,
        "AI Filmmaking Quickstart (2 Hour Group $50)": `${BASE_IMAGE_URL}/filmmaking-training.png`,
        "Custom Consultation (1 Hour One-on-One $250)": `${BASE_IMAGE_URL}/consultation.png`,
        "10 Minute Free Consultation (One-on-One $0)": `${BASE_IMAGE_URL}/free-consultation.png`
    };

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });

        if (name === "projectType") {
            setShowTrainingOptions(value === "Training");
            setDropdownOpen(false);
            setShowCalendly(false);
            setPromoImage("");
        }

        if (name === "trainingType") {
            setShowCalendly(true);
            setPromoImage(trainingOptions[value]);
            setTrainingDropdownOpen(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const subjectLine = `NEW PROJECT: ${formData.projectType.toUpperCase()} - ${formData.projectSubject}`;
        const emailBody = `
            NEW PROJECT SUBMISSION:
            Name: ${formData.name}
            Email: ${formData.email}
            
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
                projectType: "Narrative Film",
                projectSubject: "",
                projectDescription: "",
                trainingType: "",
            });
            setShowTrainingOptions(false);
            setShowCalendly(false);
            setPromoImage("");
        } catch (error) {
            console.error("Error sending email:", error);
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
            <div className="page-content">
                <h1 className="contact-title">
                    <img src={`${BASE_IMAGE_URL}/title-contact.png`} alt="CONTACT" />
                </h1>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <label>Name</label>
                    <input type="text" name="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />

                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required />

                    <label>What kind of project do you have in mind?</label>
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
                            <label>Select Training Type</label>
                            <div className="custom-dropdown" ref={trainingDropdownRef}>
                                <div className="dropdown-header" onClick={() => setTrainingDropdownOpen(!trainingDropdownOpen)}>
                                    {formData.trainingType || "Select training"}
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

                    <label>Project Subject</label>
                    <input type="text" name="projectSubject" value={formData.projectSubject} onChange={(e) => handleChange("projectSubject", e.target.value)} required />

                    <label>Tell us more about your project...</label>
                    <textarea name="projectDescription" value={formData.projectDescription} onChange={(e) => handleChange("projectDescription", e.target.value)} required />

                    {promoImage && <img src={promoImage} alt="Training Promo" className="promo-image" />}
                    {showCalendly && <div className="calendly-widget">Calendly Widget Here - Select Date & Make Payment</div>}

                    <button type="submit" className="submit-button">Submit!</button>
                </form>
                {submitted && <p className="thank-you-message">Thank you! If you need to add detail, feel free to submit another form.</p>}
            </div>
            <NavBar />
        </>
    );
}

export default Contact;
