import React from "react";
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Scanner from "./Pages/Scanner";

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Scanner />
    </div>
  );
}

export default App;
