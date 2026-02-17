import React from "react";
import "../App.css";

const BASE_IMAGE_URL = process.env.REACT_APP_IMAGE_BASE_URL;

// Image constants
const contactFieldLineArrow = `${BASE_IMAGE_URL}/contact-field-line-arrow.png`;
const titleTraining = `${BASE_IMAGE_URL}/title-training.png`;
const imgTrainingMidjourneyQuickstartOneOnOne = `${BASE_IMAGE_URL}/image%20(22).png`;
const imgTrainingAIFilmmakingQuickstartOneOnOne = `${BASE_IMAGE_URL}/image%20(96).png`;
const imgTrainingCustomConsultation = `${BASE_IMAGE_URL}/image%20(15).png`;

function Training() {
    const trainingData = [
        {
          title: "midjourney quickstart",
          type: "(1-on-1)",
          description: "From total beginner to making stunning images in Midjourney, in one hour. Learn the latest professional tips. Via Zoom.",
          price: "USD $250 /hr",
          img: imgTrainingMidjourneyQuickstartOneOnOne,
          link: `/contact?training=midjourney quickstart (1 hour one-on-one $250)`
        },
        {
          title: "ai filmmaking quickstart",
          type: "(1-on-1)",
          description: "Learn end-to-end professional AI filmmaking workflow, in one hour. Assumes basic Midjourney knowledge. Via Zoom.",
          price: "USD $250 /hr",
          img: imgTrainingAIFilmmakingQuickstartOneOnOne,
          link: `/contact?training=ai filmmaking quickstart (1 hour one-on-one $250)`
        },
        {
          title: "custom consultation",
          type: "(1-on-1)",
          description: "Get targeted help on a specific skill or for a specific project. Session customized to your need. Via Zoom.",
          price: "USD $250 /hr",
          img: imgTrainingCustomConsultation,
          link: `/contact?training=custom consultation (1 hour one-on-one $250)`
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
                                darion d'anjou provides visual development for and production of narrative films, commercials, music videos, games, digital experiences, and apps, as well as creative and technical training and consultation
                            </p>
                            <p></p>
                            <p></p>
                            <p className="contact-intro">
                                choose a training that suits your goals or let's crafta custom training for you!
                            </p>
                            <p className="contact-intro"></p>
                            <p className="contact-intro"></p>
                            <p className="contact-intro">
                                not sure where to start?
                            </p>
                        </div>
                        <div className="training-info">
                            <a href="/contact?training=10 minute free consultation (one-on-one $0)">
                                <button type="submit-training-left" className="submit-button-left">
                                    <p className="submit-button-left-training">
                                        book 10 minutes free consultation<br></br>
                                        <img src={contactFieldLineArrow} alt="Submit Arrow" /><br></br>
                                    </p>
                                </button>
                            </a>
                            <a href="/contact?training=1 hour free group demo ($0)">
                                <button type="submit-training-left" className="submit-button-left">
                                    <p className="submit-button-left-training">
                                        book 1 hour free group demo<br></br>
                                        <img src={contactFieldLineArrow} alt="Submit Arrow" /><br></br>
                                    </p>
                                </button>
                            </a>
                        </div>

                    </div>
                    <div className="contact-footer">
                        <p className="contact-footer">
                            darion d'anjou is an ai powered creative studio that leverages the latest in technology to deliver best of class creative and technology solutions
                        </p>
                    </div>

                </div>

                <div className="contact-right">

                        <div className="training-items-list">
                            {trainingData.map((training, index) => (
                                <div key={index} className="training-item">
                                    <div className="training-information-container">
                                        <div className="training-image">
                                            <img src={training.img} alt={training.title} className="promo-image" />
                                        </div>

                                        <div className="training-info">
                                            <div className="training-header">
                                                <span><label>{training.title}</label> <label>{training.type}</label></span>
                                            </div>
                                            <div>
                                                <p className="training-description">{training.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="training-action-container">
                                        <div className="training-price-book">
                                                <div className="training-price">{training.price}</div>
                                                <div className="training-book">
                                                    <a href={training.link} className="training-book-link-text">
                                                        book this one-on-one training!
                                                    </a>
                                                </div>
                                        </div>
                                        <div className="training-arrow-book">
                                            <a href={training.link} className="training-book-link-arrow">
                                                <img src={contactFieldLineArrow} alt="Arrow" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                </div>
            </div>
        </>
    );
}

export default Training;
