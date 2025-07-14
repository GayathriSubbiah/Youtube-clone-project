# Youtube-clone-project

# YouTube Clone - MERN Stack Application

This is a full-stack YouTube clone built using the MERN stack (MongoDB, Express, React, Node.js). It allows users to upload, watch, edit, and manage videos as well as manage their own channels.

## Features

- User Registration and Login (JWT authentication)
- Upload videos and thumbnails
- View a list of videos on each channel
- Watch individual videos
- Edit and delete your own videos
- Channel profile with name, handle, and avatar
- Customize channel details (description, name, etc.)

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- Multer (for file uploads)
- JSON Web Token (JWT)
- bcrypt (for password hashing)
- React
- React Router DOM
- CSS modules / custom CSS

## Folder Structure

youtube-clone/
├── client/ # React frontend
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Application pages (Home, Channel, Video, etc.)
│ │ └── App.jsx # Main entry
│ └── public/
├── server/ # Express backend
│ ├── models/ # Mongoose schemas
│ ├── routes/ # API route handlers
│ ├── middleware/ # Auth middleware
│ ├── uploads/ # Uploaded files (videos, thumbnails)
│ └── index.js # Server entry point
├── README.md
└── .env

bash
Copy
Edit

## Getting Started

1. Make sure you have the following installed:

- Node.js (v18+ recommended)
- MongoDB running locally (or MongoDB Atlas)
- npm or yarn

```bash
git clone https://github.com/GayathriSubbiah/Youtube-clone-project
cd youtube-clone

2. Setup the server
cd server
npm install

Create a .env file:
MONGO_URI=mongodb://localhost:27017/youtube-clone
JWT_SECRET=your_jwt_secret
PORT=3000

Start the server:
node index.js

Setup the client:
cd ../client
npm install
npm start

API Endpoints
Auth
POST /api/auth/register - Register a new user

POST /api/auth/login - Log in with credentials

User
GET /api/users/me - Get current logged-in user

Video
GET /api/videos/:id - Get a video by ID

PUT /api/videos/:id - Update video details

DELETE /api/videos/:id - Delete a video

POST /api/videos/upload - Upload a new video

Channel
GET /api/channels/:channelId - Get channel and its videos

PUT /api/channels/:channelId - Update channel info (name, description, etc.)

The outputs are shared as screenshots in the Screenshot folder.

```