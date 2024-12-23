import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import "./main.scss";
import Playground from "./components/Others/Playground.jsx";
import NotFoundPage from "./components/NotFoundPage/NotFoundPage.jsx";
import PersonalAccount from "./components/PersonalAccount/PersonalAccount.jsx";
import PrivateRoute from "./components/Guards/PrivateRoute.jsx";
import WorkerPanel from "./components/WorkerPanel/WorkerPanel.jsx";
import WorkerGuard from "./components/Guards/WorkerGuard.jsx";
import "material-icons/iconfont/material-icons.css";
import { ThemeProvider } from "./Theme.jsx";
import RequestDetails from "./components/PersonalAccount/tabs/ViewRequests/RequestDetails/RequestDetails";
import ErrorComponent from "./components/ErrorComponent/ErrorComponent.jsx";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      errorElement: <NotFoundPage></NotFoundPage>,
    },
    {
      path: "/registration",
      element: <Playground />,
    },
    {
      path: "/personalaccount",
      element: (
        <PrivateRoute>
          <PersonalAccount />
        </PrivateRoute>
      ),
      children: [
        {
          path: "request/:id",
          element: <RequestDetails />,
        },
      ],
      errorElement: <ErrorComponent />,
    },
    {
      path: "/workerpanel",
      element: (
        <WorkerGuard>
          <WorkerPanel />
        </WorkerGuard>
      ),
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_normalizeFormMethod: true,
      v7_fetcherPersist: true,
      v7_partialHydration: true,
      v7_skipActionStatusRevalidation: true,
    },
  }
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
        }}
      />
    </ThemeProvider>
  </StrictMode>
);
