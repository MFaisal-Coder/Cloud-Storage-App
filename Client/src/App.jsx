import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DirectoryView from "./DirectoryView";
import UsersPage from "./UsersPage";
import Register from "./Register";
import Login from "./Login";
import Plans from "./Plans";
import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DirectoryView />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/users",
    element: <UsersPage />,
  },
  {
    path: "/directory/:dirId",
    element: <DirectoryView />,
  },
  {
    path: "/plans",
    element: <Plans />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
