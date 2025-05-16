import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { setUser } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Gửi cookie để giữ phiên
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        navigate('/'); // Về trang chủ
      } else {
        setError(data.error || 'Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError('Không thể kết nối tới máy chủ. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card p-4 shadow-lg rounded" style={{ width: '30rem' }}>
        <h2 className="text-center mb-4 text-primary">Đăng nhập</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group mb-3">
            <label htmlFor="username" className="form-label">Tên đăng nhập</label>
            <input
              type="text"
              className="form-control rounded-pill"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>
          <div className="form-group mb-4">
            <label htmlFor="password" className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-control rounded-pill"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
          {error && <p className="text-danger text-center">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block w-100 rounded-pill py-2">
            Đăng nhập
          </button>
        </form>

        <div className="d-flex justify-content-end mt-2">
          <Link to="/forgot-password" className="text-secondary">Quên mật khẩu?</Link>
        </div>

        <div className="d-flex justify-content-center mt-3">
          <Link to="/register" className="text-secondary">Chưa có tài khoản? Đăng ký</Link>
        </div>

        <div className="mt-3 text-center">
          <Link to="/" className="text-secondary">Quay lại trang chủ</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
