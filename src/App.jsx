// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home"; // Import trang Home
import Login from "./components/Login"; // Import trang Login
import Register from "./components/Register"; // Import trang Login
import Document from "./components/DocumentPage"; // Import trang Login
import DocumentCate from "./components/DocumentCate"; // Import trang Login
import FavoriteDoc from "./components/FavoriteDocument"; // Import trang Login
import DocumentDetail from "./components/DocumentDetail"; // Your DocumentDetail component
import ChatPage from "./components/ChatPage"; // Your DocumentDetail component
import ChatListPage from "./components/ChatListPage"; // Your DocumentDetail component

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Route đến trang Home */}
        <Route path="/login" element={<Login />} /> {/* Route đến trang Login */}
        <Route path="/register" element={<Register />} /> {/* Route đến trang Login */}
        <Route path="/mydocument" element={<Document />} /> {/* Route đến trang my document */}
        <Route path="/categories" element={<DocumentCate />} /> {/* Route đến trang cate */}
        <Route path="/favorites" element={<FavoriteDoc />} /> {/* Route đến trang cate */}
        <Route path="/document/:id" element={<DocumentDetail />} /> {/* New route */}
        <Route path="/chat/:id" element={<ChatPage />} /> {/* New route */}
        <Route path="/chat" element={<ChatListPage />} /> {/* New route */}

      </Routes>
    </Router>
  </AuthProvider>

  );
}

export default App;
