const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Define Image Schema
const ImageSchema = new mongoose.Schema({
    url: String,
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    notes: { type: String, default: "" },
    category: { type: String, enum: ["Still", "Moving", "Interactive"], default: "Still" }
});

const Image = mongoose.model("Image", ImageSchema);

// ✅ Define Subscriber Schema for Email List
const SubscriberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    phone: { type: String, default: "" },
    socialMedia: { type: Object, default: {} },
    subscribed: { type: Boolean, default: true },
    passwordHash: { type: String, default: "" },
    signupDate: { type: Date, default: Date.now },
    lastInteraction: { type: Date, default: null }
});

const Subscriber = mongoose.model("Subscriber", SubscriberSchema);

// ✅ Configure S3 Client
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: process.env.AWS_REGION
});

// ✅ Root Route
app.get("/", (req, res) => {
    res.send("Backend is running!");
});

// ✅ Upload Image to S3 and Save Metadata
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
        key: (req, file, cb) => cb(null, `uploads/${Date.now().toString()}-${file.originalname}`)
    })
});

app.post("/api/upload", upload.single("image"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    try {
        const newImage = new Image({ url: req.file.location });
        await newImage.save();
        res.json({ message: "File uploaded successfully", fileUrl: req.file.location, imageId: newImage._id });
    } catch (error) {
        res.status(500).json({ error: "Error saving image data" });
    }
});

// ✅ Fetch All Images
app.get("/api/images", async (req, res) => {
    try {
        const images = await Image.find();
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch images" });
    }
});

// ✅ Update Image Metadata
app.put("/api/images/:id", async (req, res) => {
    try {
        const updatedImage = await Image.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedImage);
    } catch (error) {
        res.status(500).json({ error: "Failed to update image" });
    }
});

// ✅ Sync S3 with MongoDB
app.get("/api/sync-s3", async (req, res) => {
    try {
        const command = new ListObjectsV2Command({ Bucket: process.env.AWS_S3_BUCKET_NAME });
        const { Contents } = await s3.send(command);
        if (!Contents) return res.json({ message: "No files found in S3." });

        const s3Urls = Contents.map(file => ({
            url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`
        }));

        const existingImages = await Image.find({}, "url");
        const existingUrls = existingImages.map(img => img.url);
        const newImages = s3Urls.filter(img => !existingUrls.includes(img.url)).map(img => ({ url: img.url }));

        if (newImages.length > 0) await Image.insertMany(newImages);

        res.json({ message: `Synced ${newImages.length} new images.`, newImages });
    } catch (error) {
        res.status(500).json({ error: "Failed to sync images." });
    }
});

// ✅ Subscribe API (Email Signup)
app.post("/api/subscribe", async (req, res) => {
    const { email } = req.body;
    if (!email || !/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: "Invalid email format" });

    try {
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) return res.status(409).json({ error: "Email already subscribed" });

        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();
        res.json({ message: "Subscribed successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ Admin: Fetch All Subscribers
app.get("/api/subscribers", async (req, res) => {
    try {
        const subscribers = await Subscriber.find();
        res.json(subscribers);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch subscribers" });
    }
});

// ✅ Admin: Edit Subscriber
app.put("/api/subscribers/:id", async (req, res) => {
    try {
        const updatedSubscriber = await Subscriber.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedSubscriber);
    } catch (error) {
        res.status(500).json({ error: "Failed to update subscriber" });
    }
});

// ✅ Admin: Delete Subscriber
app.delete("/api/subscribers/:id", async (req, res) => {
    try {
        await Subscriber.findByIdAndDelete(req.params.id);
        res.json({ message: "Subscriber deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete subscriber" });
    }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
