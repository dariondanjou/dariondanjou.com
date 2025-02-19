const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Define Image Schema
const Image = mongoose.model("Image", new mongoose.Schema({ url: String }));

async function updateImageUrls() {
    try {
        const correctBaseURL = "https://s3.us-east-2.amazonaws.com/ai.dariondanjou.com";

        const images = await Image.find();
        let updateCount = 0;

        for (let image of images) {
            // Extract only the filename
            const filename = image.url.split("/").pop();
            const updatedUrl = `${correctBaseURL}/${filename}`;

            if (image.url !== updatedUrl) {
                await Image.updateOne({ _id: image._id }, { url: updatedUrl });
                updateCount++;
            }
        }

        console.log(`✅ Updated ${updateCount} image URLs.`);
        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Error updating image URLs:", error);
        mongoose.connection.close();
    }
}

// Run the function
updateImageUrls();
