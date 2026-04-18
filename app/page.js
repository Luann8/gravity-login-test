'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [user, setUser] = useState(null);

  // Verifica se o usuário já tem um token na primeira vez que abre o app
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch('/api/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.user) {
            setUser(data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Erro ao verificar sessão', err);
        }
      }
    };
    checkToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const endpoint = isLogin ? '/api/login' : '/api/register';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ocorreu um erro');
      } else {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          // Busca os dados protegidos do usuário após login de sucesso:
          const userRes = await fetch('/api/me', {
            headers: { 'Authorization': `Bearer ${data.token}` }
          });
          const userData = await userRes.json();
          if (userRes.ok) setUser(userData.user);
        } else {
          setSuccess('Conta criada! Faça login para acessar.');
          setIsLogin(true);
          setPassword(''); // Limpa a senha, mantém o email preenchido para ele logar fácil.
        }
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setEmail('');
    setPassword('');
  };

  // Se estiver logado, exibe a interface do Dashboard
  if (user) {
    return (
      <div className="glass-panel dashboard-card">
        <div className="profile-avatar">
          {user.email.charAt(0).toUpperCase()}
        </div>
        <h1 className="title">Bem-vindo(a)!</h1>
        <p className="dashboard-email">{user.email}</p>
        <button 
          onClick={handleLogout} 
          className="glass-button" 
          style={{ background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }}
        >
          Sair da Conta
        </button>
      </div>
    );
  }

  // Caso não esteja logado, exibe os formulários (Login / Registro)
  return (
    <div className="glass-panel">
      <h1 className="title">{isLogin ? 'Bem-vindo de volta' : 'Nova Conta'}</h1>
      <p className="subtitle">
        {isLogin ? 'Acesse seu painel com sua conta.' : 'Junte-se a nós hoje mesmo!'}
      </p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="glass-input"
            placeholder="seu@email.com"
            required
          />
        </div>
        
        <div className="input-group">
          <label className="input-label">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glass-input"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        <button type="submit" className="glass-button" disabled={loading}>
          {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Registrar')}
        </button>
      </form>

      <div className="toggle-text">
        {isLogin ? 'Ainda não tem conta? ' : 'Já é membro? '}
        <button 
          type="button" 
          className="toggle-link"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setSuccess('');
          }}
        >
          {isLogin ? 'Criar conta agora' : 'Fazer login'}
        </button>
      </div>
    </div>
  );
}
