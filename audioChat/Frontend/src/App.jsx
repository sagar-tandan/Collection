import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import AudioChat from "./AudioChat";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <AudioChat />
    </>
  );
}

export default App;
