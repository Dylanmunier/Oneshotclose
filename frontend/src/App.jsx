import React, { useEffect, useState } from 'react';
import './App.css';
import { supabase } from './supabaseClient';

export default function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Authentification Supabase (Google)
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Récupération temps réel des messages
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from('messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMessages(data || []);
        setLoading(false);
      });
    // Abonnement temps réel
    const sub = supabase
      .channel('messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.new && payload.new.user_id === user.id) {
          setMessages((msgs) => [payload.new, ...msgs]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [user]);

  // Envoi d’un message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    await supabase.from('messages').insert({ user_id: user.id, content: input });
    setInput('');
    setLoading(false);
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="template-bg">
      <div className="template-card">
        <img src="/template.jpeg" alt="Aperçu OneShotClose" className="template-img" />
        <h1 className="template-title">🧠 OneShotClose</h1>
        <p className="template-desc">Le SaaS IA modulaire pour propulser la Martinique dans l’ère numérique</p>
        {!user ? (
          <button className="cta-btn" onClick={handleLogin}>Se connecter avec Google</button>
        ) : (
          <>
            <p className="template-user">Bienvenue, {user.email}</p>
            <button className="cta-btn" onClick={handleLogout}>Se déconnecter</button>
            <form onSubmit={handleSend} className="template-form">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Décris ton blocage ou besoin commercial..."
                className="template-input"
                disabled={loading}
              />
              <button className="cta-btn" type="submit" disabled={loading}>Envoyer</button>
            </form>
            <div className="template-history">
              <h2>📝 Historique de vos demandes</h2>
              {loading && <p>Chargement...</p>}
              <ul>
                {messages.map(msg => (
                  <li key={msg.id} className="template-message">
                    <b>{new Date(msg.created_at).toLocaleString()} :</b> {msg.content}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
