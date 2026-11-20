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
  svg.addEventListener('click',event=>{const p=location(event);send(p.x,p.y);});
  visual.querySelector('.mind-send').addEventListener('click',()=>send());
  pauseButton.addEventListener('click',()=>{paused=!paused;sync();});
  reduced.addEventListener('change',()=>{paused=reduced.matches;sync();});
  document.addEventListener('visibilitychange',sync);
  if('IntersectionObserver' in window) new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(visual);
  sync();
})();
