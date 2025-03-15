# H&M Digital App

## Overview
H&M Digital is a comprehensive fashion platform featuring subscription services, AR try-on, second-hand marketplace, and personalized recommendations.

## Prerequisites
- Node.js (v18 or later)
- npm (v9 or later)
- MongoDB

## Project Structure
```
h-and-m-digital-app/
│
├── client/           # React frontend
├── server/           # Node.js backend
└── README.md
```

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/h-and-m-digital-app.git
cd h-and-m-digital-app
```

### 2. Install Root Dependencies
```bash
npm install
```

### 3. Install Client Dependencies
```bash
cd client
npm install
```

### 4. Install Server Dependencies
```bash
cd ../server
npm install
```

### 5. Environment Setup
Create a `.env` file in the `server` directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
NODE_ENV=development
```

### 6. Running the Application

#### Development Mode
From the root directory:
```bash
npm run dev
```

This will start both the client (React) and server (Node.js) concurrently.

#### Separate Startup
- Start Server: `npm run server` (from server directory)
- Start Client: `npm run client` (from client directory)

## Key Features
- Subscription Service
- Second-hand Marketplace
- AR Try-On Technology
- Personalized Recommendations
- Analytics Dashboard

## Technologies Used
### Frontend
- React
- Material-UI
- React Router
- Recharts
- TensorFlow.js

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT Authentication

### AR Technology
- TensorFlow.js
- Body-Pix
- Pose Detection

## Deployment
Ensure all environment variables are set in your deployment platform.

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
Distributed under the ISC License.

## Contact
Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/h-and-m-digital-app](https://github.com/yourusername/h-and-m-digital-app)
```