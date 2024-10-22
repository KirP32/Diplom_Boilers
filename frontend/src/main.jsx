import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from './App.jsx';
import './index.css';
import Playground from './components/Others/Playground.jsx';
import NotFoundPage from './components/NotFoundPage/NotFoundPage.jsx';
import PersonalAccount from './components/PersonalAccount/PersonalAccount.jsx';
import PrivateRoute from './components/Guards/PrivateRoute.jsx';
import LoginGuard from './components/Guards/LoginGuard.jsx';

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
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
