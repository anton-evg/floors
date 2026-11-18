import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/manrope/index.css';
import blocks, { benefits, damage, dialogs, prices, priceNotes } from './content';
import { Carousel, Icon, ImageCompare, Overlay, Questions } from './components';
import './site.css';

const estimate = 'Оценить стоимость восстановления';
const callback = 'Обратный звонок';
const calculation = 'Получить предварительный расчёт';
const demo = 'Обсудить демонстрационную работу';
const consent = 'согласие на обработку персональных данных';
const policy = 'Политика конфиденциальности';
const worksTitle = 'Результаты восстановления каменных полов';
const nav = [['Услуги', '#services'], ['Наши работы', '#works'], ['Контакты', '#contacts']];
const works = [
  { image: 'rosette.webp', alt: 'Каменный пол с геометрической розеткой' },
  { image: 'after.webp', alt: 'Восстановленный каменный пол коридора', video: 'corridor.mp4' },
  { image: 'work-light-hall.webp', alt: 'Светлый каменный пол в зале' },
  { image: 'work-bordered-corridor.webp', alt: 'Каменный пол с тёмной окантовкой' },
  { image: 'work-mosaic-wide.webp', alt: 'Общий вид каменного пола с квадратной мозаикой' },
  { image: 'work-rose-stone.webp', alt: 'Пол из розоватых каменных плит' },
  { image: 'work-mosaic-center.webp', alt: 'Каменный пол с мозаичной вставкой в центре кадра' },
  { image: 'work-mosaic-side.webp', alt: 'Каменный пол с мозаичной вставкой и отражением окон' },
];

function Copy({ text }) {
  return text?.split(/(<b>.*?<\/b>)/g).map((part, i) =>
    part.startsWith('<b>') ? <strong key={i}>{part.slice(3, -4)}</strong> : part
  );
}

function SectionHeading({ data, titleId }) {
  return <div className="section-heading">
    <h2 id={titleId}>{data.title}</h2>
    {data.paragraphs[0] && ![blocks[7], blocks[9], blocks[10]].includes(data) && <p><Copy text={data.paragraphs[0]} /></p>}
  </div>;
}

function DetailRows({ entries }) {
  return <ul className="detail-rows">
    {entries.map(({ title, text }) => <li key={title}><h3>{title}</h3><p><Copy text={text} /></p></li>)}
  </ul>;
}

function SocialIcons() {
  return <div className="socials">
    {['Telegram', 'MAX'].map(label => <img key={label} src={'/icons/' + label.toLowerCase() + '.svg'} width="23" height="23" alt={label} />)}
  </div>;
}

function Form({ isCallback = false }) {
  const [status, setStatus] = useState('');
  const phone = useRef(null);
  function submit(event) {
    event.preventDefault();
    if (phone.current.value.replace(/\D/g, '').length < 10) {
      setStatus('Проверьте номер телефона');
      phone.current.focus();
      return;
    }
    setStatus('Не удалось отправить заявку. Попробуйте ещё раз или напишите нам в Telegram или MAX.');
  }
  return <form className="form" onSubmit={submit}>
    <div className={'form-fields ' + (isCallback ? 'callback-fields' : '')}>
      <label>Телефон<input ref={phone} type="tel" name="phone" autoComplete="tel" required onChange={() => setStatus('')} /></label>
      {!isCallback && <label>Имя<input type="text" name="name" autoComplete="given-name" /></label>}
    </div>
    {!isCallback && <label>Комментарий<textarea name="comment" rows="3" /></label>}
    <label className="consent">
      <input type="checkbox" name="consent" required />
      <span>Даю <a href="/personal-data-consent.html" target="_blank" rel="noopener">{consent}</a> и ознакомлен(а) с{' '}
        <a href="/personal-data-policy.html" target="_blank" rel="noopener">Политикой обработки персональных данных</a>
      </span>
    </label>
    <button type="submit" className="button button-solid">Отправить заявку</button>
    {status && <p className="form-status" role="status">{status}</p>}
    <div className="form-socials"><span>Или напишите в:</span><SocialIcons /></div>
  </form>;
}

function Header({ open }) {
  const [menuOpen, setMenu] = useState(false);
  const menuButton = useRef(null);
  return <header className="header">
    <div className="wrap header-inner">
      <a className="brand" href="#top"><span className="brand-mark"><Icon name="cube" size={24} /></span><span>[Название компании]</span></a>
      <nav id="site-nav" className={menuOpen ? 'nav nav-open' : 'nav'} aria-label="Основная навигация">
        {nav.map(([label, href]) => <a key={href} href={href} onClick={() => setMenu(false)}>{label}</a>)}
        <button type="button" className="button button-outline nav-callback" onClick={() => { setMenu(false); open(callback, menuButton.current); }}>{callback}</button>
        <div className="nav-socials"><SocialIcons /></div>
      </nav>
      <div className="header-actions">
        <span>Москва и Московская область</span>
        <SocialIcons />
        <button type="button" className="button button-outline" onClick={event => open(callback, event.currentTarget)}>{callback}</button>
      </div>
      <button ref={menuButton} type="button" className="icon-button nav-toggle" aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'} aria-controls="site-nav" aria-expanded={menuOpen}
        onClick={() => setMenu(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
    </div>
  </header>;
}

function CookieNotice() {
  const [accepted, setAccepted] = useState(() => localStorage.getItem('stone-care-cookie') === 'accepted');
  if (accepted) return null;
  return <aside className="cookie">
    <p>Мы используем файлы cookie для работы сайта.</p>
    <button type="button" className="button button-solid" onClick={() => { localStorage.setItem('stone-care-cookie', 'accepted'); setAccepted(true); }}>Принять</button>
  </aside>;
}

function App() {
  const main = useRef(null);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const container = main.current;
    const targets = container.querySelectorAll(
      '.section > .wrap, :is(.service-section, .pricing-section) .detail-rows > li, .pricing-section .prices > div'
    );
    const observer = new IntersectionObserver(entries => {
      for (const { isIntersecting, target } of entries) {
        if (!isIntersecting) continue;
        observer.unobserve(target);
        (target.matches('.wrap') ? target.parentElement : target).classList.add('in-view');
      }
    }, { rootMargin: '0px 0px 16px 0px' });

    container.classList.add('scroll-motion');
    targets.forEach(target => observer.observe(target));
    return () => {
      observer.disconnect();
      container.classList.remove('scroll-motion');
    };
  }, []);
  const [active, setActive] = useState(null);
  const trigger = useRef(null);
  function open(label, element) {
    trigger.current = element;
    setActive({ label });
  }
  function showWork(work, event) {
    trigger.current = event.currentTarget;
    setActive({ work });
  }
  const currentDialog = active?.label && dialogs[active.label];
  const currentWork = active?.work;
  const cta = (label, style = 'solid') => <button className={'button button-' + style} type="button" onClick={event => open(label, event.currentTarget)}>{label}</button>;

  return <div id="top">
    <Header open={open} />
    <main ref={main}>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1 className="hero-title">{blocks[1].offer}</h1>
            <p className="hero-intro"><Copy text={blocks[1].paragraphs[0]} /></p>
            <ul className="benefits">{benefits.map(value => <li key={value}><Icon name="check" size={21} />{value}</li>)}</ul>
            {cta(estimate)}
            <p className="hero-note">{blocks[1].paragraphs[1]}</p>
          </div>
          <ImageCompare />
        </div>
      </section>

      <section className="section work-section" id="works">
        <div className="wrap">
          <h2 id="works-title">{worksTitle}</h2>
          <Carousel label={worksTitle} kind="work-rail">
            {works.map((work, index) => <button className="work-item" key={work.image} type="button"
              style={{ '--order': index }}
              aria-label={work.video ? 'Воспроизвести видео коридора' : 'Открыть фото. ' + work.alt} onClick={event => showWork(work, event)}>
              <img src={'/media/' + work.image} alt={work.alt} loading="lazy" />
              <span className="work-icon"><Icon name={work.video ? 'video' : 'plus'} size={22} /></span>
            </button>)}
          </Carousel>
        </div>
      </section>

      <section className="section demo-section" id="demo">
        <div className="wrap demo-grid">
          <div>
            <SectionHeading data={blocks[3]} />
            <div className="demo-actions">{cta(demo)}{cta(estimate, 'outline')}</div>
            <p className="small-note">{blocks[3].paragraphs[1]}</p>
          </div>
          <figure className="demo-photo">
            <img src="/media/gloss-meter.webp" alt="Блескомер на поверхности каменного пола" loading="lazy" />
          </figure>
        </div>
      </section>

      <section className="section damage-section" id="damage">
        <div className="wrap damage-grid">
          <h2>{damage.title}</h2>
          <ul>{damage.items.map(value => <li key={value}><Icon name="check" size={16} />{value}</li>)}</ul>
        </div>
      </section>

      <section className="section service-section" id="services">
        <div className="wrap editorial-grid">
          <SectionHeading data={blocks[4]} />
          <DetailRows entries={blocks[4].entries} />
        </div>
      </section>

      <section className="section pricing-section" id="pricing">
        <div className="wrap">
          <SectionHeading data={blocks[5]} />
          <div className="pricing-grid">
            <div className="price-sheet">
              <h3>Стоимость и виды работ</h3>
              <dl className="prices">{prices.map(([name, price, detail], index) => <div key={name} style={{ '--row-delay': `${index * 105}ms` }}>
                <dt>{name}{detail && <small>{detail}</small>}</dt><dd>{price}</dd>
              </div>)}</dl>
              {priceNotes.map(note => <p className="small-note" key={note}>{note}</p>)}
            </div>
            <div className="pricing-notes">
              <DetailRows entries={blocks[5].entries} />
              <p>{blocks[5].paragraphs[5]}</p>
              <p className="small-note">{blocks[5].paragraphs[6]}</p>
              {cta(calculation)}
            </div>
          </div>
        </div>
      </section>

      <section className="section audience-section" id="audience">
        <div className="wrap">
          <SectionHeading data={blocks[6]} />
          <DetailRows entries={blocks[6].entries} />
        </div>
      </section>

      <section className="section process-section" id="process">
        <div className="wrap editorial-grid">
          <SectionHeading data={blocks[7]} />
          <ol className="process-list">{blocks[7].entries.map(({ title, text }, index) => <li key={title} style={{ '--order': index }}>
            <h3>{title}</h3><p>{text}</p>
          </li>)}</ol>
        </div>
      </section>

      <section className="section care-section" id="care">
        <div className="wrap editorial-grid">
          <SectionHeading data={blocks[8]} />
          <DetailRows entries={blocks[8].entries} />
        </div>
      </section>

      <section className="section trust-section" id="reviews">
        <div className="wrap">
          <SectionHeading data={blocks[9]} />
          <h3 className="trust-label">{blocks[9].entries[0].title}</h3>
          <Carousel label={blocks[9].entries[0].title} kind="review-rail">
            {[0, 1, 2].map(index => <article className="review-placeholder" key={index}>
              <div className="review-images" aria-hidden="true"><span /><span /><span /></div>
              <p>[Имя автора]</p>
              <p>[Точный текст отзыва заказчика о выполненных работах, организации процесса и результате восстановления каменного покрытия]</p>
            </article>)}
          </Carousel>
          <h3 className="trust-label">{blocks[9].entries[1].title}</h3>
          <Carousel label={blocks[9].entries[1].title} kind="document-rail">
            {['Благодарственное письмо', 'Сертификат', 'Диплом или награда'].map(value => <div className="document-item" key={value}><Icon name="paper" size={24} />{value}</div>)}
          </Carousel>
        </div>
      </section>

      <section className="section faq-section" id="faq">
        <div className="wrap editorial-grid">
          <SectionHeading data={blocks[10]} />
          <Questions entries={blocks[10].entries} />
        </div>
      </section>

      <section className="section contact-section" id="contacts">
        <div className="wrap editorial-grid">
          <div><SectionHeading data={blocks[11]} /><p className="small-note">{blocks[11].paragraphs[1]}</p></div>
          <Form />
        </div>
      </section>
    </main>
    <footer className="footer">
      <div className="wrap footer-inner">
        <div><a className="brand" href="#top">[Название компании]</a><p>Восстановление и уход за каменными полами. Москва и Московская область.</p></div>
        <nav aria-label="Навигация внизу страницы">{nav.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
        <SocialIcons />
        <div className="footer-legal"><span>{policy}</span><span>Согласие на обработку персональных данных</span></div>
      </div>
    </footer>
    <CookieNotice />
    <Overlay open={Boolean(active)} onOpenChange={value => { if (!value) setActive(null); }}
      returnFocus={trigger} photo={Boolean(currentWork)} title={currentWork?.alt || currentDialog?.title || ''}
      description={currentDialog?.description}>
      {currentDialog && <Form key={active.label} isCallback={active.label === callback} />}
      {currentWork?.video && <video src={'/media/' + currentWork.video} poster={'/media/' + currentWork.image}
        controls playsInline autoPlay aria-label={currentWork.alt} />}
      {currentWork && !currentWork.video && <img src={'/media/' + currentWork.image} alt={currentWork.alt} />}
    </Overlay>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
