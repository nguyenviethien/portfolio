import './App.css';
import { profile, skills, experiences, caseStudies } from './data/portfolio';

function App() {
  const contactItems = [
    {
      label: 'Email',
      value: profile.contact.email,
      href: 'mailto:' + profile.contact.email
    },
    {
      label: 'Phone',
      value: profile.contact.phone,
      href: 'tel:' + profile.contact.phone.replace(/[^0-9+]/g, '')
    },
    {
      label: 'Portfolio',
      value: 'View work',
      href: profile.contact.portfolio
    },
    {
      label: 'LinkedIn',
      value: 'Connect',
      href: profile.contact.linkedin
    }
  ];

  return (
    <div className="app">
      <header className="hero">
        <div className="hero__content">
          <div className="hero__eyebrow">Portfolio Spotlight</div>
          <h1 className="hero__headline">{profile.name}</h1>
          <p className="hero__subheadline">{profile.title}</p>
          <p className="hero__location">{profile.location}</p>
          <div className="hero__summary">
            {profile.summary.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className="hero__actions">
            {contactItems.map((item) => (
              <a key={item.label} className="pill" href={item.href} target="_blank" rel="noreferrer">
                <span className="pill__label">{item.label}</span>
                <span className="pill__value">{item.value}</span>
              </a>
            ))}
          </div>
        </div>
        {profile.heroImage && (
          <figure className="hero__visual">
            <img src={profile.heroImage.src} alt={profile.heroImage.alt} />
          </figure>
        )}
      </header>

      <main>
        <section className="section">
          <h2>Expertise</h2>
          <div className="grid skills-grid">
            <SkillColumn title="Core" items={skills.core} />
            <SkillColumn title="Tools" items={skills.tools} />
            <SkillColumn title="Methods" items={skills.methods} />
          </div>
        </section>

        <section className="section">
          <h2>Experience</h2>
          <div className="timeline">
            {experiences.map((experience) => (
              <article key={experience.company} className="timeline__item">
                <header className="timeline__header">
                  <span className="timeline__period">{experience.period}</span>
                  <div>
                    <h3>{experience.title}</h3>
                    <p className="timeline__company">{experience.company}</p>
                  </div>
                </header>
                <ul className="timeline__highlights">
                  {experience.highlights.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Product Case Studies</h2>
          <div className="grid case-grid">
            {caseStudies.map((caseStudy) => (
              <CaseCard key={caseStudy.id} caseStudy={caseStudy} />
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Available for collaborations on complex analytics platforms.</p>
        <a className="footer__cta" href={profile.contact.portfolio} target="_blank" rel="noreferrer">
          See full portfolio
        </a>
      </footer>
    </div>
  );
}

function SkillColumn({ title, items }) {
  return (
    <div className="skills-column">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function CaseCard({ caseStudy }) {
  return (
    <article className={'case-card case-card--' + caseStudy.tone}>
      <header>
        <span className="case-card__product">{caseStudy.product}</span>
        <h3>{caseStudy.title}</h3>
        <p>{caseStudy.description}</p>
      </header>
      <div className="case-card__preview">
        {caseStudy.images.map((image, index) => (
          <figure key={image.src} className="case-card__frame">
            <img src={image.src} alt={image.alt} loading="lazy" />
            {caseStudy.screens[index] && (
              <figcaption>{caseStudy.screens[index]}</figcaption>
            )}
          </figure>
        ))}
      </div>
      <div className="case-card__screens">
        {caseStudy.screens.map((screen) => (
          <span key={screen} className="case-card__chip">{screen}</span>
        ))}
      </div>
      <p className="case-card__impact">{caseStudy.impact}</p>
    </article>
  );
}

export default App;
