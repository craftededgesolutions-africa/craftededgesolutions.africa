/**
 * CES Hero Background Animation
 * Canvas-based, 60fps, seamless 25s loop
 * Design tokens: #0a0a0b bg, #e89240 gold accent, #d4d4cc platinum
 */
(function () {
  const canvas = document.getElementById('ces-hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const C = {
    bg:          '#0a0a0b',
    bgElev:      '#111113',
    bgCard:      '#131316',
    fg:          '#f4f4ef',
    fgMid:       '#a8a8a3',
    fgDim:       '#6b6b68',
    gold:        '#e89240',
    goldDim:     'rgba(232,146,64,0.35)',
    goldTrace:   'rgba(232,146,64,0.12)',
    platinum:    '#d4d4cc',
    platDim:     'rgba(212,212,204,0.35)',
    gridLine:    'rgba(245,245,240,0.06)',
    gridStrong:  'rgba(245,245,240,0.12)',
  };

  // ── Utils ──────────────────────────────────────────────────────────────────
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, mn = 0, mx = 1) => Math.max(mn, Math.min(mx, v));
  const remap = (v, i0, i1, o0 = 0, o1 = 1) => lerp(o0, o1, clamp((v - i0) / (i1 - i0)));
  const easeOutExpo = t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
  const easeInOutCubic = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
  const breathe = (t, s = 1) => (Math.sin(t * Math.PI * 2 * s) + 1) / 2;
  const seededRand = (seed) => { let s = seed; return () => { s=(s*9301+49297)%233280; return s/233280; }; };

  const polygon = (cx, cy, r, n, rot = 0) =>
    Array.from({length: n}, (_, i) => {
      const a = (i/n)*Math.PI*2 + rot;
      return [cx + r*Math.cos(a), cy + r*Math.sin(a)];
    });

  // ── Resize ─────────────────────────────────────────────────────────────────
  let W, H, CX, CY, dpr;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    CX = W / 2; CY = H / 2;
  }
  window.addEventListener('resize', resize);
  resize();

  // ── Particles ──────────────────────────────────────────────────────────────
  const PARTICLE_COUNT = 90;
  const particles = Array.from({length: PARTICLE_COUNT}, (_, i) => {
    const r = seededRand(i * 31 + 7);
    return { x: r()*1, y: r()*1, vx: (r()-0.5)*0.3, vy: -(r()*0.25+0.04),
             size: r()*2.5+0.5, op: r()*0.5+0.1, phase: r()*Math.PI*2 };
  });

  function drawParticles(t) {
    particles.forEach((p, i) => {
      const x = ((p.x*W + p.vx*t*40 + Math.sin(t*0.008+i*0.4)*20) % W + W) % W;
      const y = ((p.y*H - p.vy*t*50) % H + H) % H;
      const flicker = 0.5 + 0.5*Math.sin(t*0.07 + p.phase);
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI*2);
      ctx.fillStyle = i%3===0 ? C.gold : C.platinum;
      ctx.globalAlpha = p.op * flicker * 0.6;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  // ── Scene 1 — Blueprint ────────────────────────────────────────────────────
  function drawBlueprint(t, progress, alpha) {
    ctx.globalAlpha = alpha;
    const gp = easeOutExpo(remap(progress, 0, 0.4));
    const fp = easeOutExpo(remap(progress, 0.05, 0.35));
    const hp = easeOutExpo(remap(progress, 0.15, 0.65));

    // Fine grid
    if (fp > 0) {
      const fs = Math.round(W / 32);
      ctx.strokeStyle = C.gridLine; ctx.lineWidth = 0.5;
      for (let x = 0; x <= W; x += fs) {
        if (Math.abs(x-CX)/(W/2) > fp) continue;
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
      }
      for (let y = 0; y <= H; y += fs) {
        if (Math.abs(y-CY)/(H/2) > fp) continue;
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
      }
    }

    // Major grid
    if (gp > 0) {
      const ms = Math.round(W / 16);
      ctx.strokeStyle = C.gridStrong; ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += ms) {
        if (Math.abs(x-CX)/(W/2) > gp) continue;
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
      }
      for (let y = 0; y <= H; y += ms) {
        if (Math.abs(y-CY)/(H/2) > gp) continue;
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
      }
    }

    // Diagonal construction lines
    const dp = easeInOutCubic(remap(progress, 0.1, 0.5));
    if (dp > 0) {
      ctx.strokeStyle = C.goldTrace; ctx.lineWidth = 1;
      [[0,0,W,H],[W,0,0,H],[CX,0,CX,H],[0,CY,W,CY]].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath(); ctx.moveTo(x1,y1);
        ctx.lineTo(x1+(x2-x1)*dp, y1+(y2-y1)*dp); ctx.stroke();
      });
    }

    // Sacred geometry — nested hexagons
    if (hp > 0) {
      const scales = [W*0.04, W*0.08, W*0.13, W*0.18, W*0.23, W*0.28];
      scales.forEach((r, layer) => {
        const lp = easeOutExpo(remap(hp, layer/scales.length, (layer+1.5)/scales.length));
        if (lp <= 0) return;
        const pts = polygon(CX, CY, r, 6, Math.PI/6);
        ctx.strokeStyle = layer%2===0 ? C.goldDim : C.platDim;
        ctx.lineWidth = layer===0 ? 2 : 1.2;
        ctx.globalAlpha = alpha * (0.9 - layer*0.08) * lp;
        ctx.beginPath();
        pts.forEach(([x,y],i) => i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y));
        ctx.closePath(); ctx.stroke();
        // Corner dots
        pts.forEach(([x,y]) => {
          ctx.beginPath(); ctx.arc(x, y, 3-layer*0.3, 0, Math.PI*2);
          ctx.fillStyle = layer%2===0 ? C.goldDim : C.platDim; ctx.fill();
        });
      });
      ctx.globalAlpha = alpha;

      // Central rings
      [W*0.04, W*0.065].forEach((r, i) => {
        ctx.beginPath(); ctx.arc(CX, CY, r*hp, 0, Math.PI*2);
        ctx.strokeStyle = C.gold; ctx.lineWidth = i===0 ? 2 : 1; ctx.stroke();
      });
      ctx.beginPath(); ctx.arc(CX, CY, 4, 0, Math.PI*2);
      ctx.fillStyle = C.gold; ctx.globalAlpha = alpha*hp; ctx.fill();
    }

    // Scan line
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1;
    ctx.globalAlpha = alpha * 0.06 * gp;
    const sy = CY + Math.sin(t*0.02)*H*0.2;
    ctx.beginPath(); ctx.moveTo(0,sy); ctx.lineTo(W,sy); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ── Scene 2 — Architecture ─────────────────────────────────────────────────
  const NODES = [
    {x:0,   y:0,    label:'Platform Core', r:0.025, type:'core'},
    {x:-0.16,y:-0.15,label:'API Gateway',  r:0.017, type:'service'},
    {x:0.16, y:-0.13,label:'Auth Service', r:0.017, type:'service'},
    {x:-0.24,y:0.04, label:'Event Bus',    r:0.015, type:'service'},
    {x:0.23, y:0.06, label:'PostgreSQL',   r:0.015, type:'data'},
    {x:-0.11,y:0.23, label:'Redis Cache',  r:0.013, type:'data'},
    {x:0.12, y:0.22, label:'ML Pipeline',  r:0.016, type:'service'},
    {x:-0.28,y:-0.23,label:'Workers',      r:0.012, type:'edge'},
    {x:0.28, y:-0.21,label:'WebSocket',    r:0.012, type:'edge'},
    {x:0,    y:-0.31,label:'Object Store', r:0.013, type:'edge'},
    {x:-0.18,y:0.32, label:'CDN Edge',     r:0.011, type:'edge'},
    {x:0.19, y:0.31, label:'Monitoring',   r:0.012, type:'data'},
  ];
  const EDGES = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,7],[2,8],[1,9],[2,9],[3,5],[4,6],[5,10],[6,11]];

  function drawArchitecture(t, progress, alpha) {
    ctx.globalAlpha = alpha;
    const scale = Math.min(W, H);

    EDGES.forEach(([fi, ti], ei) => {
      const ep = easeInOutCubic(remap(progress, 0.2+ei*0.025, 0.2+ei*0.025+0.2));
      if (ep <= 0) return;
      const n1 = NODES[fi], n2 = NODES[ti];
      const x1 = CX+n1.x*scale, y1 = CY+n1.y*scale;
      const x2 = CX+n2.x*scale, y2 = CY+n2.y*scale;
      const len = Math.hypot(x2-x1, y2-y1);
      ctx.strokeStyle = C.goldTrace; ctx.lineWidth = 1.5;
      ctx.globalAlpha = alpha * 0.7;
      ctx.setLineDash([len*ep, len]);
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.setLineDash([]);
      // Packet
      if (ep > 0.9) {
        const pt = ((t*0.4 + ei*47) % 100) / 100;
        ctx.beginPath(); ctx.arc(x1+(x2-x1)*pt, y1+(y2-y1)*pt, 4, 0, Math.PI*2);
        ctx.fillStyle = C.gold; ctx.globalAlpha = alpha*0.8; ctx.fill();
      }
    });

    NODES.forEach((n, i) => {
      const np = easeOutExpo(remap(progress, i*0.04, i*0.04+0.15));
      if (np <= 0) return;
      const x = CX+n.x*scale, y = CY+n.y*scale, r = n.r*scale*np;
      const color = n.type==='core' ? C.gold : n.type==='service' ? C.platinum : n.type==='data' ? C.fgMid : C.fgDim;
      const pulse = breathe(t/80 + i) * r * 0.3;

      // Pulse ring
      ctx.beginPath(); ctx.arc(x, y, r+10+pulse, 0, Math.PI*2);
      ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.globalAlpha = alpha*0.2*np; ctx.stroke();
      // Outer ring
      ctx.beginPath(); ctx.arc(x, y, r+7, 0, Math.PI*2);
      ctx.globalAlpha = alpha*0.4*np; ctx.stroke();
      // Body
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.fillStyle = C.bgCard; ctx.globalAlpha = alpha*np; ctx.fill();
      ctx.lineWidth = n.type==='core' ? 2 : 1.5; ctx.stroke();
      // Center dot
      ctx.beginPath(); ctx.arc(x, y, n.type==='core' ? 5 : 3, 0, Math.PI*2);
      ctx.fillStyle = color; ctx.fill();
      // Label
      if (np > 0.6) {
        ctx.font = `${Math.round(r*0.55)}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = color; ctx.globalAlpha = alpha*np*0.85;
        ctx.textAlign = 'center'; ctx.fillText(n.label, x, y+r+14);
      }
    });
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
  }

  // ── Scene 3 — Intelligence ─────────────────────────────────────────────────
  const CODE_LINES = [
    'await orchestrator.dispatch(event)',
    'pipeline.transform(data, schema)',
    'agent.reason(context, tools)',
    'graph.traverse(topology)',
    'inference.run(model, input)',
    'stream.emit(EventType.COMPLETE)',
    'session.authorize(scope)',
    'cache.invalidate(pattern)',
    'worker.queue(task, priority)',
    'monitor.observe(metric)',
  ];
  const EVENTS = ['USER_ACTION','PAYMENT_DONE','AGENT_RESP','PIPELINE_OK','AUTH_TOKEN','WORKER_DONE'];

  function drawIntelligence(t, progress, alpha) {
    const cp = easeOutExpo(remap(progress, 0, 0.5));
    const sp = remap(progress, 0.2, 0.7);

    // Event streams (right side)
    if (sp > 0) {
      const colW = W * 0.38;
      Array.from({length: 6}, (_, i) => {
        const x = W*0.62 + (i%3)*(W*0.12) + W*0.02;
        const speed = 1.2 + (i%3)*0.4;
        const color = i%3===0 ? C.gold : i%3===1 ? C.platinum : C.fgDim;
        Array.from({length:6}, (__, row) => {
          const y = ((row*H*0.15 + t*speed*20) % H);
          const pulse = breathe(t/60 + i*0.3);
          const bw = Math.min(W*0.1, 110);
          ctx.globalAlpha = alpha * sp * (0.5 + pulse*0.3);
          ctx.fillStyle = C.bgCard;
          ctx.fillRect(x-bw/2, y-16, bw, 32);
          ctx.strokeStyle = color; ctx.lineWidth = 1;
          ctx.strokeRect(x-bw/2, y-16, bw, 32);
          ctx.fillStyle = color; ctx.globalAlpha = alpha*sp;
          ctx.font = `${Math.round(W*0.008)}px 'JetBrains Mono', monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(EVENTS[i%EVENTS.length], x, y+5);
        });
      });
      ctx.globalAlpha = 1; ctx.textAlign = 'left';
    }

    // Code lines (left side)
    if (cp > 0) {
      CODE_LINES.forEach((line, i) => {
        const lp = easeOutExpo(remap(cp, i*0.06, i*0.06+0.2));
        if (lp <= 0) return;
        const y = H*0.18 + i*(H*0.068);
        const typeLen = Math.floor(line.length * lp);
        const fs = Math.round(W * 0.012);
        // Background pill
        ctx.fillStyle = C.bgCard; ctx.globalAlpha = alpha*0.7*lp;
        ctx.fillRect(W*0.02, y-fs*0.8, W*0.36, fs*1.6);
        // Line number
        ctx.font = `${Math.round(fs*0.75)}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = C.fgDim; ctx.globalAlpha = alpha*lp*0.5;
        ctx.fillText(String(i+1).padStart(2,'0'), W*0.03, y+fs*0.4);
        // Code text
        ctx.font = `${fs}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = i%4===0 ? C.gold : i%4===1 ? C.platinum : C.fgMid;
        ctx.globalAlpha = alpha*lp;
        ctx.fillText(line.slice(0, typeLen) + (lp<0.99 ? '▎':''), W*0.07, y+fs*0.4);
      });
    }
    ctx.globalAlpha = 1;
  }

  // ── Scene 4 — Orchestration ────────────────────────────────────────────────
  const PIPELINE = ['Ingest','Transform','Validate','Enrich','Route','Persist','Notify'];
  const RINGS_DEF = [
    {rFactor: 0.18, nodes: 6, speed:  0.003},
    {rFactor: 0.28, nodes: 9, speed: -0.002},
    {rFactor: 0.38, nodes:12, speed:  0.0015},
  ];

  function drawOrchestration(t, progress, alpha) {
    const np = easeInOutCubic(remap(progress, 0.3, 0.9));
    const pp = easeOutExpo(remap(progress, 0, 0.6));
    const scale = Math.min(W, H);

    // Orbital rings
    if (np > 0) {
      RINGS_DEF.forEach((ring, ri) => {
        const rp = easeOutExpo(remap(np, ri*0.15, ri*0.15+0.5));
        if (rp <= 0) return;
        const r = ring.rFactor * scale;
        const rot = t * ring.speed;
        // Ring track
        ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI*2*rp);
        ctx.strokeStyle = C.gridStrong; ctx.lineWidth = 1; ctx.globalAlpha = alpha*0.5; ctx.stroke();
        // Ring nodes
        polygon(CX, CY, r, ring.nodes, rot).forEach(([x,y], pi) => {
          const pulse = breathe(t/80 + ri*0.4 + pi*0.8);
          const color = ri===0 ? C.gold : C.platDim;
          ctx.beginPath(); ctx.arc(x, y, 12+pulse*5, 0, Math.PI*2);
          ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.globalAlpha = alpha*0.25*rp; ctx.stroke();
          ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI*2);
          ctx.fillStyle = C.bgCard; ctx.globalAlpha = alpha*0.9*rp; ctx.fill();
          ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.globalAlpha = alpha*0.8*rp; ctx.stroke();
          ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI*2);
          ctx.fillStyle = color; ctx.globalAlpha = alpha*rp; ctx.fill();
        });
      });

      // Core glow
      const grad = ctx.createRadialGradient(CX,CY,0,CX,CY,scale*0.12);
      grad.addColorStop(0,'rgba(232,146,64,0.14)'); grad.addColorStop(1,'rgba(232,146,64,0)');
      ctx.beginPath(); ctx.arc(CX,CY,scale*0.12,0,Math.PI*2);
      ctx.fillStyle = grad; ctx.globalAlpha = alpha*np; ctx.fill();
      ctx.beginPath(); ctx.arc(CX,CY,scale*0.04,0,Math.PI*2);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.globalAlpha = alpha*0.6*np; ctx.stroke();
      ctx.beginPath(); ctx.arc(CX,CY,7,0,Math.PI*2);
      ctx.fillStyle = C.gold; ctx.globalAlpha = alpha*np; ctx.fill();
    }

    // Pipeline strip
    if (pp > 0) {
      const pH = H*0.06; const pY = H - pH - H*0.06;
      const pW = W*0.72; const pX = CX - pW/2;
      ctx.fillStyle = C.bgElev; ctx.globalAlpha = alpha*pp*0.8;
      ctx.fillRect(pX, pY, pW, pH);
      ctx.strokeStyle = C.gridStrong; ctx.lineWidth = 1; ctx.stroke();
      const activeStage = Math.floor(t/20) % PIPELINE.length;
      const stageW = pW / PIPELINE.length;
      PIPELINE.forEach((stage, i) => {
        const sp2 = easeOutExpo(remap(pp, i/PIPELINE.length, (i+1.5)/PIPELINE.length));
        if (sp2 <= 0) return;
        const sx = pX + i*stageW + stageW/2;
        const active = activeStage === i;
        ctx.fillStyle = active ? 'rgba(232,146,64,0.12)' : C.bgCard;
        ctx.globalAlpha = alpha*sp2;
        ctx.fillRect(sx-stageW*0.4, pY+4, stageW*0.8, pH-8);
        ctx.strokeStyle = active ? C.gold : C.platDim; ctx.lineWidth = active?2:1;
        ctx.globalAlpha = alpha*sp2; ctx.strokeRect(sx-stageW*0.4, pY+4, stageW*0.8, pH-8);
        ctx.font = `${Math.round(W*0.009)}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = active ? C.gold : C.fgMid;
        ctx.globalAlpha = alpha*sp2*0.9; ctx.textAlign='center';
        ctx.fillText(stage, sx, pY+pH/2+4);
        if (active) {
          ctx.beginPath(); ctx.arc(sx, pY+pH/2, 4, 0, Math.PI*2);
          ctx.fillStyle = C.gold; ctx.globalAlpha = alpha*0.9; ctx.fill();
        }
      });
      ctx.textAlign = 'left';
    }
    ctx.globalAlpha = 1;
  }

  // ── Scene 5 — Sovereignty ──────────────────────────────────────────────────
  function drawSovereignty(t, progress, alpha) {
    const ep = easeInOutCubic(remap(progress, 0, 0.5));
    const lp = easeOutExpo(remap(progress, 0.4, 0.8));
    const tp = easeOutExpo(remap(progress, 0.6, 0.95));
    const bv = breathe(t/240, 0.5);
    const scale = Math.min(W,H);

    if (ep > 0) {
      // Radial glow
      const grad = ctx.createRadialGradient(CX,CY,0,CX,CY,scale*0.4);
      grad.addColorStop(0,`rgba(232,146,64,${(0.12+bv*0.05)*ep})`);
      grad.addColorStop(1,'rgba(232,146,64,0)');
      ctx.beginPath(); ctx.arc(CX,CY,scale*0.4,0,Math.PI*2);
      ctx.fillStyle = grad; ctx.globalAlpha = 1; ctx.fill();

      // Star of David triangles
      [0, Math.PI/3].forEach(rot => {
        const pts = polygon(CX, CY, scale*0.26, 3, rot);
        ctx.beginPath(); pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y)); ctx.closePath();
        ctx.strokeStyle = C.goldDim; ctx.lineWidth = 1.5; ctx.globalAlpha = alpha*0.5*ep; ctx.stroke();
      });

      // Outer hexagon
      const ohPts = polygon(CX,CY,scale*0.3,6,Math.PI/6);
      ctx.beginPath(); ohPts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y)); ctx.closePath();
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.globalAlpha = alpha*0.7*ep; ctx.stroke();
      ohPts.forEach(([x,y]) => {
        ctx.beginPath(); ctx.arc(x,y,7,0,Math.PI*2);
        ctx.strokeStyle=C.gold; ctx.lineWidth=2; ctx.globalAlpha=alpha*0.8*ep; ctx.stroke();
        ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2);
        ctx.fillStyle=C.gold; ctx.globalAlpha=alpha*ep; ctx.fill();
      });

      // Inner hex
      const ihPts = polygon(CX,CY,scale*0.17,6,Math.PI/6);
      ctx.beginPath(); ihPts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y)); ctx.closePath();
      ctx.strokeStyle=C.platDim; ctx.lineWidth=1.5; ctx.globalAlpha=alpha*0.6*ep; ctx.stroke();

      // Concentric rings
      [0.03,0.05,0.074,0.1].forEach((rf,i) => {
        ctx.beginPath(); ctx.arc(CX,CY,(rf+bv*(i+1)*0.002)*scale,0,Math.PI*2);
        ctx.strokeStyle = i%2===0 ? C.gold : C.platinum;
        ctx.lineWidth = i===0 ? 2.5 : 1.5; ctx.globalAlpha = alpha*(0.8-i*0.1)*ep; ctx.stroke();
      });

      // Rotating ring dots
      ctx.save(); ctx.translate(CX,CY); ctx.rotate(t*0.002);
      polygon(0,0,scale*0.12,12).forEach(([x,y]) => {
        ctx.beginPath(); ctx.arc(x,y,2.5,0,Math.PI*2);
        ctx.fillStyle=C.gold; ctx.globalAlpha=alpha*0.4*ep; ctx.fill();
      });
      ctx.restore();
      ctx.save(); ctx.translate(CX,CY); ctx.rotate(-t*0.0015);
      polygon(0,0,scale*0.155,8).forEach(([x,y]) => {
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(x,y);
        ctx.strokeStyle=C.goldTrace; ctx.lineWidth=1; ctx.globalAlpha=alpha*0.25*ep; ctx.stroke();
      });
      ctx.restore();

      // Core
      ctx.beginPath(); ctx.arc(CX,CY,scale*0.015+bv*scale*0.002,0,Math.PI*2);
      ctx.fillStyle=C.bgCard; ctx.globalAlpha=alpha*ep; ctx.fill();
      ctx.strokeStyle=C.gold; ctx.lineWidth=3; ctx.stroke();
      ctx.beginPath(); ctx.arc(CX,CY,5,0,Math.PI*2);
      ctx.fillStyle=C.gold; ctx.fill();
    }

    // Logo text
    if (lp > 0) {
      const fs = Math.round(scale * 0.048);
      ctx.globalAlpha = alpha*lp;
      ctx.textAlign = 'center';
      // Eyebrow
      ctx.font = `${Math.round(fs*0.28)}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = C.gold; ctx.globalAlpha = alpha*lp*0.7;
      ctx.fillText('— CRAFTED EDGE SOLUTIONS —', CX, CY + scale*0.42);
      // Wordmark
      ctx.font = `italic ${fs}px 'Instrument Serif', 'Georgia', serif`;
      ctx.fillStyle = C.fg; ctx.globalAlpha = alpha*lp;
      ctx.fillText('Precision Engineering.', CX, CY + scale*0.48);
      // Tagline
      if (tp > 0) {
        ctx.font = `${Math.round(fs*0.22)}px 'Inter', sans-serif`;
        ctx.fillStyle = C.fgMid; ctx.globalAlpha = alpha*tp*0.8;
        ctx.fillText('NAIROBI · GLOBAL · EST. 2024', CX, CY + scale*0.53);
      }
      ctx.textAlign = 'left';
    }
    ctx.globalAlpha = 1;
  }

  // ── Volumetric light ───────────────────────────────────────────────────────
  function drawVolumetricLight(t) {
    const pulse = breathe(t/360, 0.3);
    const grad = ctx.createRadialGradient(CX, CY*0.9, 0, CX, CY*0.9, Math.max(W,H)*0.6);
    grad.addColorStop(0, `rgba(232,146,64,${0.04+pulse*0.02})`);
    grad.addColorStop(0.4,'rgba(232,146,64,0.01)');
    grad.addColorStop(1, 'rgba(232,146,64,0)');
    ctx.fillStyle = grad; ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, W, H);
  }

  // ── Main loop ──────────────────────────────────────────────────────────────
  const TOTAL = 25;   // seconds per loop
  const SCENES_DEF = [
    { name:'blueprint',    start:0,    end:8,    draw:drawBlueprint },
    { name:'architecture', start:5.3,  end:13,   draw:drawArchitecture },
    { name:'intelligence', start:10.3, end:17,   draw:drawIntelligence },
    { name:'orchestration',start:14.3, end:21,   draw:drawOrchestration },
    { name:'sovereignty',  start:18.3, end:25,   draw:drawSovereignty },
  ];

  function sceneAlpha(t, start, end, fadeIn=1.2, fadeOut=1.5) {
    if (t < start || t > end) return 0;
    return Math.min(easeInOutCubic(Math.min(1,(t-start)/fadeIn)), easeInOutCubic(Math.min(1,(end-t)/fadeOut)));
  }

  let startTime = null;
  let raf;

  function frame(ts) {
    if (!startTime) startTime = ts;
    const elapsed = (ts - startTime) / 1000;
    const t = elapsed % TOTAL;
    const tFrames = t * 60; // frame equivalent

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    // Volumetric light
    drawVolumetricLight(tFrames);

    // Particles
    drawParticles(tFrames);

    // Scenes
    SCENES_DEF.forEach(s => {
      const a = sceneAlpha(t, s.start, s.end);
      if (a <= 0) return;
      const p = remap(t, s.start, s.end);
      ctx.save();
      s.draw(tFrames, p, a);
      ctx.restore();
    });

    // Vignette
    const vig = ctx.createRadialGradient(CX,CY,Math.min(W,H)*0.25,CX,CY,Math.max(W,H)*0.75);
    vig.addColorStop(0,'rgba(10,10,11,0)');
    vig.addColorStop(1,'rgba(10,10,11,0.75)');
    ctx.fillStyle = vig; ctx.globalAlpha = 1;
    ctx.fillRect(0,0,W,H);

    raf = requestAnimationFrame(frame);
  }

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); }
    else { startTime = null; raf = requestAnimationFrame(frame); }
  });

  raf = requestAnimationFrame(frame);
})();
