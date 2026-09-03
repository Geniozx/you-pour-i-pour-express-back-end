import { Link } from "react-router-dom";

function About() {
  return (
    <div className="about-page">
      <section className="about-intro">
        <div className="about-logo-placeholder">
          Brand Logo
        </div>

        <h2 className="about-statement">
          Brand Statement
        </h2>
      </section>

      <section className="about-story">
        <div className="about-story-media">
          <div className="about-image-placeholder">
            About Image
          </div>
        </div>

        <div className="about-story-content">
          <p className="about-section-label">
            Our Story
          </p>

          <div className="about-story-copy">
            <p>
              Story content will go here.
            </p>

            <p>
              Additional story content will go here.
            </p>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="about-value">
          <h3>Craft</h3>
          <p>
            Value description
          </p>
        </div>

        <div className="about-value">
          <h3>Service</h3>
          <p>
            Value description
          </p>
        </div>

        <div className="about-value">
          <h3>Experience</h3>
          <p>
            Value description
          </p>
        </div>
      </section>

      <section className="about-cta">
        <p>Planning an event?</p>

        <Link
          className="about-cta-link"
          to="/request-quote"
        >
          Request a Quote →
        </Link>
      </section>
    </div>
  );
}

export default About;