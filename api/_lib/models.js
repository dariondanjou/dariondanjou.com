const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  url: String,
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  notes: { type: String, default: "" },
  category: {
    type: String,
    enum: ["Still", "Moving", "Interactive"],
    default: "Still",
  },
});

const SubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  phone: { type: String, default: "" },
  socialMedia: { type: Object, default: {} },
  subscribed: { type: Boolean, default: true },
  passwordHash: { type: String, default: "" },
  signupDate: { type: Date, default: Date.now },
  lastInteraction: { type: Date, default: null },
});

const Image = mongoose.models.Image || mongoose.model("Image", ImageSchema);
const Subscriber =
  mongoose.models.Subscriber || mongoose.model("Subscriber", SubscriberSchema);

module.exports = { Image, Subscriber };
