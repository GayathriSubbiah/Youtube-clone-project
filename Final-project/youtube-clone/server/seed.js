const mongoose = require("mongoose");
const Video = require("./models/Video");

mongoose.connect("mongodb://localhost:27017/youtubeclone", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedVideos = [
  {
    title: "Learn React in 10 Minutes",
    description: "Crash course to get started with React",
    videoUrl: "/videos/react.mp4", // ✅ make sure this file exists in public/videos/
    category: "Frontend",
  },
  {
    title: "Node.js Tutorial for Beginners",
    description: "Complete Node.js guide",
    videoUrl: "/videos/nodejs.mp4",
    category: "Web Development",
  },
  {
    title: "JavaScript in 100 Seconds",
    description: "JS overview in 100 seconds",
    videoUrl: "/videos/js.mp4",
    category: "JavaScript",
  },
];

async function seed() {
  try {
    await Video.deleteMany({});
    await Video.insertMany(seedVideos);
    console.log("✅ Videos seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
}

seed();
