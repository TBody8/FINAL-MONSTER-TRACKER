import React, { useState } from 'react';

function Login({ onLogin, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Respuesta inesperada del servidor: ' + text);
      }
      if (!res.ok) {
        throw new Error(data.detail || 'Invalid credentials');
      }
      onLogin(data.access_token, data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-black text-white'>
      <form
        onSubmit={handleSubmit}
        className='bg-gray-900 p-6 md:p-8 rounded-lg shadow-lg w-full max-w-sm'
      >
        <h2 className='text-2xl font-bold mb-6 text-green-400'>Login</h2>
        {error && <div className='mb-4 text-red-400'>{error}</div>}
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
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none'
            required
          />
        </div>
        <button
          type='submit'
          className='w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition'
        >
          Login
        </button>
        <button
          type='button'
          onClick={onSwitchToRegister}
          className='w-full mt-4 text-green-400 hover:underline'
        >
          Don't have an account? Register
        </button>
      </form>
    </div>
  );
}

export default Login;
