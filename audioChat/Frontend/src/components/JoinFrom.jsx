import { useState } from "react";

function JoinForm({ onJoin }) {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomId && username) {
      onJoin({ roomId, username });
    }
  };

  return (
    <div className="join-form">
      <h2>Join Audio Chat Room</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter Your Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <button type="submit">Join Room</button>
      </form>
    </div>
  );
}

export default JoinForm;
