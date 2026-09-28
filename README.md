# Real-Time Chat App - Backend

This is the backend for my real-time chat application.

It handles the chat messages, stores them in MongoDB, and uses Socket.IO to send messages instantly.

## Features

* Real-time messaging
* Messages saved in MongoDB
* Previous messages can be loaded
* Chat rooms
* Online and offline status
* Last seen
* Message editing within 5 minutes
* Basic error handling
* Automatic Socket.IO reconnection

## Technologies Used

* Node.js
* Express.js
* Socket.IO
* MongoDB
* Mongoose
* CORS
* dotenv

## How It Works

When a user joins the chat, the server adds them to a chat room.

When a message is sent, the server saves it in MongoDB and sends it to the users in that room using Socket.IO.

The server also keeps track of when users join or leave the chat.

## How to Run Locally

Clone the project:

git clone https

Go to the project folder:

cd ChatBackend

Install the required packages:

npm install

Create a `.env` file in the backend folder:

MONGO_URI=your_mongodb_connection_string
PORT=5000

Start the server:

npm run dev

The backend will run at:

http://localhost:5000

## Environment Variables

`MONGO_URI` - MongoDB connection string

`PORT` - Port used by the server

Do not upload the `.env` file or your MongoDB connection string to GitHub.

## Project Structure

ChatBackend/

* config/

  * db.js
* models/

  * Message.js
* routes/

  * messageRoutes.js
* server.js
* package.json
* .env

## Note

This backend is made for the real-time chat assignment and uses Socket.IO for instant communication.
