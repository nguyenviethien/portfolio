import './App.css';
import { useEffect, useRef, useState } from 'react';

// Load certificates from src/document/certificate at build time
function loadCertificates() {
  try {
    // Webpack's require.context to include common cert file types
    const ctx = require.context('./document/certificate', false, /\.(pdf|docx?|jpe?g|png)$/i);
    const toTitle = (p) => {
      const base = p.replace(/^\.\//, '').replace(/\.[^.]+$/, '');
      return base.replace(/[ _-]+/g, ' ');
    };
    return ctx.keys()
      .filter((key) => !/nguyenviethien_portfolio\.(pdf|docx?)$/i.test(key.replace(/^\.\//, '')))
      .map((key) => {
        const url = ctx(key);
        const ext = (key.split('.').pop() || '').toLowerCase();
        const type = ext.startsWith('doc') ? 'doc' : ext === 'pdf' ? 'pdf' : 'image';
        return { name: toTitle(key), url, type };
      });
  } catch (e) {
    // Fallback if require.context is unavailable
    return [];
  }
}

// Load images from a product subfolder under src/document/product
function loadProductImages(subdir) {
  try {
    let ctx;
    if (subdir === 'esave') {
      ctx = require.context('./document/product/esave', true, /\.(png|jpe?g|svg)$/i);
    } else if (subdir === 'hanprismweb') {
      ctx = require.context('./document/product/hanprismweb', true, /\.(png|jpe?g|svg)$/i);
    } else if (subdir === 'erm') {
      ctx = require.context('./document/product/erm', true, /\.(png|jpe?g|svg)$/i);
    } else if (subdir === 'radtag') {
      ctx = require.context('./document/product/radtag', true, /\.(png|jpe?g|svg)$/i);
    } else if (subdir === 'peakgo') {
      ctx = require.context('./document/product/peakgo', true, /\.(png|jpe?g|svg)$/i);
    } else if (subdir === 'peakid') {
      ctx = require.context('./document/product/peakid', true, /\.(png|jpe?g|svg)$/i);
    } else {
      return [];
    }
    const items = ctx.keys().map((k) => {
      const url = ctx(k);
      const name = k.replace(/^\.\//, '');
      return { name, url };
    });
    return items;
  } catch (e) {
    return [];
  }
}

// Load HanPrism Web product images from local folder and group by topic
function loadHanprismWebImages() {
  try {
    const items = loadProductImages('hanprismweb');
    const includes = (s, kw) => s.toLowerCase().includes(kw.toLowerCase());
    const dashboard = items.filter(({ name }) => includes(name, 'dashboard'));
    const alert = items.filter(({ name }) => includes(name, 'alarm') || includes(name, 'alert'));
    const mimic = items.filter(({ name }) => includes(name, 'mimic'));
    // Sort dashboard as List -> View -> Edit
    const orderScore = (n) =>
      includes(n, 'list') ? 1 : includes(n, 'view') ? 2 : includes(n, 'edit') ? 3 : 9;
    dashboard.sort((a, b) => orderScore(a.name) - orderScore(b.name));
    return { dashboard, alert, mimic };
  } catch (e) {
    return { dashboard: [], alert: [], mimic: [] };
  }
}

function PDFThumbnail({ url, width = 320, height = 220, title }) {
  const canvasRef = useRef(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const { getDocument } = await import('pdfjs-dist/webpack');
        const loadingTask = getDocument(url);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min(width / viewport.width, height / viewport.height);
        const scaled = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        const context = canvas.getContext('2d');
        canvas.width = Math.floor(scaled.width);
        canvas.height = Math.floor(scaled.height);
        await page.render({ canvasContext: context, viewport: scaled }).promise;
        if (!cancelled) setFailed(false);
      } catch (err) {
        // Log to help diagnose issues in dev tools
        // eslint-disable-next-line no-console
        console.error('PDF thumbnail render failed for', url, err);
        if (!cancelled) setFailed(true);
      }
    }
    render();
    return () => {
      cancelled = true;
    };
  }, [url, width, height]);
  return failed ? (
    <div className="cert-placeholder" aria-label="PDF file">
      <span className="cert-badge">PDF</span>
    </div>
  ) : (
    <figure className="cert-figure" title={title}>
      <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
    </figure>
  );
}

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ko');
  const [i18nMap, setI18nMap] = useState(null);
  const fallbackI18n = {
    en: {
      portfolioSpotlight: 'Portfolio Spotlight',
      certificates: 'Certificates',
      productCaseStudies: 'Product Case Studies',
      resume: 'Resume',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      view: 'View',
      community: 'Community',
      profile: 'Profile',
      viewOnSO: 'View on Stack Overflow',
    },
    ko: {
      portfolioSpotlight: '포트폴리오 하이라이트',
      certificates: '자격증',
      productCaseStudies: '제품 사례 연구',
      resume: '이력서',
      email: '이메일',
      phone: '전화',
      address: '주소',
      view: '보기',
      community: '커뮤니티',
      profile: '프로필',
      viewOnSO: '스택 오버플로우에서 보기',
    },
  };
  const t = (key) => (i18nMap && i18nMap[key]) || (fallbackI18n[lang] && fallbackI18n[lang][key]) || fallbackI18n.en[key] || key;

  useEffect(() => {
    localStorage.setItem('lang', lang);
    const bust = process.env.REACT_APP_BUILD || Date.now();
    let cancelled = false;
    fetch(process.env.PUBLIC_URL + `/assets/i18n/${lang}.json?v=` + bust, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled) setI18nMap(json);
      })
      .catch(() => {
        if (!cancelled) setI18nMap(null);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);
  const [cvData, setCvData] = useState(null);
  
  const stackoverflowId = (profile && profile.stackoverflowId) || (() => { const url = (profile && profile.contact && profile.contact.stackoverflow) || ''; const m = url.match(/\/users\/(\d+)/); return m ? m[1] : null; })();
  const [productsData, setProductsData] = useState(null);
  useEffect(() => {
    let active = true;
    const bust = (process.env.REACT_APP_BUILD || Date.now());
    fetch(process.env.PUBLIC_URL + '/assets/cv.json?v=' + bust, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (active) setCvData(json);
      })
      .catch(() => {});
    fetch(process.env.PUBLIC_URL + '/assets/products.json?v=' + bust, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (active) setProductsData(json);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Override hero with provided resume summary and contacts
  const heroDefaults = {
    name: 'Nguyen Viet Hien',
    email: 'nguyenviethien@gmail.com',
    phone: '010-8683-1183',
    address: '대전 유성구 송강동',
    summary: [
      '저는 앱 개발 분야에서 19년 이상의 경험을 보유한 소프트웨어 개발자입니다. 하노이 공과대학교에서 정보기술(IT)을 전공(2001 - 2006)한 후 꾸준히 실무 경험을 쌓으며 최신 기술과 트렌드를 따라가고 있습니다. 뉴케어에서 과장으로 근무하며 라디에이션 탐지기 통신 소프트웨어와 데스크톱 및 웹 응용 프로그램을 개발하였고, .NET, WPF, C++, ASP.NET, MFC, SQLite, Java, MySQL, Python, Flask, React 등 다양한 기술을 활용한 경험이 있습니다.',
      '저는 문제 해결 능력과 새로운 기술 학습에 강점을 가지고 있으며, 미국, 호주, 싱가포르, 일본, 한국 등 해외 클라이언트 프로젝트를 통해 글로벌 협업 경험을 쌓았습니다. 또한 한국 IT 기업에서 약 7년간 근무하며 현지 개발 문화와 협업 방식을 익혔습니다. ChatGPT 이전에는 Stack Overflow에서 활발히 활동하여 상위 2% 명성을 얻었고, 현재는 ChatGPT를 활용해 새로운 기술을 빠르게 습득하고 업무 문제를 효율적으로 해결하고 있습니다.',
      '현재 한국에서 F5 영주권을 보유하고 있으며, 사회통합프로그램 최고 단계(6단계)를 수료하여 한국어로 생활 및 업무 의사소통이 가능합니다. 풍부한 개발 경험과 국제적 역량, 한국 근무 경력을 바탕으로 귀사에 빠르게 적응하고 효과적으로 기여할 수 있다고 자신합니다.'
    ]
  };
  const heroInfo = { ...heroDefaults, ...(cvData?.hero || {}) };

  // Load custom hero image
  let heroPhoto = null;
  try {
    heroPhoto = require('./document/hiencv.jpg');
  } catch (e) {
    heroPhoto = null;
  }

  const contactItems = [
    { label: t('email'), value: heroInfo.email, href: 'mailto:' + heroInfo.email },
    { label: t('phone'), value: heroInfo.phone, href: 'tel:' + heroInfo.phone.replace(/[^0-9+]/g, '') },
    { label: t('address'), value: heroInfo.address, href: 'https://maps.google.com/?q=' + encodeURIComponent(heroInfo.address) }
  ];

  // Product images from folder take priority; fall back to defaults
  const productImages = loadHanprismWebImages();
  const folderImages = (folder) => loadProductImages(folder).map((it) => ({ src: it.url, alt: it.name }));
  const displayCaseStudies = [];
  // const displayCaseStudies = caseStudies.map((cs) => {
  //   let imgs = [];
  //   // if (cs.id === 'dashboard-suite' && productImages.dashboard.length) {
  //   //   imgs = productImages.dashboard.map((it) => ({ src: it.url, alt: it.name }));
  //   // } else if (cs.id === 'alert-governance' && productImages.alert.length) {
  //   //   imgs = productImages.alert.map((it) => ({ src: it.url, alt: it.name }));
  //   // } else if (cs.id === 'mimic-builder' && productImages.mimic.length) {
  //   //   imgs = productImages.mimic.map((it) => ({ src: it.url, alt: it.name }));
  //   // }
  //   return { ...cs, images: imgs.length ? imgs : cs.images };
  // });

  return (
    <div className="app">
      <header className="hero">
        <div className="lang-switch">
          <label htmlFor="lang" className="sr-only">Language</label>
          <select id="lang" className="lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en">English</option>
            <option value="ko">한국어</option>
          </select>
        </div>
        <div className="hero__content">
          <div className="hero__top">
            {heroPhoto && (
              <img className="hero__photo" src={heroPhoto} alt={heroInfo.name} />
            )}
            <div>
              <div className="hero__eyebrow">{t('portfolioSpotlight')}</div>
          <h1 className="hero__headline">{heroInfo.name}</h1>
          <p className="hero__subheadline">{heroInfo.title || 'Senior Software Researcher'}</p>
          <p className="hero__location">{heroInfo.address}</p>
            </div>
          </div>
          <div className="hero__summary">
            {heroInfo.summary.map((line) => (
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
      </header>

      <main>
        <ResumeSection t={t} resumeData={cvData?.resume || null} />
        {/* Portfolio gallery removed */}

        <section className="section">
          <h2>{t('certificates')}</h2>
          <div className="grid cert-grid">
            {loadCertificates().map((item) => (
              <article key={item.url} className="cert-card">
                <header className="cert-header">
                  <h3 className="cert-title">{item.name}</h3>
                </header>
                {item.type === 'image' ? (
                  <figure className="cert-figure">
                    <img className="cert-thumb" src={item.url} alt={item.name} loading="lazy" />
                  </figure>
                ) : item.type === 'pdf' ? (
                  <PDFThumbnail url={item.url} title={item.name} />
                ) : (
                  <div className="cert-placeholder" aria-label={item.type.toUpperCase() + ' file'}>
                    <span className="cert-badge">{item.type.toUpperCase()}</span>
                  </div>
                )}
                <div className="cert-actions">
                  <a className="pill" href={item.url} target="_blank" rel="noreferrer">
                    <span className="pill__value">{t('view')}</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>{t('productCaseStudies')}</h2>
          <div className="grid case-grid">
            {[
              ...displayCaseStudies
                .filter((cs) => cs.product?.toLowerCase().includes('hanprism'))
                .slice(0, 1),
              ...((productsData?.rows || [])
                .map((row) => {
                  const imgs = row.folder ? folderImages(row.folder) : [];
                  if (!imgs.length) return null;
                  return {
                    id: row.id,
                    product: row.product,
                    title: row.title || row.product,
                    description: row.description || '',
                    images: imgs,
                    screens: row.screens || [],
                    tone: row.tone || 'blue'
                  };
                })
                .filter(Boolean))
            ].map((caseStudy) => (
              <CaseCard key={caseStudy.id} caseStudy={caseStudy} />
            ))}
          </div>
        </section>

        {/* Community section moved to the end */}
        {!!stackoverflowId && (
          <StackOverflowSection t={t} userId={stackoverflowId} />
        )}
      </main>

      <footer className="footer">
        <nav className="footer-socials">
          {[
            {
              key: 'stackoverflow',
              href: profile.contact.stackoverflow || (profile.stackoverflowId ? `https://stackoverflow.com/users/${profile.stackoverflowId}` : null),
              label: 'Stack Overflow',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.5 21v-6h2v8h-16v-8h2v6h12zM8.6 13.6l.4-1.9 8.8 1.9-.4 2-8.8-2zM10 9.3l.8-1.8 8.1 3.7-.8 1.8L10 9.3zm2.6-4.3l1.3-1.5 6.7 5.8-1.3 1.5-6.7-5.8zM8 17h8v2H8v-2zm.2-3.8l9.2.9-.2 2-9.2-1 .2-1.9z"/>
                </svg>
              )
            },
            {
              key: 'linkedin',
              href: profile.contact.linkedin,
              label: 'LinkedIn',
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5zM3 9h4v12H3zM10 9h3.8v1.64h.05c.53-.95 1.84-1.95 3.79-1.95 4.05 0 4.8 2.66 4.8 6.12V21h-4v-5.33c0-1.27-.02-2.9-1.77-2.9-1.78 0-2.05 1.38-2.05 2.8V21h-4z"/>
                </svg>
              )
            },
            {
              key: 'github',
              href: profile.contact.github,
              label: 'Github',
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.77.6-3.36-1.17-3.36-1.17-.46-1.17-1.12-1.48-1.12-1.48-.92-.63.07-.62.07-.62 1.02.07 1.55 1.05 1.55 1.05.9 1.54 2.36 1.09 2.94.83.09-.66.35-1.1.63-1.35-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.7.12 2.5.35 1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.86v2.76c0 .26.18.58.69.48A10 10 0 0 0 12 2z"/>
                </svg>
              )
            }
          ]
            .filter((s) => !!s.href)
            .map((s) => (
              <a key={s.key} className="social" href={s.href} target="_blank" rel="noreferrer">
                <span className="social__icon">{s.icon}</span>
                <span className="social__label">{s.label}</span>
              </a>
            ))}
        </nav>
      </footer>
    </div>
  );
}

// PortfolioGallery and PDF-based thumbnails removed to avoid requiring local PDF file

function ResumeSection({ t, resumeData }) {
  const [data, setData] = useState(resumeData || null);
  useEffect(() => {
    if (resumeData) {
      setData(resumeData);
      return;
    }
    let active = true;
    const bust = (process.env.REACT_APP_BUILD || Date.now());
    fetch(process.env.PUBLIC_URL + '/assets/resume.json?v=' + bust, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (active) setData(json);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [resumeData]);
  if (!data) return null;
  const { experiences = [], skills = [], education = [] } = data;
  return (
    <section className="section">
      <h2>{t ? t('resume') : 'Resume'}</h2>
      {/* Contact block under Resume removed as requested */}
      {education?.length > 0 && (
        <div className="skills-column" style={{ marginBottom: 24 }}>
          <h3>Education</h3>
          <ul>
            {education.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Summary removed as requested */}
      {experiences?.length > 0 && (
        <div className="timeline" style={{ marginTop: 24 }}>
          {experiences.map((ex, i) => (
            <article key={(ex.company || ex.title || 'exp') + i} className="timeline__item">
              <header className="timeline__header">
                <span className="timeline__period">{ex.period}</span>
                <div>
                  <h3>{ex.title}</h3>
                  {ex.company && <p className="timeline__company">{ex.company}</p>}
                </div>
              </header>
              {ex.highlights?.length > 0 && (
                <ul className="timeline__highlights">
                  {ex.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
      {skills?.length > 0 && (() => {
        const normalizeSkills = (list) => {
          const arr = Array.isArray(list) ? list.slice() : [];
          const set = new Set(arr.map((s) => String(s)));
          const used = new Set();
          const out = [];
          const addCombined = (members, label) => {
            if (members.some((m) => set.has(m))) {
              members.forEach((m) => used.add(m));
              if (!out.includes(label)) out.push(label);
            }
          };
          addCombined(['Spring Boot', 'Spring MVC'], 'Spring Boot/Spring MVC');
          addCombined(['JavaScript', 'TypeScript'], 'JavaScript/TypeScript');
          addCombined(['HTML5', 'CSS3'], 'HTML5/CSS3');
          addCombined(['MySQL', 'MariaDB', 'SQL Server'], 'MySQL/MariaDB/SQL Server');
          arr.forEach((item) => {
            if (!used.has(item) && !out.includes(item)) out.push(item);
          });
          // Ensure jQuery appears right after JavaScript/TypeScript
          const jsIdx = out.indexOf('JavaScript/TypeScript');
          const jqIdx = out.indexOf('jQuery');
          if (jsIdx !== -1 && jqIdx !== -1 && jqIdx !== jsIdx + 1) {
            out.splice(jqIdx, 1);
            out.splice(jsIdx + 1, 0, 'jQuery');
          }
          return out;
        };
        const groupSkills = (list) => {
          const res = { desktop: [], web: [], embedded: [], tools: [] };
          list.forEach((item) => {
            const s = String(item).toLowerCase();
            // Tools first
            if (
              s === 'tomcat' ||
              s === 'git' ||
              s === 'svn' ||
              s.includes('visual studio code') ||
              s.includes('visual code') ||
              s.includes('visual studio 2022') ||
              s.includes('visual studio') ||
              s.includes('eclipse') ||
              s.includes('qt creator') ||
              s.includes('stm32cube')
            ) {
              res.tools.push(item);
            } else if (
              s.includes('buildroot') ||
              s.includes('embedded') ||
              s.includes('stm32') ||
              s.includes('usb hid') ||
              s.includes('serial') ||
              s.includes('socket') ||
              (s.includes('qt') && !s.includes('qt creator'))
            ) {
              res.embedded.push(item);
            } else if (
              s.includes('asp.net') ||
              s.includes('web api') ||
              s.includes('spring') ||
              s.includes('mybatis') ||
              s.includes('typescript') ||
              s.includes('angular') ||
              s.includes('react') ||
              s.includes('javascript') ||
              s.includes('jquery') ||
              s.includes('html5') ||
              s.includes('css3') ||
              s.includes('mysql') ||
              s.includes('mariadb') ||
              s.includes('sql server') ||
              s.includes('flask') ||
              s.includes('python') ||
              s.includes('highcharts') ||
              s.includes('signalr') ||
              s.includes('entity framework')
            ) {
              res.web.push(item);
            } else if (
              s.includes('.net') ||
              s.includes('c#') ||
              s.includes('wpf') ||
              s.includes('mfc') ||
              s.includes('c++') ||
              s.includes('sqlite') ||
              s.includes('devexpress')
            ) {
              res.desktop.push(item);
            } else {
              res.web.push(item);
            }
          });
          // Ensure priority tools appear first
          const priorityTools = [
            'visual studio 2022',
            'visual studio code',
            'visual code',
            'eclipse',
            'qt creator',
            'stm32cube'
          ];
          res.tools.sort((a, b) => {
            const an = String(a).toLowerCase();
            const bn = String(b).toLowerCase();
            const ai = priorityTools.indexOf(an);
            const bi = priorityTools.indexOf(bn);
            const ap = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
            const bp = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
            if (ap !== bp) return ap - bp;
            return String(a).localeCompare(String(b));
          });
          return res;
        };
        const normalized = normalizeSkills(skills);
        const { desktop, web, embedded, tools } = groupSkills(normalized);
        return (
          <div className="grid skills-grid" style={{ marginTop: 24 }}>
            <SkillColumn title="Desktop" items={desktop} />
            <SkillColumn title="Web" items={web} />
            <SkillColumn title="Embedded" items={embedded} />
            <SkillColumn title="Tools" items={tools} />
          </div>
        );
      })()}
    </section>
  );
}

function SkillColumn({ title, items }) {
  if (!items || items.length === 0) return null;
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
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const overlayRef = useRef(null);
  const total = caseStudy.images?.length || 0;
  const safeIdx = ((idx % total) + total) % total;
  const go = (d) => setIdx((v) => v + d);
  const current = total ? caseStudy.images[safeIdx] : null;
  const caption = current
    ? current.alt || (typeof current.src === 'string' ? current.src.split('/').pop().replace(/\.[^.]+$/, '') : '')
    : '';
  useEffect(() => {
    if (!zoom) return;
    function onKey(e) {
      if (e.key === 'Escape') setZoom(false);
      else if (e.key === 'ArrowLeft') setIdx((v) => v - 1);
      else if (e.key === 'ArrowRight') setIdx((v) => v + 1);
    }
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const el = overlayRef.current;
    if (el && el.requestFullscreen) {
      try { el.requestFullscreen(); } catch (e) {}
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (document.fullscreenElement && document.exitFullscreen) {
        try { document.exitFullscreen(); } catch (e) {}
      }
    };
  }, [zoom]);
  return (
    <article className={'case-card case-card--' + caseStudy.tone}>
      <header>
        <span className="case-card__product">{caseStudy.product}</span>
        <h3>{caseStudy.title}</h3>
        <p>{caseStudy.description}</p>
      </header>
      {!!total && (
        <div className="case-card__preview">
          <div className="slideshow">
            <div className="slideshow__frame">
              <img src={current.src} alt={current.alt} loading="lazy" onClick={() => setZoom(true)} />
            </div>
            <div className="slideshow__nav">
              <button className="slideshow__btn" aria-label="Previous" onClick={() => go(-1)}>
                ‹
              </button>
              <button className="slideshow__btn" aria-label="Next" onClick={() => go(1)}>
                ›
              </button>
            </div>
          </div>
          <div className="slideshow__dots">
            {caseStudy.images.map((_, i) => (
              <span
                key={i}
                className={'slideshow__dot' + (i === safeIdx ? ' slideshow__dot--active' : '')}
                onClick={() => setIdx(i)}
              />
            ))}
          </div>
          {caption && <div className="slideshow__caption">{caption}</div>}
        </div>
      )}
      {/* Removed screen chips under the card as requested */}
      {zoom && (
        <div className="lightbox" ref={overlayRef} onClick={() => setZoom(false)}>
          <button
            className="slideshow__btn lightbox__btn lightbox__btn--prev"
            aria-label="Previous"
            onClick={(e) => { e.stopPropagation(); setIdx((v) => v - 1); }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <img
            src={current?.src}
            alt={current?.alt || ''}
            onClick={(e) => e.stopPropagation()}
          />
          {caption && (
            <div className="lightbox__caption" onClick={(e) => e.stopPropagation()}>
              {caption}
            </div>
          )}
          <button
            className="slideshow__btn lightbox__btn lightbox__btn--next"
            aria-label="Next"
            onClick={(e) => { e.stopPropagation(); setIdx((v) => v + 1); }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="lightbox__close"
            aria-label="Close"
            onClick={(e) => { e.stopPropagation(); setZoom(false); }}
          >×</button>
        </div>
      )}
    </article>
  );
}

export default App;

// --- Stack Overflow integration ---
function StackOverflowSection({ userId, t }) {
  // Show only a local image, auto-detecting common names or any image in
  // src/document (and its community/ subfolder) so you can drop a file in.
  let img = null;
  try {
    const ctx = require.context('./document', true, /\.(png|jpe?g|svg)$/i);
    const keys = ctx.keys();
    const prefer = keys.find((k) => /(^\.\/community\/|community|stack\s*-?\s*overflow|so[-_]?profile)/i.test(k));
    const key = prefer || keys[0];
    if (key) img = ctx(key);
  } catch (e) {
    img = null;
  }

  if (!img) return null; // hide section if image not provided yet

  return (
    <section className="section">
      <div className="section-head">
        <h2>{t ? t('community') : 'Community'}</h2>
        <a
          className="pill"
          href={`https://stackoverflow.com/users/${userId}`}
          target="_blank"
          rel="noreferrer"
        >
          <span className="pill__label">{t ? t('profile') : 'Profile'}</span>
          <span className="pill__value">{t ? t('viewOnSO') : 'View on Stack Overflow'}</span>
        </a>
      </div>
      <figure className="community-figure">
        <img className="community-img" src={img} alt="Community" loading="lazy" />
      </figure>
    </section>
  );
}



