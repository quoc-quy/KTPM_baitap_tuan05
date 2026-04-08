import { useState } from 'react';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'USER' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await userService.login({ username: formData.username, password: formData.password });
        // Giả sử API trả về { user: {...}, token: '...' }
        login(res.data.user || { username: formData.username, role: 'USER' }, res.data.token || 'fake-jwt');
        navigate('/');
      } else {
        await userService.register(formData);
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsLogin(true);
      }
    } catch (err) {
      alert("Lỗi kết nối hoặc sai thông tin!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6 drop-shadow-sm">
          {isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input 
            type="text" placeholder="Tên đăng nhập" required className="glass-input"
            onChange={e => setFormData({...formData, username: e.target.value})}
          />
          <input 
            type="password" placeholder="Mật khẩu" required className="glass-input"
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
          {!isLogin && (
            <select className="glass-input" onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="USER">Khách hàng</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          )}
          <button type="submit" className="glass-button">
            {isLogin ? 'Đăng Nhập Ngay' : 'Đăng Ký'}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-700">
          {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} 
          <button onClick={() => setIsLogin(!isLogin)} className="ml-2 font-bold text-indigo-700 hover:underline">
            {isLogin ? 'Đăng ký' : 'Đăng nhập'}
          </button>
        </p>
      </div>
    </div>
  );
}