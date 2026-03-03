import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

function Register({ onRegister, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const isBannedLocally = localStorage.getItem('mt_uuid_ban') === 'true';
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      
      const res = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          username, 
          password,
          mt_uuid_ban: isBannedLocally
        }),
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Respuesta inesperada del servidor: ' + text);
      }
      if (!res.ok) {
        throw data.detail;
      }
      setSuccess('Registration successful! Logging in...');
      setTimeout(() => {
        // JWT is managed by HttpOnly cookies now
        onRegister(data.user);
      }, 1000);
    } catch (err) {
      if (typeof err === 'object' && err !== null && err.message) {
         setError(err.message);
         if (err.ban_until || err.message === 'Permaban por tonto' || err.message === 'User is temporarily suspended.') {
             window.dispatchEvent(new CustomEvent('userBanned', { detail: { message: err.message, ban_until: err.ban_until || null } }));
         }
      } else {
         setError(err.message || String(err));
         if (err === 'Permaban por tonto') {
             window.dispatchEvent(new CustomEvent('userBanned', { detail: err }));
         }
      }
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-black text-white'>
      <form
        onSubmit={handleSubmit}
        className='bg-gray-900 p-6 md:p-8 rounded-lg shadow-lg w-full max-w-sm'
      >
        <h2 className='text-2xl font-bold mb-6 text-green-400'>Register</h2>
        {error && <div className='mb-4 text-red-400'>{error}</div>}
        {success && <div className='mb-4 text-green-400'>{success}</div>}
        <div className='mb-4'>
          <label className='block mb-1'>Username</label>
          <input
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className='w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none'
            required
          />
        </div>
        <div className='mb-6'>
          <label className='block mb-1'>Password</label>
          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full p-2 pr-10 rounded bg-gray-800 border border-gray-700 focus:outline-none'
              required
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none'
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <button
          type='submit'
          className='w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition'
        >
          Register
        </button>
        <button
          type='button'
          onClick={onSwitchToLogin}
          className='w-full mt-4 text-green-400 hover:underline'
        >
          Already have an account? Login
        </button>
      </form>
    </div>
  );
}

export default Register;
