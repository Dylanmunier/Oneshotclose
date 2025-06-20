import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import { supabase } from './supabaseClient';

export default function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    await supabase.from('messages').insert({ user_id: user.id, content: input });
    setInput('');
    setLoading(false);
  };

  const startRecording = async () => {
    setRecording(true);
    audioChunksRef.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new window.MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      setAudioURL(URL.createObjectURL(audioBlob));
      const fileName = `audio_${Date.now()}.webm`;
      const { data, error } = await supabase.storage.from('audios').upload(fileName, audioBlob, { contentType: 'audio/webm' });
      if (!error) {
        await supabase.from('messages').insert({ user_id: user.id, content: '[Audio]', solution_audio: fileName });
      }
    };
    mediaRecorder.start();
  };
  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current && mediaRecorderRef.current.stop();
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="modern-bg">
      <div className="modern-card">
        <div className="modern-header">
          <span className="modern-badge">🧠</span>
          <div>
            <h1 className="modern-title">OneShotClose</h1>
            <p className="modern-sub">Générateur de Résolutions Commerciales Instantanées</p>
          </div>
        </div>
        <p className="modern-desc">Closer digital express & IA de résolution instantanée pour offres bloquées.</p>
        <div className="modern-separator" />
        {!user ? (
          <button className="modern-btn" onClick={handleLogin}>Se connecter avec Google</button>
        ) : (
          <>
            <p className="modern-user">Bienvenue, {user.email}</p>
            <button className="modern-btn secondary" onClick={handleLogout}>Se déconnecter</button>
            <form onSubmit={handleSend} className="modern-form">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Décris ton blocage ou besoin commercial..."
                className="modern-input"
                disabled={loading}
              />
              <button className="modern-btn" type="submit" disabled={loading}>Envoyer</button>
            </form>
            <div style={{ marginBottom: 16, width: '100%' }}>
              {!recording ? (
                <button className="modern-btn green" onClick={startRecording}>🎤 Message vocal</button>
              ) : (
                <button className="modern-btn red" onClick={stopRecording}>⏹️ Stop</button>
              )}
              {audioURL && <audio src={audioURL} controls style={{ marginTop: 8, width: '100%' }} />}
            </div>
            <div className="modern-history">
              <h2>📝 Historique</h2>
              {loading && <p>Chargement...</p>}
              <ul>
                {messages.map(msg => (
                  <li key={msg.id} className="modern-message">
                    <b>{new Date(msg.created_at).toLocaleString()} :</b> {msg.content}
                    {msg.solution_audio && (
                      <>
                        <br />
                        <audio src={supabase.storage.from('audios').getPublicUrl(msg.solution_audio).data.publicUrl} controls />
                      </>
                    )}
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
