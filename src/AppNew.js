import { useEffect, useState } from 'react';
import './App.css';

const projects = [
  {
    name: 'UAV Ground Control System',
    description: 'QGroundControl-based software integrating flight controllers, cameras, gimbals, payloads, telemetry, and video.',
    stack: 'C++ · Qt/QML · MAVLink · PX4/ArduPilot · RTSP · MQTT'
  },
  {
    name: 'Industrial Monitoring Platforms',
    description: 'Real-time dashboards, alarms, charts, and equipment-data integrations for enterprise and industrial users.',
    stack: 'C# · ASP.NET Web API · Angular · SignalR · Highcharts · OPC/PLC'
  },
  {
    name: 'Device Control Applications',
    description: 'Windows and embedded applications that connect hardware, sensors, and operator workflows.',
    stack: 'C++/MFC · WPF · Qt · Buildroot · USB HID · Serial/UART'
  }
];

function AppNew() {
  const [cv, setCv] = useState(null);

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/assets/cv.json`, { cache: 'no-cache' })
      .then((response) => response.json())
      .then(setCv)
      .catch(() => setCv(null));
  }, []);

  if (!cv) return <main className="app"><p>Loading portfolio…</p></main>;

  const { hero, resume } = cv;
  return (
    <div className="app">
      <header className="hero">
        <div className="hero__content">
          <div className="hero__top">
            <img className="hero__photo" src={require('./document/hiencv.jpg')} alt={hero.name} />
            <div>
              <div className="hero__eyebrow">Software Engineering Portfolio</div>
              <h1 className="hero__headline">{hero.name}</h1>
              <p className="hero__subheadline">{hero.title}</p>
              <p className="hero__location">{hero.address}</p>
            </div>
          </div>
          <div className="hero__summary">{hero.summary.map((line) => <p key={line}>{line}</p>)}</div>
          <div className="hero__actions">
            <a className="pill" href={`mailto:${hero.email}`}><span className="pill__label">Email</span><span className="pill__value">{hero.email}</span></a>
            <a className="pill" href={`tel:${hero.phone.replace(/[^0-9+]/g, '')}`}><span className="pill__label">Phone</span><span className="pill__value">{hero.phone}</span></a>
          </div>
        </div>
      </header>

      <main>
        <section className="section">
          <h2>Experience</h2>
          <div className="timeline">
            {resume.experiences.map((experience) => (
              <article className="timeline__item" key={`${experience.company}-${experience.period}`}>
                <header className="timeline__header">
                  <span className="timeline__period">{experience.period}</span>
                  <div><h3>{experience.title}</h3><p className="timeline__company">{experience.company}</p></div>
                </header>
                <ul className="timeline__highlights">{experience.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Technical Skills</h2>
          <div className="skills-column"><ul>{resume.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul></div>
        </section>

        <section className="section">
          <h2>Selected Work</h2>
          <div className="grid skills-grid">
            {projects.map((project) => <article className="skills-column" key={project.name}><h3>{project.name}</h3><p>{project.description}</p><p className="project-stack">{project.stack}</p></article>)}
          </div>
        </section>

        <section className="section">
          <h2>Education & Languages</h2>
          <div className="skills-column"><ul>{resume.education.map((item) => <li key={item}>{item}</li>)}</ul></div>
        </section>
      </main>

      <footer className="footer"><p>Available for software engineering, system integration, and device-control opportunities.</p></footer>
    </div>
  );
}

export default AppNew;
