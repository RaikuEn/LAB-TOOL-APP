import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [tools, setTools] = useState([]);
  const [borrowerName, setBorrowerName] = useState(""); // Track the name being typed
  const [newToolName, setNewToolName] = useState("");

  const addTool = () => {
    if (!newToolName) return alert("Enter a tool name!");
    axios.post('http://localhost:3000/add-tool', { name: newToolName, category: "Lab Equipment" })
      .then(() => {
        setNewToolName(""); // Clear input
        fetchTools(); // Refresh list
      });
  };

  // 1. Load tools from backend
  const fetchTools = () => {
    axios.get('http://localhost:3000/tools')
      .then(res => setTools(res.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchTools();
  }, []);

  // 2. Function to borrow a tool
  const borrowTool = (id) => {
    if (!borrowerName) return alert("Please enter a name first!");

    axios.patch(`http://localhost:3000/borrow/${id}`, { borrowerName })
      .then(() => {
        setBorrowerName(""); // Clear the input
        fetchTools(); // Refresh the list to show it's now "Lent"
      })
      .catch(err => console.log(err));
  };

  // 3. Function to return a tool
  const returnTool = (id) => {
    axios.patch(`http://localhost:3000/return/${id}`)
      .then(() => {
        console.log("Success! Tool returned.");
        fetchTools(); // Refresh the UI
      })
      .catch(err => {
        console.error("Frontend Error:", err.response.data);
        alert("Failed to return tool: " + err.response.data);
      });
  };
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <h1>🛠️ Lab Tool Inventory</h1>
      
      <input 
        type="text" 
        placeholder="Enter Student Name..." 
        value={borrowerName}
        onChange={(e) => setBorrowerName(e.target.value)}
        style={{ padding: '10px', marginBottom: '20px', width: '250px' }}
      />

      <div style={{ display: 'grid', gap: '15px' }}>
        {tools.map(tool => (
          <div key={tool._id} style={{ 
            border: '1px solid #ddd', 
            padding: '15px', 
            borderRadius: '10px',
            backgroundColor: tool.isAvailable ? '#f9f9f9' : '#fff0f0' 
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{tool.name}</h3>
            <p><strong>Category:</strong> {tool.category}</p>
            
            {tool.isAvailable ? (
              <div>
                <span style={{ color: 'green' }}>● Available</span>
                <button 
                  onClick={() => borrowTool(tool._id)}
                  style={{ marginLeft: '15px', cursor: 'pointer' }}
                >
                  Borrow Tool
                </button>
              </div>
            ) : (
              <div>
                <span style={{ color: 'red' }}>● Lent to: {tool.borrowerName}</span>
                <button 
                  onClick={() => returnTool(tool._id)}
                  style={{ marginLeft: '15px', cursor: 'pointer' }}
                >
                  Return to Lab
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
