import { Routes, Route, Link } from 'react-router-dom';

import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import Gallery from './pages/Gallery';
import About from './pages/About';
import RequestQuote from './pages/RequestQuote';
import Confirmation from './pages/Confirmation';

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