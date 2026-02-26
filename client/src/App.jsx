import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [tools, setTools] = useState([]);
  const [borrowerName, setBorrowerName] = useState(""); // Track the name being typed
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [newTool, setNewTool] = useState({ name: '', category: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchTools();
    }
  }, []);

  const addTool = () => {
    const token = localStorage.getItem('token');
    if (!newTool.name || !newTool.category) return alert("Fill in all fields!");

    axios.post('http://localhost:3000/add-tool', newTool, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(() => {
      setNewTool({ name: '', category: '' }); // Clear form
      fetchTools(); // Refresh list
      alert("Tool added successfully!");
    })
    .catch(err => alert("Failed to add tool"));
  };
  
  const deleteTool = (id) => {
    const token = localStorage.getItem('token');
    
    if (window.confirm("Are you sure you want to permanently remove this tool?")) {
      axios.delete(`http://localhost:3000/delete-tool/${id}`, { headers: { 'Authorization': `Bearer ${token}` }})
      .then(() => {
        fetchTools(); // Refresh the list
      })
      .catch(err => alert("Error deleting tool"));
    }
  };

  // 1. Load tools from backend
  const fetchTools = () => {
    axios.get('http://localhost:3000/tools')
      .then(res => setTools(res.data))
      .catch(err => console.log(err));
  };

  const handleLogin = () => {
    axios.post('http://localhost:3000/login', loginData)
      .then(res => {
        localStorage.setItem('token', res.data.token); // Save the JWT
        setIsLoggedIn(true);
        fetchTools();
      })
      .catch(() => alert("Invalid Login Credentials"));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username'); 
    setIsLoggedIn(false);
    setTools([]); // Clear the tool list from memory for extra security  
    console.log("User logged out successfully");
  };

  // 2. Function to borrow a tool
  const borrowTool = (id) => {
    const token = localStorage.getItem('token');
    if (!borrowerName) return alert("Please enter a name first!");

    axios.patch(`http://localhost:3000/borrow/${id}`, { borrowerName } , {headers: { 'Authorization': `Bearer ${token}` }})
      .then(() => {
        setBorrowerName(""); // Clear the input
        fetchTools(); // Refresh the list to show it's now "Lent"
      })
      .catch(err => console.log(err));
  };

  // 3. Function to return a tool
  const returnTool = (id) => {
    const token = localStorage.getItem('token');
    axios.patch(`http://localhost:3000/return/${id}`,{}, {headers: { 'Authorization': `Bearer ${token}` }})
      .then(() => {
        console.log("Success! Tool returned.");
        fetchTools(); // Refresh the UI
      })
      .catch(err => {
        console.error("Frontend Error:", err.response.data);
        alert("Failed to return tool: " + err.response.data);
      });
  };

  // Function to fetch the history logs
  const fetchHistory = () => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:3000/history', {headers: { 'Authorization': `Bearer ${token}` }})
    .then(res => {
      setHistory(res.data);
      setShowHistory(true);
    })
    .catch(err => alert("Error fetching history: " + err.message));
  };

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Admin Login</h2>
        <input type="text" placeholder="Username" onChange={e => setLoginData({...loginData, username: e.target.value})} /><br/>
        <input type="password" placeholder="Password" onChange={e => setLoginData({...loginData, password: e.target.value})} /><br/>
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
      {/* --- Header & Navigation --- */}
      <header style={{ borderBottom: '2px solid #eee', marginBottom: '30px', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>🛠️ Lab Inventory</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={showHistory ? () => setShowHistory(false) : fetchHistory} 
              style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '5px' }}
            >
              {showHistory ? "📊 Hide History" : "📊 View History"}
            </button>
            <button 
              onClick={handleLogout}
              style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* --- Borrowing Action Area --- */}
      <section style={{ marginBottom: '30px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Assign to Student:</label>
        <input 
          type="text" 
          placeholder="Type student name here..." 
          value={borrowerName}
          onChange={(e) => setBorrowerName(e.target.value)}
          style={{ padding: '12px', width: '100%', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #ccc' }}
        />
      </section>

      <section style={{ marginBottom: '30px', border: '1px dashed #333', padding: '20px', borderRadius: '10px' }}>
        <h3>➕ Add New Lab Equipment</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" placeholder="Tool Name (e.g. 3D Printer)" 
            value={newTool.name}
            onChange={e => setNewTool({...newTool, name: e.target.value})}
            style={{ padding: '8px', flex: 2 }}
          />
          <input 
            type="text" placeholder="Category" 
            value={newTool.category}
            onChange={e => setNewTool({...newTool, category: e.target.value})}
            style={{ padding: '8px', flex: 1 }}
          />
          <button onClick={addTool} style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Add Tool
          </button>
        </div>
      </section>

      {/* --- Tool Inventory Grid --- */}
      <div style={{ display: 'grid', gap: '15px' }}>
        {tools.map(tool => (
          <div key={tool._id} style={{ 
            border: '1px solid #ddd', 
            padding: '15px', 
            borderRadius: '10px',
            backgroundColor: tool.isAvailable ? '#fff' : '#fff5f5',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 5px 0' }}>{tool.name}</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Category: {tool.category}</p>
            
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: tool.isAvailable ? 'green' : 'red', fontWeight: 'bold' }}>
                {tool.isAvailable ? '● Available' : `● Lent to: ${tool.borrowerName}`}
              </span>
              
              <button 
                onClick={() => tool.isAvailable ? borrowTool(tool._id) : returnTool(tool._id)}
                style={{ 
                  padding: '8px 15px', 
                  cursor: 'pointer', 
                  borderRadius: '5px',
                  backgroundColor: tool.isAvailable ? '#007bff' : '#6c757d',
                  color: 'white',
                  border: 'none'
                }}
              >
                {tool.isAvailable ? 'Borrow Tool' : 'Return to Lab'}
              </button>
              {/* Add this button inside your tools.map() loop, near your other buttons */}
              <button 
                onClick={() => deleteTool(tool._id)}
                style={{
                  marginTop: '10px',
                  backgroundColor: 'transparent',
                  color: '#d93025',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textDecoration: 'underline'
                }}
              >
                🗑️ Remove Tool
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* --- Activity Log Section --- */}
      {showHistory && (
        <div style={{ marginTop: '50px', borderTop: '2px solid #333', paddingTop: '20px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>📜 Recent Activity</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead style={{ backgroundColor: '#f4f4f4' }}>
                <tr>
                  <th style={{ padding: '12px' }}>Tool</th>
                  <th>Action</th>
                  <th>User</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {history.map(log => (
                  <tr key={log._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{log.toolName}</td>
                    <td style={{ color: log.action === 'Borrowed' ? '#e67e22' : '#27ae60', fontWeight: 'bold' }}>{log.action}</td>
                    <td>{log.borrowerName}</td>
                    <td style={{ color: '#888', fontSize: '12px' }}>{new Date(log.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
