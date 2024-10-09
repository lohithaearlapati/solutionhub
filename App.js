import React from "react";
import Index from './Pages/Index';
import Register from './Pages/Register';
import Login from './Pages/Login';
import Subjects from './Pages/Subjects';
import Topics from './Pages/Topics';
import Solutions from './Pages/Solutions';

import { RouterProvider, createBrowserRouter } from "react-router-dom";

// Define routes
const router = createBrowserRouter([
    { path: '/', element: <Index /> },
    { path: '/Register', element: <Register /> },
    { path: '/Login', element: <Login /> },
    { path: '/Subjects', element: <Subjects /> },
    // Define a dynamic route for topics, accepting `subjectName` as a parameter
    { path: '/Subjects/:subjectName/Topics', element: <Topics /> },
    // Define a dynamic route for solutions, accepting `topicName` as a parameter
    { path: '/Topics/:topicName/Solutions', element: <Solutions /> }
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
