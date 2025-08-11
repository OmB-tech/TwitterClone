const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

const app = express();
const port = process.env.PORT || 5000;

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

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://twitterclone-t.netlify.app"
  ],
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
    const otpCollection = db.collection("otps");

    // =================================================================
    // NEW ENDPOINT FOR SECURITY
    // This checks if a phone number is already in use before verification.
    // =================================================================
    app.post("/check-phone", async (req, res) => {
        const { phoneNumber, currentUserEmail } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ message: "Phone number is required." });
        }
        try {
            // Find if any *other* user already has this phone number
            const existingUser = await userCollection.findOne({ 
                phoneNumber: phoneNumber, 
                email: { $ne: currentUserEmail } // $ne means "not equal"
            });

            if (existingUser) {
                return res.status(409).json({ isTaken: true, message: "This phone number is already in use by another account." });
            }
            res.status(200).json({ isTaken: false });
        } catch (error) {
            res.status(500).json({ message: "Server error while checking phone number." });
        }
    });
    // =================================================================

    // ... (rest of your server code remains the same)

    const generatePassword = () => {
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const allChars = upper + lower;
        let password = "";
        for (let i = 0; i < 10; i++) {
            password += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }
        return password;
    };

    app.post("/register", async (req, res) => {
      const { email, name, username, profileImage, uid } = req.body;
      const filter = { email: email };
      const updateDoc = {
        $set: { name, profileImage },
        $setOnInsert: {
          email: email, firebaseUid: uid, username: username || email.split('@')[0],
          bio: "", location: "", website: "", phoneNumber: "", coverImage: "",
          followers: [], following: [], lastPasswordResetRequest: null,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, { upsert: true });
      res.send(result);
    });

    app.get("/loggedinuser", async (req, res) => {
      const { email, uid } = req.query;
      try {
        let user;
        if (uid) user = await userCollection.findOne({ firebaseUid: uid });
        else if (email) user = await userCollection.findOne({ email });
        res.send(user ? [user] : []);
      } catch (error) { res.status(500).json({ error: "Server error" }); }
    });
    
    app.get("/users", async (req, res) => {
        const { username, email } = req.query;
        let query = {};
        if (username) {
            query.username = username;
        } else if (email) {
            query.email = email;
        } else {
            return res.status(400).send({ message: "Username or email query parameter is required." });
        }
        const user = await userCollection.findOne(query);
        res.send(user ? [user] : []);
    });

    app.post("/posts/:id/comment", async (req, res) => {
        const { id } = req.params;
        const { comment } = req.body;
        if (!comment || !comment.text || !comment.username) {
            return res.status(400).json({ message: "Comment content is missing." });
        }
        try {
            const result = await postCollection.updateOne(
                { _id: new ObjectId(id) },
                { $push: { comments: { ...comment, createdAt: new Date() } } }
            );
            if (result.modifiedCount === 0) return res.status(404).json({ message: "Post not found." });
            res.status(201).json({ success: true, message: "Comment added." });
        } catch (error) { res.status(500).json({ message: "Server error." }); }
    });
    
    app.patch("/follow", async (req, res) => {
        const { followerEmail, followeeEmail } = req.body;
        if (followerEmail === followeeEmail) return res.status(400).json({ error: "Cannot follow yourself" });
        try {
            const follower = await userCollection.findOne({ email: followerEmail });
            const followee = await userCollection.findOne({ email: followeeEmail });
            if (!follower || !followee) return res.status(404).json({ error: "User not found" });
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
        } catch (error) { res.status(500).json({ error: "Server error" }); }
    });

    app.post("/createpost", async (req, res) => {
      try {
        const { email } = req.body;
        const user = await userCollection.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        const followingCount = user.following?.length || 0;
        const istNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const todayStartIST = new Date(istNow);
        todayStartIST.setHours(0, 0, 0, 0);
        const todayPosts = await postCollection.countDocuments({ email, createdAt: { $gte: todayStartIST } });
        if (followingCount === 0) {
           const hours = istNow.getHours();
           const minutes = istNow.getMinutes();
           if (!(hours === 10 && minutes >= 0 && minutes <= 30)) return res.status(403).json({ success: false, message: "You can only post between 10:00-10:30 AM IST if you don't follow anyone." });
           if (todayPosts >= 1) return res.status(403).json({ success: false, message: "You can only post once a day if you don't follow anyone." });
        } else if (followingCount >= 1 && followingCount <= 10) {
           if (todayPosts >= 2) return res.status(403).json({ success: false, message: "You can post up to 2 times a day." });
        }
        const newPost = { ...req.body, createdAt: new Date() };
        const result = await postCollection.insertOne(newPost);
        res.status(201).json({ success: true, postId: result.insertedId });
      } catch (error) { res.status(500).json({ success: false, message: "Server error" }); }
    });

    app.get("/post", async (req, res) => res.send((await postCollection.find().toArray()).reverse()));
    app.get("/userpost", async (req, res) => res.send((await postCollection.find({ email: req.query.email }).toArray()).reverse()));
    app.patch("/userupdate/:email", async (req, res) => res.send(await userCollection.updateOne({ email: req.params.email }, { $set: req.body })));

    app.post("/forgot-password", async (req, res) => {
        const { email } = req.body;
        try {
            const user = await userCollection.findOne({ email });
            if (!user) return res.status(404).json({ message: "User not found." });
            const now = new Date();
            if (user.lastPasswordResetRequest && (now.getTime() - new Date(user.lastPasswordResetRequest).getTime() < 24 * 60 * 60 * 1000)) {
                return res.status(429).json({ message: "You can only request a password reset once a day." });
            }
            const newPassword = generatePassword();
            await admin.auth().updateUser(user.firebaseUid, { password: newPassword });
            await transporter.sendMail({ from: process.env.EMAIL_USER, to: email, subject: "Your New Twiller Password", text: `Your new password is: ${newPassword}` });
            await userCollection.updateOne({ email }, { $set: { lastPasswordResetRequest: now } });
            res.status(200).json({ message: "A new password has been sent to your email." });
        } catch (error) {
            console.error("Forgot password error:", error);
            res.status(500).json({ message: "An error occurred." });
        }
    });

    app.post("/send-email-otp", async (req, res) => {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required." });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(new Date().getTime() + 10 * 60 * 1000); // 10 minutes
        try {
            await otpCollection.updateOne({ email, type: 'email' }, { $set: { otp, expires } }, { upsert: true });
            await transporter.sendMail({ from: process.env.EMAIL_USER, to: email, subject: "Your Twiller Language Verification Code", text: `Your verification code is: ${otp}` });
            res.status(200).json({ success: true, message: "OTP sent to your email." });
        } catch (error) { res.status(500).json({ message: "Failed to send OTP." }); }
    });

    app.post("/verify-email-otp", async (req, res) => {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required." });
        try {
            const record = await otpCollection.findOne({ email, type: 'email', otp });
            if (!record) return res.status(400).json({ message: "Invalid OTP." });
            if (new Date() > new Date(record.expires)) return res.status(400).json({ message: "OTP has expired." });
            await otpCollection.deleteOne({ _id: record._id });
            res.status(200).json({ success: true, message: "Email verified successfully." });
        } catch (error) { res.status(500).json({ message: "Failed to verify OTP." }); }
    });

  } catch (error) { console.error("MongoDB error:", error); }
}
run().catch(console.dir);

app.get("/", (req, res) => res.send("✅ Twiller backend is running"));
app.listen(port, () => console.log(`🚀 Twiller backend running at http://localhost:${port}`));
