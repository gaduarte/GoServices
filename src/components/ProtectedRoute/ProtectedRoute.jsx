import { Route, Navigate } from "react-router-dom";

export function PrivateRoute({ element, allowRoles }) {
  const userRole = sessionStorage.getItem("role");

  if (allowRoles.includes(userRole)) {
    return <Route element={element} />;
  } else {
    return <Navigate to="/login" />;
  }
}

