import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/document_logo.jpg";

function Navbar() {
  const { user, setUser } = useContext(AuthContext);

  const handleLogout = async () => {
    await fetch('http://localhost:5000/logout', {
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container-fluid">
        {/* Logo và  home link */}
        <Link className="navbar-brand" to="/">
          <img src={logo} alt="Logo" height="40" />
        </Link>

        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Center the navigation items */}
          <ul className="navbar-nav mx-auto d-flex align-items-center">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="bi bi-house-door me-2"></i> Trang chủ
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/mydocument">
                <i className="bi bi-file-earmark me-2"></i> Tài liệu của bạn
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/favorites">
                <i className="bi bi-heart me-2"></i> Tài liệu yêu thích
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/chat">
                <i className="bi bi-chat me-2"></i> Trò chuyện với AI
              </Link>
            </li>
          </ul>

          {/* Right-aligned login/logout and user info */}
          <ul className="navbar-nav ms-auto d-flex align-items-center">
            {user ? (
              <>
                <li className="nav-item me-2">
                  <span className="nav-link">👤 {user.username}</span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login">Đăng nhập</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
