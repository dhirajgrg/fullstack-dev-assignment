import { Routes, Route } from "react-router-dom";
import CreateSecret from "./components/CreateSecret";
import ViewSecret from "./components/ViewSecret";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<CreateSecret />} />
        <Route path="/view/:token" element={<ViewSecret />} />
      </Routes>
    </div>
  );
}

export default App;
