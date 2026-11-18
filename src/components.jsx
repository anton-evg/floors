import React, { useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Accordion from '@radix-ui/react-accordion';

export function Icon({ name, size = 20 }) {
  const paths = {
    next: 'M4 12h15m-6-6 6 6-6 6',
    back: 'M20 12H5m6-6-6 6 6 6',
    compare: 'm8 7-5 5 5 5m8-10 5 5-5 5M3 12h18',
    check: 'm5 12 4 4L19 6',
    plus: 'M12 5v14M5 12h14',
    close: 'm6 6 12 12M18 6 6 18',
    menu: 'M3 8h18M3 16h18',
    image: 'M3 5h18v14H3zM3 16l5-4 4 3 4-5 5 6',
    video: 'm9 5 11 7-11 7z',
    paper: 'M6 3h8l4 4v14H6zM14 3v5h4M9 12h6m-6 4h6',
    cube: 'm12 2 9 5v10l-9 5-9-5V7l9-5Zm0 10 9-5m-9 5L3 7m9 5v10',
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={paths[name]} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

// Mizu Image Compare, adapted from the MIT-licensed entry on 21st.dev.
export function ImageCompare() {
  const [value, setValue] = useState(53);
  const field = useRef(null);
  function update(event) {
    const { width, left } = event.currentTarget.getBoundingClientRect();
    if (width) setValue(Math.max(0, Math.min(100, Math.round((event.clientX - left) / width * 100))));
  }
  return <figure className="compare">
    <div className="compare-stage" style={{ '--reveal': value + '%' }}
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        if (event.pointerType === 'mouse') field.current.focus({ preventScroll: true });
        update(event);
      }}
      onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) update(event); }}>
      <img src="/media/hero-after.webp" alt="Каменный пол коридора после восстановления" fetchPriority="high" draggable="false" />
      <img className="compare-before" src="/media/before.webp" alt="Тёмные загрязнения на каменных плитах до восстановления" fetchPriority="high" draggable="false" />
      <span className="compare-label">До</span><span className="compare-label after-label">После</span>
      <span className="compare-divider" aria-hidden="true"><span><Icon name="compare" size={23} /></span></span>
      <input ref={field} className="compare-range" type="range" min="0" max="100" value={value}
        onChange={event => setValue(Number(event.target.value))} onPointerDown={event => event.stopPropagation()}
        aria-label="Сравнить фотографии до и после" aria-valuetext={value + '% до'} />
    </div>
  </figure>;
}

// The shadcn Carousel on 21st.dev uses this same Embla scroll and key navigation pattern.
export function Carousel({ label, kind, children }) {
  const [viewport, api] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps' });
  const [selection, setSelection] = useState({ index: 0, count: 0, prev: false, next: false });
  useEffect(() => {
    if (!api) return;
    function sync() {
      setSelection({ index: api.selectedScrollSnap(), count: api.scrollSnapList().length, prev: api.canScrollPrev(), next: api.canScrollNext() });
    }
    sync();
    api.on('select', sync).on('reInit', sync);
    return () => { api.off('select', sync).off('reInit', sync); };
  }, [api]);
  const instant = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function move(previous) {
    if (previous) api?.scrollPrev(instant());
    else api?.scrollNext(instant());
  }
  return <div className={'carousel ' + kind} role="region" aria-label={label}>
    <div className="carousel-viewport" ref={viewport}>
      <div className="carousel-track">{React.Children.map(children, child => <div className="carousel-slide">{child}</div>)}</div>
    </div>
    {selection.count > 1 && <div className="rail-controls">
      <div className="rail-progress" aria-hidden="true"><span style={{ width: (selection.index + 1) / selection.count * 100 + '%' }} /></div>
      <div className="arrow-group">
        <button type="button" className="icon-button" disabled={!selection.prev} onClick={() => move(true)} aria-label="Предыдущий слайд"><Icon name="back" /></button>
        <button type="button" className="icon-button" disabled={!selection.next} onClick={() => move(false)} aria-label="Следующий слайд"><Icon name="next" /></button>
      </div>
    </div>}
  </div>;
}

// Animated Line Accordion from ShadcnSpace on 21st.dev, with the Radix primitive.
export function Questions({ entries }) {
  return <Accordion.Root type="single" collapsible className="questions">
    {entries.map(({ title, text }, index) => <Accordion.Item className="question" key={title} value={String(index)}>
      <Accordion.Header><Accordion.Trigger>
        {title}<span className="question-mark"><Icon name="plus" /></span>
      </Accordion.Trigger></Accordion.Header>
      <Accordion.Content className="answer"><p>{text}</p></Accordion.Content>
    </Accordion.Item>)}
  </Accordion.Root>;
}

export function Overlay({ open, onOpenChange, title, description, photo = false, returnFocus, children }) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="dialog-backdrop" />
      <Dialog.Content className={'dialog ' + (photo ? 'photo-dialog' : '')} {...(!description ? { 'aria-describedby': undefined } : {})}
        onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus(); }}>
        <Dialog.Title className={photo ? 'sr-only' : undefined}>{title}</Dialog.Title>
        {description && <Dialog.Description>{description}</Dialog.Description>}
        <Dialog.Close className="icon-button dialog-close" aria-label="Закрыть"><Icon name="close" /></Dialog.Close>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
