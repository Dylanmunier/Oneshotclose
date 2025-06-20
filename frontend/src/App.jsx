import { useState } from 'react';
import './App.css';

const SERVICES = [
  {
    id: 1,
    name: 'Closing Script',
    description: 'Livraison à partir de 990€',
    price: 990,
    icon: '📄',
  },
  {
    id: 2,
    name: 'Verbal Pitch',
    description: 'À partir de 590€',
    price: 590,
    icon: '💬',
  },
  {
    id: 3,
    name: 'Offer Refinement',
    description: 'À partir de 499€',
    price: 499,
    icon: '✔️',
  },
  {
    id: 4,
    name: 'Objection Handling',
    description: 'À partir de 140€',
    price: 140,
    icon: '🔵',
  },
];

function BrandLogo() {
  return (
    <div className="osc-logo">
      <img src="/logo-osc.svg" alt="OneShotClose" style={{height:36,verticalAlign:'middle',marginRight:8}}/>
      <span style={{fontWeight:900,letterSpacing:1}}>OneShotClose</span>
    </div>
  );
}

function ContactForm({onClose}) {
  return (
    <div className="osc-contact-modal">
      <h3>Contact / Demande personnalisée</h3>
      <form className="osc-contact-form" onSubmit={e=>{e.preventDefault();alert('Message envoyé !');onClose();}}>
        <input type="text" placeholder="Nom" required />
        <input type="email" placeholder="Email" required />
        <textarea placeholder="Votre message ou besoin" required />
        <button type="submit">Envoyer</button>
        <button type="button" className="osc-contact-close" onClick={onClose}>Annuler</button>
      </form>
    </div>
  );
}

function App() {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const addToCart = (service) => {
    setCart((prev) => [...prev, service]);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item, idx) => idx !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="osc-root">
      <header className="osc-header">
        <BrandLogo />
        <nav>
          <a href="#services">Services</a>
          <a href="#how">Fonctionnement</a>
          <a href="#business">Entreprises</a>
          <a href="#examples">Exemples</a>
          <button className="osc-cart-btn" onClick={() => setShowCart(!showCart)}>
            🛒 {cart.length}
          </button>
          <button className="osc-contact-btn" onClick={()=>setShowContact(true)}>
            Contact
          </button>
        </nav>
      </header>
      <main>
        <section className="osc-hero">
          <h1><span className="osc-gradient-text">One need. One solution.<br/>In one closing.</span></h1>
          <p>En moins de 48h, nous identifions les blocages commerciaux et livrons un script, un appel ou une stratégie pour closer la vente.</p>
          <button className="osc-cta" onClick={()=>setShowContact(true)}>Essayer OneShotClose</button>
        </section>
        <section id="services" className="osc-services">
          <h2>Services</h2>
          <div className="osc-services-list">
            {SERVICES.map((service) => (
              <div key={service.id} className="osc-service-card">
                <span className="osc-service-icon">{service.icon}</span>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <button onClick={() => addToCart(service)}>Acheter</button>
              </div>
            ))}
          </div>
        </section>
        <section id="how" className="osc-how">
          <h2>Comment ça marche</h2>
          <div className="osc-how-steps">
            <div><b>1. Entrer les détails</b><br/>Processus en ligne</div>
            <div><b>2. Paiement</b><br/>Livraison rapide</div>
            <div><b>3. Recevez votre solution</b><br/>Livraison personnalisée</div>
          </div>
        </section>
        <section id="business" className="osc-business">
          <div>
            <h2>Pour les entreprises</h2>
            <p>Des solutions à fort impact, taillées pour les startups, SaaS, agences et plus.</p>
          </div>
          <div className="osc-business-highlight">
            <b>For businesses</b><br/>
            High-impact solutions tailored for startups, SaaS and more.
          </div>
        </section>
        <section id="examples" className="osc-examples">
          <h2>Exemples</h2>
          <div className="osc-examples-list">
            <div>Script de closing pour un produit SaaS</div>
            <div>Présentation de stratégie commerciale</div>
          </div>
        </section>
      </main>
      {showCart && (
        <div className="osc-cart-modal">
          <h3>Panier</h3>
          {cart.length === 0 ? (
            <p>Votre panier est vide.</p>
          ) : (
            <ul>
              {cart.map((item, idx) => (
                <li key={idx}>
                  {item.name} - {item.price}€
                  <button onClick={() => removeFromCart(idx)}>Retirer</button>
                </li>
              ))}
            </ul>
          )}
          <div className="osc-cart-total">Total : {total}€</div>
          <button className="osc-cart-close" onClick={() => setShowCart(false)}>Fermer</button>
        </div>
      )}
      {showContact && <ContactForm onClose={()=>setShowContact(false)} />}
    </div>
  );
}

export default App;
