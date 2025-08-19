import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import Scanner from "./Pages/Scanner";
function App() {
    const [count, setCount] = useState(0);
    return (_jsx("div", { children: _jsx(Scanner, {}) }));
}
export default App;
