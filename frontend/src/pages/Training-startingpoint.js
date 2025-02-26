import React, { useState, useRef, useEffect } from "react";
import NavBar from "../components/NavBar";
import axios from "axios";
import "../App.css";

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
const imgTrainingMidjourneyQuickstartOneOnOne = `${BASE_IMAGE_URL}/image%20(22).png`;
const imgTrainingMidjourneyQuickstartGroup = `${BASE_IMAGE_URL}/image%20(29).png`;
const imgTrainingAIFilmmakingQuickstartOneOnOne = `${BASE_IMAGE_URL}/image%20(96).png`;
const imgTrainingAIFilmmakingQuickstartGroup = `${BASE_IMAGE_URL}/image%20(18).png`;
const imgTrainingCustomConsultation = `${BASE_IMAGE_URL}/image%20(15).png`;
const imgTraining10MinuteFreeConsultationOneOnOne = `${BASE_IMAGE_URL}/image%20(10).png`;
const imgTraining1HourFreeConsultationGroup = `${BASE_IMAGE_URL}/image%20(19).png`;

function Training() {
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

    const trainingData = [
        {
          title: "midjourney quickstart",
          type: "(1-on-1)",
          description: "From total beginner to making stunning images in Midjourney, in one hour. Learn the latest professional tips. Via Zoom.",
          price: "USD $250 /hr",
          img: `${BASE_IMAGE_URL}/image%20(22).png`,
          link: "/contact"
        },
        {
          title: "ai filmmaking quickstart",
          type: "(1-on-1)",
          description: "Learn end-to-end professional AI filmmaking workflow, in one hour. Assumes basic Midjourney knowledge. Via Zoom.",
          price: "USD $250 /hr",
          img: `${BASE_IMAGE_URL}/image%20(96).png`,
          link: "/contact"
        },
        {
          title: "custom consultation",
          type: "(1-on-1)",
          description: "Get targeted help on a specific skill or for a specific project. Session customized to your need. Via Zoom.",
          price: "USD $250 /hr",
          img: `${BASE_IMAGE_URL}/image%20(15).png`,
          link: "/contact"
        }
      ];


    return (
        <>
            <div className="contact-container">
                <div className="contact-left">
                    <div className="contact-title-wrapper">
                        <div className="training-title">
                            <img src={titleTraining} alt="Training" className="title-contact-image" />
                            <p className="contact-intro">
                                darion d’anjou provides visual development for and production of narrative films, commercials, music videos, games, digital experiences, and apps, as well as creative and technical training and consultation
                            </p>
                            <p>
                                choose a training that suits your goals or let's crafta custom training for you!
                            </p>
                        </div>
                        <div className="training-info">
                            <p></p>
                            <p></p>
                            <p>
                                not sure where to start?
                            </p>
                            <button type="submit" className="submit-button">
                                book 10 minutes free consultation<br></br>
                                <img src={contactFieldLineArrow} alt="Submit Arrow" />
                                <p></p>
                                book 1 hour free gruop demo<br></br>
                                <img src={contactFieldLineArrow} alt="Submit Arrow" />
                            </button>
                        </div>                     
                    </div>
                    <div className="contact-footer">
                        <p className="contact-footer">
                            darion d’anjou is an ai powered creative studio that leverages the latest in technology to deliver best of class creative and technology solutions
                        </p>
                    </div>

                </div>

                <div className="contact-right">
                    <div>
                        <div className="training-items-list">
                            <div className="training-item">
                                <div>
                                    <img src={imgTrainingMidjourneyQuickstartOneOnOne} alt="Training Promo" className="promo-image" />
                                </div>
                                <div>
                                    <div><label>midjourney quickstart</label><label>(1-on-1)</label></div>
                                    <div>
                                        <p>
                                            from total beginner to making stunning images in midjourney, in one hour. learn the latest professional tips. via zoom
                                        </p>
                                    </div>
                                </div>                            
                            </div>
                            <div>
                                <p></p>
                                <p></p>
                                <div><label>USD $250 /hr ^</label></div>
                                <button type="submit" className="submit-button">
                                    book this one-on-one training!<br></br>
                                    <img src={contactFieldLineArrow} alt="Submit Arrow" />
                                </button>
                            </div>
                            <div className="training-item">
                                <div>
                                    <img src={imgTrainingAIFilmmakingQuickstartOneOnOne} alt="Training Promo" className="promo-image" />
                                </div>
                                <div>
                                    <div><label>ai filmmaking quickstart</label><label>(1-on-1)</label></div>
                                    <div>
                                        <p>
                                            from total beginner to making stunning images in midjourney, in one hour. learn the latest professional tips. via zoom
                                        </p>
                                    </div>
                                </div>                            
                            </div>
                            <div>
                                <p></p>
                                <p></p>
                                <div><label>USD $250 /hr ^</label></div>
                                <button type="submit" className="submit-button">
                                    book this one-on-one training!<br></br>
                                    <img src={contactFieldLineArrow} alt="Submit Arrow" />
                                </button>
                            </div>
                            <div className="training-item">
                                <div>
                                    <img src={imgTraining10MinuteFreeConsultationOneOnOne} alt="Training Promo" className="promo-image" />
                                </div>
                                <div>
                                    <div><label>custom consultation</label><label>(1-on-1)</label></div>
                                    <div>
                                        <p>
                                            from total beginner to making stunning images in midjourney, in one hour. learn the latest professional tips. via zoom
                                        </p>
                                    </div>
                                </div>                            
                            </div>
                            <div>
                                <p></p>
                                <p></p>
                                <div><label>USD $250 /hr ^</label></div>
                                <button type="submit" className="submit-button">
                                    book this one-on-one training!<br></br>
                                    <img src={contactFieldLineArrow} alt="Submit Arrow" />
                                </button>
                            </div>                                                        
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Training;
