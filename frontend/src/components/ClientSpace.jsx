import { useState, useEffect } from 'react';
import { supabase } from '../../../supabase/supabaseClient';

export function ClientSpace() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchProjects();
  }, []);

  async function fetchUserData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        setUserData(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProjects() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
    }
  }

  async function updateProfile(updates) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      setUserData({ ...userData, ...updates });
      alert('Profil mis à jour avec succès!');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      alert('Erreur lors de la mise à jour du profil');
    }
  }

  if (loading) {
    return <div className="osc-client-space">Chargement...</div>;
  }

  return (
    <div className="osc-client-space">
      <div className="osc-client-header">
        <h2>Espace Client</h2>
        <nav className="osc-client-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            Tableau de bord
          </button>
          <button 
            className={activeTab === 'projects' ? 'active' : ''} 
            onClick={() => setActiveTab('projects')}
          >
            Mes Projets
          </button>
          <button 
            className={activeTab === 'profile' ? 'active' : ''} 
            onClick={() => setActiveTab('profile')}
          >
            Mon Profil
          </button>
        </nav>
      </div>

      <div className="osc-client-content">
        {activeTab === 'dashboard' && (
          <div>
            <h3>Bienvenue, {userData?.full_name || 'Client'}</h3>
            <div className="osc-client-grid">
              <div className="osc-client-card">
                <h4>Projets actifs</h4>
                <p className="osc-stat-number">{projects.filter(p => p.status === 'active').length}</p>
              </div>
              <div className="osc-client-card">
                <h4>Services utilisés</h4>
                <p className="osc-stat-number">{projects.length}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div>
            <h3>Mes Projets</h3>
            <div className="osc-client-grid">
              {projects.map(project => (
                <div key={project.id} className="osc-client-card">
                  <h4>{project.name}</h4>
                  <p>{project.description}</p>
                  <span className={`osc-client-status ${project.status}`}>
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h3>Mon Profil</h3>
            <form 
              className="osc-client-form"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                updateProfile({
                  full_name: formData.get('fullName'),
                  company: formData.get('company'),
                  phone: formData.get('phone')
                });
              }}
            >
              <input 
                type="text" 
                name="fullName" 
                placeholder="Nom complet"
                defaultValue={userData?.full_name || ''}
              />
              <input 
                type="text" 
                name="company" 
                placeholder="Entreprise"
                defaultValue={userData?.company || ''}
              />
              <input 
                type="tel" 
                name="phone" 
                placeholder="Téléphone"
                defaultValue={userData?.phone || ''}
              />
              <button type="submit">Mettre à jour le profil</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
