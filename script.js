// Box robot pick animation – 4 Monte Carlo attempts (side, above, success, below)

const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');
const statusBox = document.getElementById('status');

const seg1 = document.getElementById('seg1');
const seg2 = document.getElementById('seg2');
const j2   = document.getElementById('j2');
const ee   = document.getElementById('ee');
const clawL= document.getElementById('clawL');
const clawR= document.getElementById('clawR');
const trail= document.getElementById('trail');

const t1 = document.getElementById('t1'); // side
const t2 = document.getElementById('t2'); // above
const t3 = document.getElementById('t3'); // success
const t4 = document.getElementById('t4'); // below

const colors = {
  1: getCSS('--side'),
  2: getCSS('--above'),
  3: getCSS('--success'),
  4: getCSS('--below'),
};

const anchor = { x: 280, y: 250 }; // shoulder
const L1 = 130, L2 = 115;

const attempts = [
  { el: t1, msg: '<b>Attempt 1:</b> Goal failed — Monte Carlo sample drifted to the <span style="color:var(--side)">side</span>.' },
  { el: t2, msg: '<b>Attempt 2:</b> Sample tried <span style="color:var(--above)">above</span> the object. Explanation: noise pulled the candidate upward.' },
  { el: t3, msg: '<b>Attempt 3:</b> <span style="color:var(--success)">Virtual goal achieved</span> — sample landed on target, pick successful.' },
  { el: t4, msg: '<b>Attempt 4:</b> Another draw went <span style="color:var(--below)">below</span> the object.' },
];

let isRunning = false;

function getCSS(varName){
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

function ik(target){
  const dx = target.x - anchor.x;
  const dy = target.y - anchor.y;
  const D = Math.min(Math.max((dx*dx + dy*dy - L1*L1 - L2*L2)/(2*L1*L2), -1), 1);
  const th2 = Math.acos(D);
  const th1 = Math.atan2(dy, dx) - Math.atan2(L2*Math.sin(th2), L1 + L2*Math.cos(th2));

  const j2x = anchor.x + L1*Math.cos(th1);
  const j2y = anchor.y + L1*Math.sin(th1);
  const eex = j2x + L2*Math.cos(th1 + th2);
  const eey = j2y + L2*Math.sin(th1 + th2);
  return { j2x, j2y, eex, eey };
}

function draw(sol){
  seg1.setAttribute('x1', anchor.x);
  seg1.setAttribute('y1', anchor.y);
  seg1.setAttribute('x2', sol.j2x);
  seg1.setAttribute('y2', sol.j2y);

  j2.setAttribute('cx', sol.j2x);
  j2.setAttribute('cy', sol.j2y);

  seg2.setAttribute('x1', sol.j2x);
  seg2.setAttribute('y1', sol.j2y);
  seg2.setAttribute('x2', sol.eex);
  seg2.setAttribute('y2', sol.eey);

  ee.setAttribute('cx', sol.eex);
  ee.setAttribute('cy', sol.eey);

  clawL.setAttribute('d', `M${sol.eex-5} ${sol.eey-5} L${sol.eex-14} ${sol.eey-18}`);
  clawR.setAttribute('d', `M${sol.eex+5} ${sol.eey-5} L${sol.eex+14} ${sol.eey-18}`);
}

function showGhost(index){
  [t1,t2,t3,t4].forEach((el, i)=> el.style.opacity = (i===index ? 0.9 : 0));
}

function waitFrame(){ return new Promise(r => requestAnimationFrame(r)); }
function pause(ms){ return new Promise(r => setTimeout(r, ms)); }
function lerp(a,b,t){ return a + (b-a)*t; }

async function moveTo(el, attemptIndex){
  const cx = +el.getAttribute('cx'), cy = +el.getAttribute('cy');
  const start = { x: +ee.getAttribute('cx'), y: +ee.getAttribute('cy') };

  let points = [];
  const steps = 90;
  for(let s=1; s<=steps; s++){
    const t = s/steps;
    const nx = (Math.random()-0.5)*6, ny = (Math.random()-0.5)*6; // Monte Carlo jitter
    const x = lerp(start.x, cx, t) + nx;
    const y = lerp(start.y, cy, t) + ny;
    const sol = ik({x,y});
    draw(sol);
    points.push(`${Math.round(sol.eex)},${Math.round(sol.eey)}`);
    trail.setAttribute('points', points.join(' '));
    trail.style.stroke = colors[attemptIndex+1];
    await waitFrame();
  }

  // Close claws only on success (attempt 3)
  if(attemptIndex === 2){
    clawL.setAttribute('d', `M${cx-4} ${cy-2} L${cx-11} ${cy-2}`);
    clawR.setAttribute('d', `M${cx+4} ${cy-2} L${cx+11} ${cy-2}`);
  }
}

async function run(){
  if(isRunning) return;
  isRunning = true; runBtn.disabled = true;
  trail.setAttribute('points','');
  statusBox.innerHTML = 'Sampling candidate grasps…';

  for(let i=0;i<attempts.length;i++){
    const a = attempts[i];
    showGhost(i);
    await moveTo(a.el, i);
    statusBox.innerHTML = a.msg;
    await pause(700);
  }

  showGhost(-1); isRunning = false; runBtn.disabled = false;
}

function reset(){
  showGhost(-1);
  const neutral = ik({x: 480, y: 260});
  draw(neutral);
  trail.setAttribute('points','');
  statusBox.innerHTML = 'Click <b>Run</b> to simulate 4 Monte Carlo attempts.';
}

runBtn.addEventListener('click', run);
resetBtn.addEventListener('click', reset);
reset();
