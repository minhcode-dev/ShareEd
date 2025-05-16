import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate(); // dùng để chuyển hướng

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
    } else if (username === '' || password === '' || email === '') {
      setError('Vui lòng nhập đầy đủ thông tin!');
    } else {
      try {
        const response = await fetch('http://localhost:5000/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username, password }),
        });
        const data = await response.json();

        if (response.ok) {
          setSuccess(data.message);
          setError('');

          // Đợi 1.5 giây rồi chuyển hướng sang trang đăng nhập
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        } else {
          setError(data.error);
          setSuccess('');
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi kết nối với máy chủ!');
        setSuccess('');
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card p-4 shadow-lg rounded" style={{ width: '30rem' }}>
        <h2 className="text-center mb-4 text-primary">Đăng ký tài khoản</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control rounded-pill"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
              required
            />
          </div>
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
          <div className="form-group mb-3">
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
          <div className="form-group mb-4">
            <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu</label>
            <input
              type="password"
              className="form-control rounded-pill"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu"
              required
            />
          </div>
          {error && <p className="text-danger text-center">{error}</p>}
          {success && <p className="text-success text-center">{success}</p>}
          <button type="submit" className="btn btn-primary btn-block w-100 rounded-pill py-2">
            Đăng ký
          </button>
        </form>

        <div className="d-flex justify-content-center mt-2">
          <Link to="/login" className="text-secondary">Đã có tài khoản? Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
