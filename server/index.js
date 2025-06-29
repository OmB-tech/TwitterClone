const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

const app = express();
const port = 5000;

// Firebase Admin init
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true
}));
app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db("twiller");
    const userCollection = db.collection("users");
    const postCollection = db.collection("posts");

    app.post("/register", async (req, res) => {
      const user = {
        name: req.body.name || "",
        username: req.body.username || "",
        email: req.body.email || "",
        bio: req.body.bio || "",
        location: req.body.location || "",
        website: req.body.website || "",
        profileImage: req.body.profileImage || "",
        coverImage: req.body.coverImage || "",
        followers: [],
        following: []
      };
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/loggedinuser", async (req, res) => {
      const email = req.query.email;
      const user = await userCollection.find({ email }).toArray();
      res.send(user);
    });

    app.get("/users", async (req, res) => {
      const { username, email } = req.query;
      try {
        let user;
        if (username) user = await userCollection.findOne({ username });
        else if (email) user = await userCollection.findOne({ email });

        if (!user) return res.status(404).json([]);

        const publicProfile = {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          bio: user.bio,
          location: user.location,
          website: user.website,
          profileImage: user.profileImage,
          coverImage: user.coverImage,
          followers: user.followers || [],
          following: user.following || []
        };
        res.json([publicProfile]);
      } catch (error) {
        console.error("Error in /users route:", error);
        res.status(500).json({ error: "Server error" });
      }
    });

    //FOLLOW / UNFOLLOW
    app.patch("/follow", async (req, res) => {
      const { followerEmail, followeeEmail } = req.body;
      if (followerEmail === followeeEmail)
        return res.status(400).json({ error: "Cannot follow yourself" });

      try {
        const follower = await userCollection.findOne({ email: followerEmail });
        const followee = await userCollection.findOne({ email: followeeEmail });
        if (!follower || !followee)
          return res.status(404).json({ error: "User not found" });

        const isFollowing = follower.following?.includes(followeeEmail);
        if (isFollowing) {
          await userCollection.updateOne({ email: followerEmail }, { $pull: { following: followeeEmail } });
          await userCollection.updateOne({ email: followeeEmail }, { $pull: { followers: followerEmail } });
        } else {
          await userCollection.updateOne({ email: followerEmail }, { $addToSet: { following: followeeEmail } });
          await userCollection.updateOne({ email: followeeEmail }, { $addToSet: { followers: followerEmail } });
        }

        const updatedFollowee = await userCollection.findOne({ email: followeeEmail });
        res.json({ success: true, isFollowing: !isFollowing, followerCount: updatedFollowee.followers.length });
      } catch (error) {
        console.error("Error in /follow:", error);
        res.status(500).json({ error: "Server error" });
      }
    });

    //CREATE POST (with daily limit)
    app.post("/createpost", async (req, res) => {
      try {
        const { email, name, username, profilephoto, post, photo, timestamp } = req.body;
        if (!email || !post)
          return res.status(400).json({ message: "Email and post content required." });

        const user = await userCollection.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const followingCount = user.following?.length || 0;

        const now = new Date();
        const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const todayStartIST = new Date(istNow);
        todayStartIST.setHours(0, 0, 0, 0);

        const todayPosts = await postCollection.countDocuments({ email, createdAt: { $gte: todayStartIST } });

        if (followingCount  === 0) {
          const hours = istNow.getHours();
          const minutes = istNow.getMinutes();
          if (!(hours === 10 && minutes >= 0 && minutes <= 30))
            return res.status(403).json({ message: "Since you don't follow anyone, you can post only between 10:00–10:30 AM IST." });
          if (todayPosts >= 1)
            return res.status(403).json({ message: "You can post only once per day when you have no followers." });
        } else if (followingCount  <= 2) {
          if (todayPosts >= 2)
            return res.status(403).json({ message: "You can post only 2 times per day if you follow up to 2 people." });
        } else if (followingCount  <= 10) {
          if (todayPosts >= 1)
            return res.status(403).json({ message: "You can post only once per day if you follow 3–10 people." });
        }

        const newPost = {
          email, name, username, profilephoto, post, photo, timestamp,
          createdAt: new Date()
        };
        const result = await postCollection.insertOne(newPost);
        res.status(201).json({ success: true, postId: result.insertedId });
      } catch (error) {
        console.error("Error in /createpost:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.get("/post", async (req, res) => {
      const posts = (await postCollection.find().toArray()).reverse();
      res.send(posts);
    });

    app.get("/userpost", async (req, res) => {
      const email = req.query.email;
      const posts = (await postCollection.find({ email }).toArray()).reverse();
      res.send(posts);
    });

    app.patch("/userupdate/:email", async (req, res) => {
      const filter = { email: req.params.email };
      const updateDoc = { $set: req.body };
      const options = { upsert: true };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.post("/forgot-password", async (req, res) => {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const user = await userCollection.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found in database" });

        const now = new Date();
        if (user.lastForgotRequest && now.toDateString() === new Date(user.lastForgotRequest).toDateString()) {
          return res.status(429).json({ message: "You can request password reset only once a day" });
        }

        const newPassword = generatePassword(10);
        await admin.auth().updateUser(userRecord.uid, { password: newPassword });
        await userCollection.updateOne({ email }, { $set: { lastForgotRequest: now } });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Your new Twiller password",
          text: `Hey! Your new password is: ${newPassword}`
        });

        res.json({ success: true, message: "New password set and sent to email" });
      } catch (err) {
        console.error("Error in forgot-password:", err);
        res.status(500).json({ message: "Server error" });
      }
    });

    function generatePassword(length = 10) {
      const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let password = "";
      for (let i = 0; i < length; i++) {
        password += letters.charAt(Math.floor(Math.random() * letters.length));
      }
      return password;
    }

  } catch (error) {
    console.error("MongoDB error:", error);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("✅ Twiller backend is running");
});

app.listen(port, () => {
  console.log(`🚀 Twiller backend running at http://localhost:${port}`);
});
