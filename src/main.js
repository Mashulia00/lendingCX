(() => {
  if (!document.getElementById('preloader-css')) {
    const css = `
      #preloader{position:fixed;inset:0;background:radial-gradient(1200px 700px at 80% -10%,#111629,transparent 55%),radial-gradient(900px 600px at -10% 20%,#0b0f1a,transparent 60%),#070a10;z-index:9999;display:grid;place-items:center;opacity:1;visibility:visible;transition:opacity .4s ease,visibility .4s ease}
      body.loaded #preloader{opacity:0;visibility:hidden;pointer-events:none}
      #preloader .loader-content{position:relative;width:min(560px,86vw);padding:28px 24px 22px;border-radius:18px;background:linear-gradient(160deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.14);box-shadow:0 10px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.08);overflow:hidden}
      #preloader .loader-content::before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1px;background:linear-gradient(140deg,rgba(213,180,110,.55),rgba(255,255,255,.05),rgba(213,180,110,.2));-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
      #preloader .scanlines{position:absolute;inset:0;background:repeating-linear-gradient(to bottom,rgba(0,0,0,.00) 0,rgba(0,0,0,.00) 8px,rgba(0,0,0,.06) 8px,rgba(0,0,0,.06) 9px);opacity:.55;mix-blend-mode:overlay;animation:sl 6s linear infinite}
      @keyframes sl{0%{transform:translateY(0)}100%{transform:translateY(9px)}}
      #preloader .neon-text{font:800 18px/1.1 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Inter,Roboto,Arial;color:#f6e3b4;letter-spacing:.28em;text-align:center;margin-bottom:14px;filter:drop-shadow(0 0 10px rgba(246,227,180,.35))}
      #preloader .loading-bar{height:12px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);overflow:hidden}
      #preloader .loading-bar .bar{height:100%;width:0%;border-radius:inherit;background:linear-gradient(90deg,#d5b46e,#f6e3b4);box-shadow:0 0 18px rgba(246,227,180,.35)}
      #preloader .pct{margin-top:10px;text-align:center;color:#d9dee8;font-weight:700;font-variant-numeric:tabular-nums}
      #preloader .matrix{position:absolute;inset:-12px;display:grid;grid-template-columns:repeat(6,1fr);gap:12px;opacity:.12}
      #preloader .matrix span{height:44px;border-radius:12px;background:linear-gradient(180deg,rgba(246,227,180,.25),rgba(213,180,110,.05));filter:blur(1px)}
    `.replace(/\s+/g,' ');
    const style = document.createElement('style');
    style.id = 'preloader-css';
    style.textContent = css;
    document.head.appendChild(style);
  }

  if (!document.getElementById('preloader')) {
    const box = document.createElement('div');
    box.id = 'preloader';
    box.innerHTML = `
      <div class="loader-content">
        <div class="scanlines"></div>
        <div class="neon-text">LOADING</div>
        <div class="loading-bar"><div class="bar"></div></div>
        <div class="pct">0%</div>
        <div class="matrix"><span></span><span></span><span></span><span></span><span></span><span></span></div>
      </div>
    `;
    document.body.prepend(box);
  }

  const minMs = 3000, maxMs = 5000;               
  const pre = document.getElementById('preloader');
  const bar = pre.querySelector('.bar');
  const pct = pre.querySelector('.pct');

  const images = Array.from(document.images || []);
  const totalImgs = images.length || 1;
  let loadedImgs = images.filter(i => i.complete).length;
  images.forEach(img => {
    if (!img.complete) {
      const onAny = () => { loadedImgs++; };
      img.addEventListener('load', onAny, { once: true });
      img.addEventListener('error', onAny, { once: true });
    }
  });

  let fontsReady = false;
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => fontsReady = true);
  } else { fontsReady = true; }

  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const started = performance.now();
  let shown = 0, finished = false;

  const calcRealProgress = () => {
    const imgPart = (loadedImgs / totalImgs) * 70; 
    const fontPart = fontsReady ? 20 : 0;          
    return clamp(imgPart + fontPart, 0, 90);       
  };

  const raf = (t) => {
    if (finished) return;
    const elapsed = t - started;
    const timeGate = clamp((elapsed / minMs) * 85, 0, 85);  
    const real = calcRealProgress();
    const target = Math.max(timeGate, real);
    shown = Math.max(shown, target);
    bar.style.width = shown + '%';
    pct.textContent = Math.round(shown) + '%';
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  const ready = () => new Promise(res => {
    let hits = 0; const done = () => (++hits >= 2) && res();
    (document.readyState === 'complete') ? done() : window.addEventListener('load', done, { once:true });
    document.fonts ? document.fonts.ready.then(done) : done();
  });

  const end = () => {
    if (finished) return;
    finished = true;
    const start = shown;
    const t0 = performance.now();
    const d = 600;
    const step = (t) => {
      const k = clamp((t - t0) / d, 0, 1);
      const v = start + (100 - start) * k;
      bar.style.width = v + '%';
      pct.textContent = Math.round(v) + '%';
      if (k < 1) requestAnimationFrame(step);
      else setTimeout(() => document.body.classList.add('loaded'), 120);
    };
    requestAnimationFrame(step);
  };

  ready().then(() => {
    const left = Math.max(0, minMs - (performance.now() - started));
    setTimeout(end, left);
  });
  setTimeout(end, maxMs); 
})();


import './index.css'
import './style.css'

import Lenis from 'lenis'
import { animate, inView } from 'motion'

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

window.addEventListener('DOMContentLoaded', () => {
  const lenis = new Lenis({ smoothWheel: true, duration: reduce ? 0.6 : 1.0 })
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf) }
  requestAnimationFrame(raf)

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href')
      if (!id || id === '#') return
      const el = document.querySelector(id)
      if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -80 }) }
    })
  })

  const safeShow = () => {
    document.querySelectorAll('.reveal,.badge').forEach(el => {
      el.style.opacity = 1
      el.style.translate = '0 0'
      el.style.transform = 'none'
    })
  }

  try {
    document.body.classList.remove('no-reveal')

    const setupReveal = (selector, baseDelay = 0) => {
      document.querySelectorAll(selector).forEach((el, i) => {
        inView(el, () => {
          if (reduce) { el.style.opacity = 1; el.style.translate = '0 0'; return }
          animate(el, { opacity: [0, 1], y: [12, 0] }, { duration: .8, delay: baseDelay + i * 0.05, easing: 'ease-out' })
        }, { margin: '0px 0px -10% 0px' })
      })
    }
    setupReveal('.hero .reveal')
    setupReveal('.section .reveal', .2)

    const hero = document.querySelector('.hero')
    if (hero && !reduce) {
      let lastY = 0
      const loop = () => {
        const y = window.scrollY
        if (Math.abs(y - lastY) > 0.5) {
          hero.style.backgroundPosition = `center calc(50% + ${y * -0.06}px)`
          lastY = y
        }
        requestAnimationFrame(loop)
      }
      loop()
    }

    const microHover = selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.addEventListener('pointerenter', () => { if (!reduce) animate(el, { scale: 1.03 }, { duration: .18, easing: 'ease-out' }) })
        el.addEventListener('pointerleave', () => { if (!reduce) animate(el, { scale: 1.00 }, { duration: .18, easing: 'ease-out' }) })
      })
    }
    microHover('.btn')
    microHover('.badge')

    inView('.badge', entry => {
      if (reduce) { entry.target.style.opacity = 1; entry.target.style.transform = 'none'; return }
      animate(entry.target, { opacity: [0, 1], y: [20, 0], scale: [0.95, 1] }, { duration: 0.5, easing: 'ease-out' })
    }, { margin: '0px 0px -10% 0px' })

    document.querySelectorAll('.badge').forEach(badge => {
      badge.addEventListener('mousemove', e => {
        const r = badge.getBoundingClientRect()
        const mx = ((e.clientX - r.left) / r.width) * 100
        const my = ((e.clientY - r.top) / r.height) * 100
        badge.style.setProperty('--mx', `${mx}%`)
        badge.style.setProperty('--my', `${my}%`)
      })
    })

    const tilt = el => {
      const r = 14
      el.style.transition = 'transform 120ms ease-out'
      el.addEventListener('pointermove', e => {
        const rect = el.getBoundingClientRect()
        const px = (e.clientX - rect.left) / rect.width
        const py = (e.clientY - rect.top) / rect.height
        const rx = (0.5 - py) * r
        const ry = (px - 0.5) * r
        el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`
      })
      el.addEventListener('pointerleave', () => { el.style.transform = 'rotateX(0) rotateY(0)' })
    }
    document.querySelectorAll('.card').forEach(tilt)

const fmtUA = (v, d) => new Intl.NumberFormat('uk-UA', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v)

const setFinalText = wrap => {
  const span = wrap.querySelector('span')
  const target = parseFloat(wrap.dataset.target ?? '0')
  const decimals = parseInt(wrap.dataset.decimals ?? '0')
  if (!span || Number.isNaN(target)) return
  span.textContent = fmtUA(target, decimals)
}

const scrambleOnce = wrap => {
  if (wrap.dataset.done) return
  wrap.dataset.done = '1'
  const span = wrap.querySelector('span')
  const target = parseFloat(wrap.dataset.target ?? '0')
  const decimals = parseInt(wrap.dataset.decimals ?? '0')
  if (!span || Number.isNaN(target)) return
  const finalStr = fmtUA(target, decimals)
  const digits = finalStr.replace(/\D/g, '').length || 1
  let t = 0, dur = 520, step = 28
  animate(wrap, { scale: [1, 1.03, 1] }, { duration: .45, easing: 'ease-out' })
  const tick = () => {
    t += step
    if (t >= dur) { span.textContent = finalStr; return }
    const rnd = Array.from({ length: digits }, () => Math.floor(Math.random() * 10)).join('')
    let view = finalStr
    let i = 0
    view = view.replace(/\d/g, () => rnd[i++] ?? '0')
    span.textContent = view
    setTimeout(tick, step)
  }
  tick()
}

document.querySelectorAll('.value-card .value-figure').forEach(setFinalText)

inView('.value-card .value-figure', entry => {
  scrambleOnce(entry.target)
}, { margin: '0px 0px -10% 0px' })

setTimeout(() => {
  document.querySelectorAll('.value-card .value-figure').forEach(el => {
    const r = el.getBoundingClientRect()
    if (!(r.top < innerHeight && r.bottom > 0)) scrambleOnce(el)
  })
}, 1400)


    inView('.value-card .value-figure', entry => { runCounter(entry.target) }, { margin: '0px 0px -10% 0px' })
    document.querySelectorAll('.value-card .value-figure').forEach(wrap => {
      const rect = wrap.getBoundingClientRect()
      if (rect.top < innerHeight && rect.bottom > 0) runCounter(wrap)
    })

    const about = document.querySelector('#about.section-bg-2')
    const aboutImg = about ? about.querySelector('.section-bg-2__img') : null
    const markAboutReady = () => { if (about) about.classList.add('ready') }

    if (aboutImg) {
      if (aboutImg.complete) { markAboutReady() } else {
        aboutImg.addEventListener('load', markAboutReady, { once: true })
        aboutImg.addEventListener('error', markAboutReady, { once: true })
      }
      if (!reduce) {
        const loop = () => {
          const rect = about.getBoundingClientRect()
          if (rect.top < innerHeight && rect.bottom > 0) {
            const offset = (window.scrollY - about.offsetTop) * -0.04
            about.style.setProperty('--bgY', `${offset}px`)
          }
          requestAnimationFrame(loop)
        }
        loop()
      }
    } else if (about && !reduce) {
      const loop = () => {
        const rect = about.getBoundingClientRect()
        if (rect.top < innerHeight && rect.bottom > 0) {
          const offset = (window.scrollY - about.offsetTop) * -0.04
          about.style.setProperty('--bgY', `${offset}px`)
        }
        requestAnimationFrame(loop)
      }
      loop()
    }

    const how = document.querySelector('#how.section-bg-analytics')
    if (how && !reduce) {
      const loop = () => {
        const rect = how.getBoundingClientRect()
        if (rect.top < innerHeight && rect.bottom > 0) {
          const offset = (window.scrollY - how.offsetTop) * -0.035
          how.style.setProperty('--howBgY', `${offset}px`)
        }
        requestAnimationFrame(loop)
      }
      loop()
    }

    const startVisibleCounters = () => {
      document.querySelectorAll('.value-card .value-figure').forEach(wrap => {
        const rect = wrap.getBoundingClientRect()
        if (rect.top < innerHeight && rect.bottom > 0) runCounter(wrap)
      })
    }
    if (aboutImg) {
      if (aboutImg.complete) startVisibleCounters()
      else aboutImg.addEventListener('load', startVisibleCounters, { once: true })
    }
  } catch {
    safeShow()
  }
})
const services = document.querySelector('#services.section-bg-services')
if (services && !reduce) {
  const loop = () => {
    const rect = services.getBoundingClientRect()
    if (rect.top < innerHeight && rect.bottom > 0) {
      const offset = (window.scrollY - services.offsetTop) * -0.03
      services.style.setProperty('--srvBgY', `${offset}px`)
    }
    requestAnimationFrame(loop)
  }
  loop()
}

document.querySelectorAll('.services--cyber .service.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect()
    const mx = ((e.clientX - r.left) / r.width) * 100
    const my = ((e.clientY - r.top) / r.height) * 100
    card.style.setProperty('--mx', `${mx}%`)
    card.style.setProperty('--my', `${my}%`)
  })
})
const faq = document.querySelector('#faq.section-bg-faq');
if (faq && !reduce) {
  const faqParallax = () => {
    const rect = faq.getBoundingClientRect();
    if (rect.top < innerHeight && rect.bottom > 0) {
      const offset = (window.scrollY - faq.offsetTop) * -0.035; 
      faq.style.setProperty('--faqBgY', `${offset}px`);
    }
    requestAnimationFrame(faqParallax);
  };
  faqParallax();
}
const contact = document.querySelector('#contact.section-bg-contact');
if (contact && !reduce) {
  const contactParallax = () => {
    const rect = contact.getBoundingClientRect();
    if (rect.top < innerHeight && rect.bottom > 0) {
      const offset = (window.scrollY - contact.offsetTop) * -0.035;
      contact.style.setProperty('--contactBgY', `${offset}px`);
    }
    requestAnimationFrame(contactParallax);
  };
  contactParallax();
}
const delay = (ms)=>new Promise(r=>setTimeout(r,ms));
const nextFrame = ()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));

document.documentElement.classList.add('js');
document.body.classList.add('no-reveal');

const ready = (async ()=>{
  if (document.fonts && document.fonts.ready) {
    try { await Promise.race([document.fonts.ready, delay(800)]); } catch {}
  } else {
    await delay(400);
  }
  await nextFrame();
})();
ready.finally(()=>document.body.classList.remove('no-reveal'));

const visible = el=>{
  const r = el.getBoundingClientRect();
  return r.bottom>0 && r.right>0 && r.top<innerHeight && r.left<innerWidth;
};

window.safeInView = (selector, cb, options={})=>{
  const seen = new WeakSet();
  const run = el=>{
    if (seen.has(el)) return;
    seen.add(el);
    try{ cb({target:el}); } catch {}
  };
  const elems = ()=>Array.from(document.querySelectorAll(selector));
  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if (e.isIntersecting) run(e.target); });
    }, options);
    elems().forEach(el=>io.observe(el));
    const retrigger = ()=>elems().forEach(el=>{ if (visible(el)) run(el); });
    addEventListener('visibilitychange', ()=>{ if (document.visibilityState==='visible') retrigger(); });
    addEventListener('resize', ()=>retrigger());
    addEventListener('scroll', ()=>retrigger(), {passive:true});
    setTimeout(retrigger, 600);
    return ()=>io.disconnect();
  } else {
    const tick = ()=>elems().forEach(el=>{ if (visible(el)) run(el); });
    const id = setInterval(tick, 250);
    addEventListener('visibilitychange', tick);
    addEventListener('resize', tick);
    addEventListener('scroll', tick, {passive:true});
    setTimeout(tick, 300);
    return ()=>clearInterval(id);
  }
};

const resetWeirdTransforms = ()=>{
  const qs = '.reveal,.badge,.btn,.card,.value-figure,.step';
  document.querySelectorAll(qs).forEach(el=>{
    const cs = getComputedStyle(el);
    if (cs.transform !== 'none' && !el.matches(':hover')) {
      el.style.transform = 'none';
    }
    if (!cs.willChange || cs.willChange==='auto') {
      el.style.willChange = 'opacity, transform';
    }
    el.style.backfaceVisibility = 'hidden';
    el.style.transformStyle = 'preserve-3d';
  });
};
const deb = (fn,ms=120)=>{ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };
const reflow = deb(resetWeirdTransforms,120);

addEventListener('load', resetWeirdTransforms);
addEventListener('resize', reflow);
addEventListener('scroll', reflow, {passive:true});
addEventListener('visibilitychange', ()=>{ if (document.visibilityState==='visible'){ resetWeirdTransforms(); dispatchEvent(new Event('reflowtick')); } });

const healImages = ()=>{
  document.querySelectorAll('img:not([data-healed])').forEach(img=>{
    img.dataset.healed='1';
    if (!img.loading) img.loading='lazy';
    img.addEventListener('error', ()=>{ img.style.opacity='0'; });
    if (!img.complete) img.decode?.().catch(()=>{});
  });
};
healImages();
const mo = new MutationObserver(()=>{ healImages(); reflow(); });
mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','src']});

window.addEventListener('fontsloaded', resetWeirdTransforms);
