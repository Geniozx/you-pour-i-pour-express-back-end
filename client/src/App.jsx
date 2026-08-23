import { Routes, Route, Link } from 'react-router-dom';
import "./App.css";

import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import ServiceDetails from './pages/ServiceDetails.jsx';
import Gallery from './pages/Gallery.jsx';
import About from './pages/About.jsx';
import RequestQuote from './pages/RequestQuote.jsx';
import Confirmation from './pages/Confirmation.jsx';

function App() {
  return (
    <div>
      <h1>You Party - I Pour</h1>

      <nav>
        <Link to="/">Home</Link>{' '}
        <Link to="/services">Services</Link>{' '}
        <Link to="/gallery">Gallery</Link>{' '}
        <Link to="/about">About</Link>{' '}
        <Link to="/request-quote">Request a Quote</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetails />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/about" element={<About />} />
        <Route path="/request-quote" element={<RequestQuote />} />
        <Route path="/confirmation" element={<Confirmation />} />
      </Routes>
    </div>
  );
}

export default App;