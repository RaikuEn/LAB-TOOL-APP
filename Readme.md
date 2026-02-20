markdown
# 🛠️ Lab-Lend: Full-Stack Tool Management System

A robust, full-stack web application designed for university or research labs to track equipment lending, manage inventory, and maintain a digital paper trail of tool usage.

## 🚀 Live Demo
[Link to your Vercel/Render Deployment]

## ✨ Key Features
- **Real-time Inventory:** View all lab tools and their current availability status.
- **Lending Logic:** One-click "Borrow" and "Return" functionality with automated status updates.
- **Activity Logging:** Every transaction is recorded in a history log to track usage patterns.
- **Smart Search:** Filter tools by name or category using case-insensitive regex search.
- **Data Integrity:** Prevents server crashes using robust backend validation and error handling.

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Local/Atlas)
- **State Management:** React Hooks (`useState`, `useEffect`)

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com
Use code with caution.

Setup Backend:
bash
cd lab-tool-app
npm install
# Create a .env file and add your MONGODB_URL
node app.js
Use code with caution.

Setup Frontend:
bash
cd client
npm install
npm run dev
Use code with caution.

🧠 What I Learned
CRUD Operations: Implementing Create, Read, and Update actions across a full-stack environment.
RESTful API Design: Building clean, independent endpoints for borrowing and returning logic.
Database Schemas: Designing structured models for Tools and Activity Logs using Mongoose.
Problem Solving: Debugging 500 errors by shifting logic from the client to the server for better reliability.
📝 Future Roadmap
Add User Authentication (Login for Lab Admins).
Implement an "Overdue" notification system based on dueDate.
Add image upload for each tool using Cloudinary.
