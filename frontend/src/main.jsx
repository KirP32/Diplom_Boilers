import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App.jsx';
import './index.css';
import Playground from './components/Others/Playground.jsx';
import NotFoundPage from './components/NotFoundPage/NotFoundPage.jsx';
import PersonalAccount from './components/PersonalAccount/PersonalAccount.jsx';
import PrivateRoute from './components/Guards/PrivateRoute.jsx';
import WorkerPanel from './components/WorkerPanel/WorkerPanel.jsx';
import WorkerGuard from './components/Guards/WorkerGuard.jsx';
import 'material-icons/iconfont/material-icons.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage></NotFoundPage>,
  },
  {
    path: '/registration',
    element: <Playground />,
  },
  {
    path: '/personalaccount',
    element: (
      <PrivateRoute>
        <PersonalAccount />
      </PrivateRoute>
    ),
  },
  {
    path: '/workerpanel',
    element: (
      <WorkerGuard>
        <WorkerPanel />
      </WorkerGuard>
    ),
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider
      future={{
        v7_startTransition: true,
      }}
      router={router} />
  </StrictMode>,
);
