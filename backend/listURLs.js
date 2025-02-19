const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Define Image Schema
const Image = mongoose.model("Image", new mongoose.Schema({ url: String }));

async function listImageUrls() {
    try {
        const images = await Image.find({}, "url"); // Fetch only the `url` field
        console.log("\n🔗 Image URLs:\n");
        images.forEach(image => console.log(image.url));

        console.log(`\n✅ Found ${images.length} image URLs.`);
        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Error retrieving image URLs:", error);
        mongoose.connection.close();
    }
}

// Run the function
listImageUrls();
