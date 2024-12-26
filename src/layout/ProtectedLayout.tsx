import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedLayout() {
  const getToken = localStorage.getItem("authToken");
  return getToken ? <Outlet /> : <Navigate to={"/login"} />;
}
