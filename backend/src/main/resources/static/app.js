// Canvas particles background (lightweight)
(function(){
  const c = document.getElementById('bg-canvas');
  if(!c) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const ctx = c.getContext('2d');
  let w, h, particles;
  function resize(){
    w = c.width = window.innerWidth * dpr;
    h = c.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    spawn();
  }
  function spawn(){
    particles = Array.from({length: 60}, () => ({
      x: Math.random()*window.innerWidth,
      y: Math.random()*window.innerHeight,
      vx: (Math.random()-0.5)*0.4,
      vy: (Math.random()-0.5)*0.4,
      r: Math.random()*1.8+0.3,
      c: Math.random()>0.5 ? 'rgba(34,211,238,0.5)' : 'rgba(96,165,250,0.5)'
    }));
  }
  function step(){
    ctx.clearRect(0,0,w,h);
    ctx.save(); ctx.scale(dpr, dpr);
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>window.innerWidth) p.vx*=-1;
      if(p.y<0||p.y>window.innerHeight) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = p.c; ctx.fill();
    });
    ctx.restore();
    requestAnimationFrame(step);
  }
  window.addEventListener('resize', resize);
  resize(); step();
})();

// Scroll reveal
(function(){
  const els = Array.from(document.querySelectorAll('[data-animate], .stat-card, .feature-card, .api-card, .cta-card'));
  const onScroll = () => {
    const trigger = window.scrollY + window.innerHeight * 0.9;
    els.forEach(el => {
      if(el.offsetTop < trigger) el.classList.add('visible');
    });
  };
  document.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('load', onScroll);
  onScroll();
})();

// Theme toggle, health check loop with latency sparkline, and toasts
(function(){
  // Year
  const year = document.getElementById('year'); if(year) year.textContent = new Date().getFullYear();

  // Theme
  const body = document.body;
  const toggleBtn = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('theme');
  if(saved === 'light' || saved === 'dark') body.setAttribute('data-theme', saved);
  updateToggleIcon();
  toggleBtn && toggleBtn.addEventListener('click', ()=>{
    const cur = body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', cur);
    localStorage.setItem('theme', cur);
    updateToggleIcon();
  });
  function updateToggleIcon(){
    if(!toggleBtn) return;
    const isLight = body.getAttribute('data-theme') === 'light';
    toggleBtn.textContent = isLight ? '🌞' : '🌙';
  }

  // Toasts
  const toastBox = document.getElementById('toast-container');
  function toast(title, msg, type='info', timeout=3000){
    if(!toastBox) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<div class="title">${title}</div><div class="msg">${msg}</div>`;
    toastBox.appendChild(t);
    setTimeout(()=>{
      t.style.animation = 'toastOut .2s ease forwards';
      setTimeout(()=> t.remove(), 200);
    }, timeout);
  }

  // Latency sparkline
  const chart = document.getElementById('latency-chart');
  const ctx = chart ? chart.getContext('2d') : null;
  const latencies = [];
  const maxPoints = 40;
  function drawSparkline(){
    if(!ctx || !chart) return;
    const w = chart.width, h = chart.height;
    ctx.clearRect(0,0,w,h);
    ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const max = Math.max(100, ...latencies); // ensure reasonable scale
    const step = w / Math.max(1, maxPoints-1);
    ctx.beginPath();
    latencies.forEach((v,i)=>{
      const x = i*step;
      const y = h - (v/max)*h;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    const grad = ctx.createLinearGradient(0,0,w,0);
    grad.addColorStop(0,'#22d3ee'); grad.addColorStop(1,'#60a5fa');
    ctx.strokeStyle = grad; ctx.stroke();
  }

  // Health polling with state change detection
  let lastStatus = null;
  const statEl = document.getElementById('stat-health');
  const latencyEl = document.getElementById('latency-value');
  async function ping(){
    const start = performance.now();
    try{
      const r = await fetch('/api/health', {cache:'no-store'});
      const d = r.ok ? await r.json() : {};
      const status = (d && d.status) ? String(d.status) : 'UNKNOWN';
      const ms = Math.max(0, Math.round(performance.now()-start));
      latencies.push(ms); if(latencies.length>maxPoints) latencies.shift();
      latencyEl && (latencyEl.textContent = String(ms));
      drawSparkline();
      if(statEl){
        statEl.textContent = status;
        statEl.classList.toggle('ok', status.toUpperCase()==='UP');
        statEl.classList.toggle('down', status.toUpperCase()!=='UP');
      }
      if(lastStatus!==null && status!==lastStatus){
        if(status.toUpperCase()==='UP') toast('API Up','Health check reports UP','success');
        else toast('API Down','Health check failed or returned non-UP','error');
      }
      lastStatus = status;
    }catch(e){
      const ms = Math.max(0, Math.round(performance.now()-start));
      latencies.push(ms); if(latencies.length>maxPoints) latencies.shift();
      latencyEl && (latencyEl.textContent = String(ms));
      drawSparkline();
      if(statEl){
        statEl.textContent = 'DOWN';
        statEl.classList.remove('ok'); statEl.classList.add('down');
      }
      if(lastStatus!==null && lastStatus!=='DOWN') toast('API Down','Unable to reach /api/health','error');
      lastStatus = 'DOWN';
    }
  }
  // initial pings
  ping();
  setInterval(ping, 5000);
})();
