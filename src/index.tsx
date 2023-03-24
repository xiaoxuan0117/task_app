import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { store } from "./store";
import { Provider } from "react-redux";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./routes/Home";
import Login from "./routes/Login";
import TaskDetail from "./routes/TaskDetail";
import AddModal from "./components/molecule/AddModal";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    children: [
      {
        path: "add",
        element: <AddModal />,
      },
    ],
  },
  {
    path: "/:repo",
    element: <Home />,
    children: [
      {
        path: "add",
        element: <AddModal />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/:owner/:repo/:number",
    element: <TaskDetail />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
