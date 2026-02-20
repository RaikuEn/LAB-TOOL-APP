const express = require('express');
const mongoose = require('mongoose');
const Tool = require('./models/tool'); // Import your new Model
const Log = require('./models/Log');
const cors = require('cors');

const app = express();
app.use(express.json()); // Essential for reading data!

app.use(cors()); // This allows the frontend to access the API

// ... (Your connection code from before stays here) ...
const dbURI = "mongodb+srv://Raikuen:RT03RW15@learn0.5zhk8.mongodb.net/lab_db?retryWrites=true&w=majority&appName=Learn0 ";
mongoose.connect(dbURI).then(() => console.log('✅ Connected!'));

// NEW: Route to add a tool
app.post('/add-tool', async (req, res) => {
  try {
    const newTool = new Tool(req.body);
    await newTool.save();
    res.status(201).send("Tool saved successfully!");
  } catch (err) {
    res.status(400).send("Error saving tool: " + err.message);
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
app.patch('/borrow/:id', async (req, res) => {
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
app.patch('/return/:id', async (req, res) => {
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


// Route to see every single lending action ever made
app.get('/history', async (req, res) => {
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