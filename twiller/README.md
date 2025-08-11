Twiller - A Modern Social Media Platform
Twiller is a feature-rich social media web application built with the MERN stack (MongoDB, Express, React, Node.js) and integrated with Firebase for robust authentication and user management. It's designed to provide a dynamic and interactive user experience, incorporating several advanced features beyond a typical clone.

✨ Features
👤 User Authentication: Secure user registration and login using email/password and Google OAuth, powered by Firebase Authentication.

📝 Dynamic Posting Rules: A "Public Space" concept where a user's ability to post is tied to their social engagement:

0 Following: Can post once a day, only between 10:00 AM and 10:30 AM IST.

1-10 Following: Can post up to twice a day.

10+ Following: Can post an unlimited number of times.

▶️ Custom Video Player: An interactive, gesture-based video player for all video content:

Single Tap (Center): Play/Pause.

Double Tap (Center): Toggle fullscreen.

Double Tap (Left/Right): Seek 10 seconds backward/forward.

Triple Tap (Center): Automatically finds and scrolls to the next video in the feed.

Triple Tap (Left): Toggles the comment section.

Triple Tap (Right): Opens a confirmation dialog to close the website.

🔐 Secure Password Reset: A "Forgot Password" flow that generates a random, secure password (no special characters or numbers) and emails it to the user. Includes a rate limit of one request per 24 hours.

🌍 Multi-Language Support: The application supports 6 languages (English, Spanish, Hindi, French, Portuguese, Chinese). Switching languages requires OTP verification for security:

French: Requires a one-time password (OTP) sent to the user's registered email.

Other Languages: Requires OTP verification via the user's registered and verified phone number.

👥 Social Features: Users can follow/unfollow others, view profiles, and see posts from the people they follow in their main feed.

💬 Interactive Posts: Users can post text, images, and videos, and reply to posts in a comment section.

🛠️ Tech Stack
Frontend: React, React Router, Material-UI, i18next

Backend: Node.js, Express.js

Database: MongoDB with Mongoose

Authentication: Firebase Authentication (Email/Password, Google, Phone)

Media Uploads: Cloudinary API

Email Service: Nodemailer

🚀 Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

Prerequisites
Node.js and npm installed

A MongoDB Atlas account or a local MongoDB instance

A Firebase project

A Cloudinary account

Backend Setup
Navigate to the server directory:

cd server

Install the required npm packages:

npm install

Create a .env file in the server directory and add the following environment variables:

PORT=5000
MONGO_URI='your_mongodb_connection_string'
EMAIL_USER='your_gmail_address'
EMAIL_PASS='your_gmail_app_password'

Start the backend server:

npm start

Frontend Setup
Navigate to the twiller directory:

cd twiller

Install the required npm packages:

npm install

Create a .env file in the twiller directory and add your Firebase project configuration:

REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

Start the frontend development server:

npm start

The application should now be running on http://localhost:3000.