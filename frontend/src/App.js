import React from "react";

function App() {
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    fetch("http://localhost:5000/") // Or http://api:5000/ if you aren't mapping to localhost
      .then((response) => response.text())
      .then((data) => setMessage(data));
  }, []);

  return (
    <div>
      <h1>FamilyNexus</h1>
      <p>Message from backend: {message}</p>
    </div>
  );
}

export default App;
