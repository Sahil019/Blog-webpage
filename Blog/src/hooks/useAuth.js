import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/user').then(r => r.json()).then(data => {
      if (data.user) setUser(data.user);
      setLoading(false);
    });
  }, []);

  const signIn = async (email, password) => {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.user) setUser(data.user);
    return { error: data.error };
  };

  const signUp = async (email, password, name) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    const data = await response.json();
    if (data.user) setUser(data.user);
    return { error: data.error };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
  };
}
