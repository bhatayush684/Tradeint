import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', background: '#f0f0f0', minHeight: '100vh' }}>
      <h1>Test App - If you can see this, React is working</h1>
      <p>Current time: {new Date().toLocaleString()}</p>
      <div style={{ 
        width: '100px', 
        height: '100px', 
        background: 'linear-gradient(45deg, #667eea, #764ba2)',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        Test Card
      </div>
    </div>
  );
}

export default TestApp;
