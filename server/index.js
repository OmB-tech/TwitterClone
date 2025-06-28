const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
}));
app.use(express.json());

// MongoDB URI
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db("twiller");
    const postCollection = db.collection("posts");
    const userCollection = db.collection("users");

    // Register user
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

      console.log("📥 Register request:", user);
      const result = await userCollection.insertOne(user);
      console.log("✅ User inserted:", result.insertedId);
      res.send(result);
    });


    // Get logged-in user
    app.get("/loggedinuser", async (req, res) => {
      const email = req.query.email;
      const user = await userCollection.find({ email }).toArray();
      res.send(user);
    });

    app.get('/users', async (req, res) => {
      const { username, email } = req.query;

      try {
        let user;
        if (username) {
          user = await userCollection.findOne({ username });
        } else if (email) {
          user = await userCollection.findOne({ email });
        }

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
          following: user.following || [],
        };

        res.json([publicProfile]);
      } catch (error) {
        console.error("🔥 Error in /users route:", error);
        res.status(500).json({ error: 'Server error' });
      }
    });

    // Follow / Unfollow logic
    app.patch('/follow', async (req, res) => {
      const { followerEmail, followeeEmail } = req.body;

      if (followerEmail === followeeEmail) {
        return res.status(400).json({ error: "Cannot follow yourself" });
      }

      try {
        const follower = await userCollection.findOne({ email: followerEmail });
        const followee = await userCollection.findOne({ email: followeeEmail });

        if (!follower || !followee) {
          return res.status(404).json({ error: "User not found" });
        }

        const isFollowing = follower.following?.includes(followeeEmail);

        if (isFollowing) {
          await userCollection.updateOne({ email: followerEmail }, { $pull: { following: followeeEmail } });
          await userCollection.updateOne({ email: followeeEmail }, { $pull: { followers: followerEmail } });
        } else {
          await userCollection.updateOne({ email: followerEmail }, { $addToSet: { following: followeeEmail } });
          await userCollection.updateOne({ email: followeeEmail }, { $addToSet: { followers: followerEmail } });
        }

        const updatedFollowee = await userCollection.findOne({ email: followeeEmail });

        res.json({
          success: true,
          isFollowing: !isFollowing,
          followerCount: updatedFollowee.followers.length,
        });
      } catch (error) {
        console.error("Error in /follow:", error);
        res.status(500).json({ error: "Server error" });
      }
    });

    // Create post with time + follower restrictions
    app.post("/createpost", async (req, res) => {
      try {
        const { email, content } = req.body;

        const user = await userCollection.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const followerCount = user.followers?.length || 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayPosts = await postCollection.countDocuments({
          email,
          createdAt: { $gte: today },
        });

        if (followerCount === 0) {
          const now = new Date();
          const hours = now.getHours();
          const minutes = now.getMinutes();

          if (!(hours === 10 && minutes >= 0 && minutes <= 30)) {
            return res.status(403).json({
              message: "You can only post between 10:00 AM to 10:30 AM IST when you have no followers",
            });
          }

          if (todayPosts >= 1) {
            return res.status(403).json({
              message: "You can only post once per day when you have no followers",
            });
          }
        } else {
          if (todayPosts >= followerCount) {
            return res.status(403).json({
              message: `Post limit reached. You can post only ${followerCount} time(s) per day.`,
            });
          }
        }

        const newPost = { ...req.body, createdAt: new Date() };
        const result = await postCollection.insertOne(newPost);
        res.status(201).json(result);
      } catch (error) {
        console.error("Error in /createpost:", error);
        res.status(500).json({ error: error.message });
      }
    });

    // Create post (without restriction)
    app.post("/post", async (req, res) => {
      const post = req.body;
      const result = await postCollection.insertOne({ ...post, createdAt: new Date() });
      res.send(result);
    });

    // Get all posts
    app.get("/post", async (req, res) => {
      const posts = (await postCollection.find().toArray()).reverse();
      res.send(posts);
    });

    // Get posts by email
    app.get("/userpost", async (req, res) => {
      const email = req.query.email;
      const posts = (await postCollection.find({ email }).toArray()).reverse();
      res.send(posts);
    });

    // Get all users
    app.get("/user", async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    // Update user profile
    app.patch("/userupdate/:email", async (req, res) => {
      const filter = { email: req.params.email };
      const updateDoc = { $set: req.body };
      const options = { upsert: true };

      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
  } catch (error) {
    console.error("MongoDB error:", error);
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  res.send("✅ Twiller backend is running");
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Twiller backend is running at http://localhost:${port}`);
});
