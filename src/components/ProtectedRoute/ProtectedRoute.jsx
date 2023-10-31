import { Route, NavLink } from "react-router-dom";

export function PrivateRoute({ children, userType, allowedUserType, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) => {
        if (userType === allowedUserType) {
          return children;
        } else {
          return (
            <NavLink
              to={{
                pathname: "/login",
                state: { from: location }
              }}
            />
          );
        }
      }}
    />
  );
}
