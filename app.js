const express = require('express');
const mongoose = require('mongoose');
const Tool = require('./models/tool'); // Import your new Model
const Log = require('./models/Log');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// The Security Guard (Middleware)
const verifyToken = (req, res, next) => {
  // Get the token from the "Authorization" header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).send("Access Denied: No Token Provided!");
  }

  try {
    const verified = jwt.verify(token, 'SECRET_KEY'); // Use the same key from your Login route
    req.user = verified; 
    next(); // Pass the request to the next function (the actual route)
  } catch (err) {
    res.status(403).send("Invalid or Expired Token");
  }
};

const cors = require('cors');

const app = express();
app.use(express.json()); // Essential for reading data!

app.use(cors()); // This allows the frontend to access the API

// ... (Your connection code from before stays here) ...
const dbURI = "mongodb://localhost:27017/";
mongoose.connect(dbURI).then(() => console.log('✅ Connected!'));

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).send("User already exists");

    // 2. Hash the password (10 rounds of "salt" for security)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create and save the user
    const newUser = new User({
      username,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).send("Admin account created successfully!");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).send("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send("Invalid password");

  const token = jwt.sign({ id: user._id }, 'SECRET_KEY', { expiresIn: '1h' });
  res.json({ token, username });
});

// NEW: Route to add a tool
app.post('/add-tool', verifyToken, async (req, res) => {
  try {
    const { name, category } = req.body;
    const newTool = new Tool({ name, category });
    await newTool.save();
    
    // Log the addition
    await Log.create({
      toolName: name,
      borrowerName: "Admin",
      action: "Added to Inventory"
    });

    res.status(201).json(newTool);
  } catch (err) {
    res.status(400).send("Error adding tool: " + err.message);
  }
});


// Search tools by name or category
app.get('/search', async (req, res) => {
  const { name, category } = req.query; // This looks at the URL like /search?name=Oscilloscope
  let filter = {};

  if (name) filter.name = { $regex: name, $options: 'i' }; // 'i' makes it case-insensitive
  if (category) filter.category = category;

  const tools = await Tool.find(filter);
  res.json(tools);
});

// NEW: Route to see all tools
app.get('/tools', async (req, res) => {
  const allTools = await Tool.find();
  res.json(allTools);
});

// Route to Borrow a Tool
app.patch('/borrow/:id', verifyToken, async (req, res) => {
  try {
    const toolId = req.params.id;
    const borrower = req.body.borrowerName;

    // Find the tool by its ID and update it
    const updatedTool = await Tool.findByIdAndUpdate(
      toolId, 
      { 
        isAvailable: false, 
        borrowerName: borrower,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Sets due date to 7 days from now
      }, 
      { new: true } // This returns the tool AFTER it was updated
    );

    await Log.create({ toolName: updatedTool.name, borrowerName: borrower, action: 'Borrowed' });

    if (!updatedTool) return res.status(404).send("Tool not found");
    
    res.send(`Success! ${updatedTool.name} is now borrowed by ${borrower}`);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

// Route to Return a Tool
app.patch('/return/:id', verifyToken, async (req, res) => {
  try {
    // 1. Find the tool first to get its name for the log
    const tool = await Tool.findById(req.params.id);
    if (!tool) return res.status(404).send("Tool not found");

    // 2. Update the tool. 
    // Notice we DON'T use req.body here. We just set it to empty values.
    tool.isAvailable = true;
    tool.borrowerName = ""; 
    tool.dueDate = null;
    await tool.save();

    // 3. Create the log entry
    await Log.create({
      toolName: tool.name,
      borrowerName: "Lab Admin", // Or "System"
      action: 'Returned'
    });

    res.send("Returned successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
// Route to Permanently Delete a Tool
app.delete('/delete-tool/:id', verifyToken, async (req, res) => {
  try {
    const deletedTool = await Tool.findByIdAndDelete(req.params.id);
    
    if (!deletedTool) return res.status(404).send("Tool not found");

    // Optional: Log the deletion
    await Log.create({
      toolName: deletedTool.name,
      borrowerName: "Admin",
      action: "Permanently Removed"
    });

    res.send(`Successfully deleted ${deletedTool.name}`);
  } catch (err) {
    res.status(500).send("Error deleting tool: " + err.message);
  }
});


// Route to see every single lending action ever made
app.get('/history', verifyToken, async (req, res) => {
  try {
    // .sort({ date: -1 }) puts the newest logs at the top
    const history = await Log.find().sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).send("Error fetching history: " + err.message);
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));