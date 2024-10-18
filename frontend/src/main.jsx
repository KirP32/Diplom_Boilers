import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from './App.jsx'
import './index.css'
import Playground from './components/Others/Playground.jsx';
import NotFoundPage from './components/NotFoundPage/NotFoundPage.jsx';
import PersonalAccount from './components/PersonalAccount/PersonalAccount.jsx';
import LogIn from './components/LogIn/LogIn.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage></NotFoundPage>,
  },
  {
    path: '/login',
    element: <LogIn />,
  },
  {
    path: '/registration',
    element: <Playground />,
  },
  {
    path: '/PersonalAccount',
    element: <PersonalAccount />,
  },

]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
