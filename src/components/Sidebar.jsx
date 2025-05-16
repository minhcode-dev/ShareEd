import React from "react";
import { Link } from 'react-router-dom'; // Import Link để kết nối các trang

function Sidebar() {
  return (
    <div
      className="d-flex flex-column p-3 bg-light justify-content-center"
      style={{ width: "250px", minHeight: "100vh" }}
    >
      <ul className="nav flex-column gap-3">
        <li className="nav-item">
          <Link className="nav-link active" to="/">
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
      </ul>
    </div>
  );
}

export default Sidebar;
