# Real-Time Chat App - Backend

This is the backend of my real-time chat application.

It handles messages, saves them in MongoDB, and uses Socket.IO to send messages instantly between users.

## Features

* Real-time messaging
* Save messages in MongoDB
* Get previous messages
* Chat rooms
* Online/offline status
* Last seen
* Edit messages within 5 minutes
* Basic error handling

## Technologies Used

* Node.js
* Express.js
* Socket.IO
* MongoDB
* Mongoose
* CORS
* dotenv

## Live Backend

https://chatbackend-7vdm.onrender.com

## GitHub

https://github.com/swetasm108-bit/ChatBackend

## API

### Get Messages

GET

/api/messages/:roomId

Example:

/api/messages/sweta-rahul

### Send Message

POST

/api/messages

Example:

{
"roomId": "sweta-rahul",
"sender": "Sweta",
"message": "Hello!"
}

## Socket.IO Events

### Client to Server

* join_room
* send_message
* edit_message
* leave_room

### Server to Client

* receive_message
* message_edited
* user_status
* message_error
* edit_error

## How to Run

Clone the project:

git clone https://github.com/swetasm108-bit/ChatBackend.git

Go to the project folder:

cd ChatBackend

Install the packages:

npm install

Create a `.env` file:

MONGO_URI=your_mongodb_connection_string
PORT=5000

Start the server:

npm run dev

The backend will run at:

http://localhost:5000

## Environment Variables

* `MONGO_URI` - MongoDB connection string
* `PORT` - Server port

Do not upload the `.env` file to GitHub.
