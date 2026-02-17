import React, { useState, useRef, useEffect } from "react";
import NavBar from "../components/NavBar";
import axios from "axios";
import "../App.css";
import { useLocation } from "react-router-dom";


const BASE_IMAGE_URL = process.env.REACT_APP_IMAGE_BASE_URL;

// Image constants
const bookArrowFree10mins = `${BASE_IMAGE_URL}/book-arrow-free-10mins.png`;
const bookArrowFreeDemo = `${BASE_IMAGE_URL}/book-arrow-free-demo.png`;
const bookArrowOneOnOne = `${BASE_IMAGE_URL}/book-arrow-one-on-one.png`;
const contactFieldLineDropdownArrow = `${BASE_IMAGE_URL}/contact-field-line-dropdownarrow.png`;
const contactFieldLine = `${BASE_IMAGE_URL}/contact-field-line.png`;
const contactFieldLineArrow = `${BASE_IMAGE_URL}/contact-field-line-arrow.png`;
const logoDarionDanjou = `${BASE_IMAGE_URL}/logo-dariondanjou-creativityxtechnology.png`;
const logoStillMoving = `${BASE_IMAGE_URL}/logo-stillmovinginteractive.png`;
const scanlines = `${BASE_IMAGE_URL}/scanlines.png`;
const titleContact = `${BASE_IMAGE_URL}/title-contact.png`;
const titleTraining = `${BASE_IMAGE_URL}/title-training.png`;
const twinkles = `${BASE_IMAGE_URL}/twinkles.png`;


function Contact() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const trainingQuery = queryParams.get("training");    
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        projectType: trainingQuery ? "training" : "narrative film", // Default to "narrative film" if no training query
        projectSubject: "",
        projectDescription: "",
        trainingType: trainingQuery || "", // Pre-select training if available, otherwise leave blank
    });
    

    useEffect(() => {
        if (trainingQuery) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                projectType: "training",
                trainingType: trainingQuery
            }));
            setShowTrainingOptions(true);
            setShowCalendly(true);
            setTrainingDropdownOpen(false); // Ensures training dropdown is collapsed
            setPromoImage(trainingOptions[trainingQuery]); // Updates the training image
            setTrainingDescription(trainingDescriptions[trainingQuery]); // Updates the training description
        }
    }, [trainingQuery]);
    
    

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
        "10 minute free consultation (one-on-one $0)": `${BASE_IMAGE_URL}/image%20(10).png`,
        "1 hour free group demo ($0)": `${BASE_IMAGE_URL}/image%20(19).png`
    };

    const trainingDescriptions = {
        "midjourney quickstart (1 hour one-on-one $250)": "This one-on-one session will get you from beginner to advanced in AI image generation using Midjourney.",
        "midjourney quickstart (2 hour group $50)": "Join a group training session to master Midjourney and create stunning AI-generated images.",
        "ai filmmaking quickstart (1 hour one-on-one $250)": "A private AI filmmaking training session covering automated video creation and storytelling.",
        "ai filmmaking quickstart (2 hour group $50)": "A collaborative session for learning AI filmmaking techniques with a group.",
        "custom consultation (1 hour one-on-one $250)": "Tailored one-on-one consulting to address your specific AI creative workflow needs.",
        "10 minute free consultation (one-on-one $0)": "A quick free consultation to discuss AI creativity and see how we can help.",
        "1 hour free group demo ($0)": "A one hour group demonstration of the creative possibilities available using the latest AI tools."
    };

    const [trainingDescription, setTrainingDescription] = useState(trainingDescriptions["midjourney quickstart (1 hour one-on-one $250)"]);    
    

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
            setTrainingDescription(trainingDescriptions[value]); // Update training description
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
                    <div className="contact-title-wrapper">
                        <img src={titleContact} alt="Contact Title" className="title-contact-image" />
                        <p className="contact-intro">
                            darion d’anjou provides visual development for and production of narrative films, commercials, music videos, games, digital experiences, and apps, as well as creative and technical training and consultation
                        </p>
                        {showTrainingOptions && (
                        <div className="training-info">
                            <img src={promoImage} alt="Training Promo" className="promo-image" />
                            <p>{trainingDescription}</p> {/* Dynamically update text */}
                        </div>
                    )}                        
                    </div>

                    <p className="contact-footer">
                        darion d’anjou is an ai powered creative studio that leverages the latest in technology to deliver best of class creative and technology solutions
                    </p>
                </div>

                <div className="contact-right">
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <p></p>
                        <p></p>
                        <input type="text" name="name" value={formData.name} placeholder="your name" onChange={(e) => handleChange("name", e.target.value)} required />
                        <img src={contactFieldLine} alt="Field Separator" className="contact-field-line" />

                        <input type="email" name="email" value={formData.email} placeholder="your@email.com" onChange={(e) => handleChange("email", e.target.value)} required />
                        <img src={contactFieldLine} alt="Field Separator" className="contact-field-line" />

                        <p></p>
                        <label>what kind of project do you have in mind?</label>
                        <div className="custom-dropdown" ref={dropdownRef}>
                            <div className="dropdown-header" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                {formData.projectType}
                                <img src={contactFieldLineDropdownArrow} alt="Dropdown Arrow" className="dropdown-arrow" />
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

                        <img src={contactFieldLine} alt="Field Separator" className="contact-field-line" />
                        <p></p>
                        {showTrainingOptions ? (
                            <div className="calendly-widget">
                                <iframe src="https://calendly.com/dariondanjou/training-session" width="100%" height="240px" frameBorder="0"></iframe>
                            </div>
                        ) : (
                            <>
                                <input type="text" name="projectSubject" value={formData.projectSubject} placeholder="working title for your project" onChange={(e) => handleChange("projectSubject", e.target.value)} required />
                                <img src={contactFieldLine} alt="Field Separator" className="contact-field-line" />

                                <textarea name="projectDescription" className="project-description" value={formData.projectDescription} placeholder="tell us more about your project" onChange={(e) => handleChange("projectDescription", e.target.value)} required />
                                <img src={contactFieldLine} alt="Field Separator" className="contact-field-line" />

                            </>
                        )}

                        <p></p>
                        <p></p>
                        <button type="submit" className="submit-button">
                            submit!
                            <img src={contactFieldLineArrow} alt="Submit Arrow" />
                        </button>
                    </form>

                    {submitted && <p className="thank-you-message">thank you! if you need to add detail, feel free to submit another form.</p>}
                </div>
            </div>
        </>
    );
}

export default Contact;
