import React from 'react';
import './App.css';
import { supabase } from './supabaseClient';
import { fetchFromAPI } from './api';

export default function App() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="container">
      <header>
        <h1>🧠 OneShotClose — NumaTwin Vision</h1>
        <p>Le SaaS IA modulaire pour la Martinique</p>
      </header>
      <section>
        <h2>Connexion</h2>
        {user ? (
          <>
            <p>Connecté en tant que {user.email}</p>
            <button className="btn-primary" onClick={handleLogout}>Se déconnecter</button>
          </>
        ) : (
          <button className="btn-primary" onClick={handleLogin}>Se connecter avec Google</button>
        )}
      </section>
      <section>
        <h2>Dashboard IA</h2>
        <ul>
          <li>Assistant IA hybride</li>
          <li>Générateur de solutions/projets</li>
          <li>PromptBuilder</li>
          <li>Jumeau numérique IA</li>
          <li>Facturation & monitoring</li>
        </ul>
      </section>
      <section>
        <h2>Test API Backend</h2>
        <button className="btn-primary" onClick={async () => {
          try {
            const data = await fetchFromAPI('/');
            alert('Réponse API : ' + data.message);
          } catch (e) {
            alert('Erreur API : ' + e.message);
          }
        }}>Tester connexion backend</button>
      </section>
    </div>
  );
}
