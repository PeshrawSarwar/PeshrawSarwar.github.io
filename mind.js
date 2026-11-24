(() => {
  const visual = document.querySelector('.mind-visual');
  if (!visual) return;
  const svg = visual.querySelector('svg');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pauseButton = visual.querySelector('.mind-pause');
  const ns = 'http://www.w3.org/2000/svg';
  const points = [[148,211],[192,199],[211,310],[226,351],[302,210],[324,249],[315,290],[369,210],[407,227],[449,211],[426,293],[471,353]];
  const edges = [[0,1],[1,4],[0,2],[2,3],[3,6],[4,5],[5,6],[4,7],[7,8],[8,9],[8,10],[10,11],[5,8],[6,11],[1,7]];
  function el(tag, attributes, parent) {
    const node = document.createElementNS(ns, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    parent.append(node); return node;
  }
  // The sky shares the brain's SVG coordinates and animation clock.
  const destinations = [
    ['Mercury',69,373,5,'#bcb0a4'], ['Venus',448,481,9,'#c3a5ad'],
    ['Earth',160,466,11,'#8192a5'], ['Mars',567,385,8,'#c47b72'],
    ['Jupiter',99,94,20,'#bca7ac'], ['Saturn',500,77,16,'#c5b3a6'],
    ['Uranus',580,209,11,'#a5b0bb'], ['Neptune',220,36,10,'#718caf'],
    ['Moon',39,241,7,'#b6b1b4']
  ];
  for(let i=0;i<48;i++) {
    const angle=i*2.39996, radius=1+(i%5)*.018;
    const x=310+Math.cos(angle)*278*radius, y=270+Math.sin(angle)*237*radius;
    el('circle',{cx:x,cy:y,r:i%9===0?1.4:.7,fill:'#842d46',opacity:.18+(i%3)*.1},svg.querySelector('#solar-stars'));
  }
  const planets = destinations.map(([name,x,y,r,color]) => {
    const group=el('g',{'class':'solar-planet'},svg.querySelector('#solar-planets'));
    el('title',{},group).textContent=name;
    const halo=el('circle',{cx:x,cy:y,r:r+7,fill:'none',stroke:color,'stroke-width':1,opacity:0},group);
    el('circle',{cx:x,cy:y,r,fill:color},group);
    el('path',{d:`M${x} ${y-r} A${r} ${r} 0 0 1 ${x} ${y+r} Q${x+r*.65} ${y} ${x} ${y-r}`,fill:'#18253b',opacity:.22},group);
    if(name==='Saturn') el('ellipse',{cx:x,cy:y,rx:28,ry:7,fill:'none',stroke:color,'stroke-width':3,transform:`rotate(-22 ${x} ${y})`},group);
    if(name==='Jupiter') el('path',{d:`M${x-17} ${y-7} Q${x} ${y-2} ${x+17} ${y-7} M${x-18} ${y+6} Q${x} ${y+11} ${x+18} ${y+6}`,fill:'none',stroke:'#997d6f','stroke-width':3},group);
    if(name==='Earth') el('path',{d:`M${x-7} ${y-6}l6 -2 3 5 -4 4 2 6 -5 -2 -2 -5Z`,fill:'#b4c5a0'},group);
    if(name==='Moon') el('circle',{cx:x-2,cy:y-2,r:2,fill:'#9e9b99',opacity:.6},group);
    el('text',{x,y:y+r+16,'class':'planet-label'},group).textContent=name.toUpperCase();
    return {x,y,r,halo};
  });
  const flights=points.map(([x,y],i)=>{
    const target=planets[i%planets.length];
    const dx=target.x-x, dy=target.y-y, distance=Math.hypot(dx,dy);
    const endX=target.x-dx/distance*(target.r+3), endY=target.y-dy/distance*(target.r+3);
    const bend=i%2?32:-32;
    const path=el('path',{d:`M${x} ${y} Q${(x+endX)/2-dy/distance*bend} ${(y+endY)/2+dx/distance*bend} ${endX} ${endY}`,stroke:'#a96b80','stroke-width':1,opacity:0},svg.querySelector('#rocket-trails'));
    const group=el('g',{opacity:0},svg.querySelector('#solar-rockets'));
    el('path',{d:'M-3 7Q0 22 3 7',fill:'#e9b86e'},group);
    el('path',{d:'M-3 3L-7 9L-6 0L-3-3M3 3L7 9L6 0L3-3',fill:'#a04a65'},group);
    el('path',{d:'M0-11Q7-3 3 7H-3Q-7-3 0-11Z',fill:'#f7f3ee',stroke:'#842d46','stroke-width':.9},group);
    el('circle',{cy:-1,r:2,fill:'#587b9a'},group);
    return {path,group,target,length:path.getTotalLength(),start:i*1250};
  });
  function flyRockets() {
    planets.forEach(p=>p.halo.setAttribute('opacity','0'));
    flights.forEach(f=>{
      const age=((elapsed-f.start)%18000+18000)%18000;
      if(age>5100){f.group.setAttribute('opacity','0');f.path.setAttribute('opacity','0');return;}
      const t=Math.min(age/4800,1), distance=t*f.length;
      const p=f.path.getPointAtLength(distance), next=f.path.getPointAtLength(Math.min(distance+1,f.length));
      const angle=Math.atan2(next.y-p.y,next.x-p.x)*180/Math.PI+90;
      f.group.setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${angle})`);
      f.group.setAttribute('opacity',String(Math.min(t*12,1)*Math.max(0,1-(t-.9)*10)));
      f.path.setAttribute('stroke-dasharray',`${Math.min(42,distance)} ${f.length}`);
      f.path.setAttribute('stroke-dashoffset',String(-Math.max(0,distance-42)));
      f.path.setAttribute('opacity',String(.35*(1-t)));
      if(t>.85) {f.target.halo.setAttribute('opacity',String(Math.sin((t-.85)/.15*Math.PI)*.7));}
    });
  }
  const routes = edges.map(([a,b], i) => {
    const start = points[a], end = points[b];
    const cx = (start[0]+end[0])/2, cy = (start[1]+end[1])/2-22-Math.abs(end[0]-start[0])*.12;
    const path = el('path',{d:`M${start} Q${cx},${cy} ${end}`},svg.querySelector('#mind-connections'));
    const group = el('g',{},svg.querySelector('#mind-signals'));
    el('circle',{r:7,fill:'#b4657e',opacity:'.45',filter:'url(#signal-glow)'},group);
    el('circle',{r:2.6,fill:i%3===0?'#18253b':'#a03c5c'},group);
    el('circle',{r:1,fill:'#fff7eb'},group);
    return {path, group, length:path.getTotalLength(), offset:i/edges.length};
  });
  const nodes = points.map(([cx,cy]) => {
    const group = el('g',{},svg.querySelector('#mind-nodes'));
    const halo = el('circle',{cx,cy,r:7,fill:'#842d46',opacity:'.1'},group);
    el('circle',{cx,cy,r:3.4,fill:'#842d46',stroke:'#f7f3ee','stroke-width':1.5},group);
    return {cx,cy,halo};
  });
  let paused = reduced.matches, visible = true, raf = 0, last = 0, elapsed = 0, pointer = null, bursts = [];
  function sync() {
    visual.classList.toggle('is-paused',paused || reduced.matches || !visible || document.hidden);
    pauseButton.setAttribute('aria-pressed',String(paused));
    pauseButton.textContent = paused ? 'Play animation' : 'Pause animation';
    pauseButton.disabled = reduced.matches;
    if (reduced.matches) pauseButton.textContent = 'Reduced motion enabled';
    if (raf) cancelAnimationFrame(raf);
    raf=0; last=0;
    if (!paused && !reduced.matches && visible && !document.hidden) raf=requestAnimationFrame(frame);
  }
  function frame(now) {
    const delta = last ? Math.min(now-last,50) : 0; last=now; elapsed+=delta;
    flyRockets();
    routes.forEach(route => {
      const p=route.path.getPointAtLength(((elapsed/6500+route.offset)%1)*route.length);
      route.group.setAttribute('transform',`translate(${p.x} ${p.y})`);
    });
    nodes.forEach((node,i) => {
      const distance=pointer?Math.hypot(pointer.x-node.cx,pointer.y-node.cy):1000;
      const proximity=Math.max(0,1-distance/110);
      node.halo.setAttribute('r',String(6+Math.sin(elapsed/650+i)*2+proximity*11));
      node.halo.setAttribute('opacity',String(.1+proximity*.25));
    });
    bursts=bursts.filter(burst => {
      const age=(elapsed-burst.start)/1200;
      if(age>=1){burst.node.remove();return false;}
      burst.node.setAttribute('r',String(8+age*90));burst.node.setAttribute('opacity',String((1-age)*.6));return true;
    });
    raf=requestAnimationFrame(frame);
  }
  // Position every signal before starting, including the reduced-motion view.
  routes.forEach(route => {const p=route.path.getPointAtLength(route.offset*route.length);route.group.setAttribute('transform',`translate(${p.x} ${p.y})`);});
  function send(x=310,y=270) {
    if(paused || reduced.matches) {
      nodes.forEach(node => {node.halo.setAttribute('r','10');node.halo.setAttribute('opacity','.25');});
      return;
    }
    if(bursts.length>=6) bursts.shift().node.remove();
    bursts.push({node:el('circle',{cx:x,cy:y,r:8,'stroke-width':1.5},svg.querySelector('#mind-bursts')),start:elapsed});
  }
  function location(event) {
    const matrix=svg.getScreenCTM();
    if(!matrix) return {x:310,y:270};
    return new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
  }
  svg.addEventListener('pointermove',event=>{pointer=location(event);});
  svg.addEventListener('pointerleave',()=>{pointer=null;});
  svg.addEventListener('click',event=>{const p=location(event);send(p.x,p.y);
    if(!paused && !reduced.matches){let nearest=0;points.forEach((n,i)=>{if(Math.hypot(n[0]-p.x,n[1]-p.y)<Math.hypot(points[nearest][0]-p.x,points[nearest][1]-p.y))nearest=i;});flights[nearest].start=elapsed;}
  });
  visual.querySelector('.mind-send').addEventListener('click',()=>{
    send();
    if(paused || reduced.matches) return;
    flights.forEach((f,i)=>{f.start=elapsed+i*400;});
  });
  pauseButton.addEventListener('click',()=>{paused=!paused;sync();});
  reduced.addEventListener('change',()=>{paused=reduced.matches;sync();});
  document.addEventListener('visibilitychange',sync);
  if('IntersectionObserver' in window) new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(visual);
  sync();
})();
