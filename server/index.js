const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config()
const app = express();
const port = 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
}));
app.use(express.json());

// MongoDB URI (in production use .env)
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

    // Routes

    app.post("/register", async (req, res) => {
      const user = req.body;
      console.log("📥 Register request:", user);
      const result = await userCollection.insertOne(user);
      console.log("✅ User inserted:", result.insertedId);
      res.send(result);
    });

    app.get("/loggedinuser", async (req, res) => {
      const email = req.query.email;
      const user = await userCollection.find({ email }).toArray();
      res.send(user);
    });

    app.post("/post", async (req, res) => {
      const post = req.body;
      console.log("📥 Post data:", post);
      const result = await postCollection.insertOne(post);
      console.log("✅ Post inserted:", result.insertedId);
      res.send(result);
    });

    app.get("/post", async (req, res) => {
      const posts = (await postCollection.find().toArray()).reverse();
      res.send(posts);
    });

    app.get("/userpost", async (req, res) => {
      const email = req.query.email;
      const posts = (
        await postCollection.find({ email }).toArray()
      ).reverse();
      res.send(posts);
    });

    app.get("/user", async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    app.patch("/userupdate/:email", async (req, res) => {
      const filter = { email: req.params.email };
      const profile = req.body;
      const options = { upsert: true };
      const updateDoc = { $set: profile };

      const result = await userCollection.updateOne(filter, updateDoc, options);
      console.log("🔄 User updated:", result.modifiedCount);
      res.send(result);
    });
  } catch (error) {
    console.error("❌ MongoDB error:", error);
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("✅ Twiller backend is running");
});

// Server
app.listen(port, () => {
  console.log(`🚀 Twiller backend is running at http://localhost:${port}`);
});
