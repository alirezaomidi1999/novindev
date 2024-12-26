import { Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "@pages/Login";
import ProtectedLayout from "layout/ProtectedLayout";
import Dashboard from "@pages/Dashboard";
function App() {
  return (
    <>
      <Routes>
        <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />}/>
        </Route>
          <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
