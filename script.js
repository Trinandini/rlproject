const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');
const statusBox = document.getElementById('status');

const ee = document.getElementById('ee');
const puck = document.getElementById('puck');
const t1 = document.getElementById('t1');
const t2 = document.getElementById('t2');
const t3 = document.getElementById('t3');
const t4 = document.getElementById('t4');

let attempt = 0;

function moveEE(x,y){
  ee.setAttribute('cx', x);
  ee.setAttribute('cy', y);
}

function showGhost(i){
  [t1,t2,t3,t4].forEach((e,idx)=> e.style.opacity = idx===i?1:0);
}

async function run(){
  attempt++;
  if(attempt===1){
    showGhost(0);
    moveEE(t1.getAttribute('cx'),t1.getAttribute('cy'));
    statusBox.innerHTML="Attempt 1 (Side) : Monte Carlo Failed.";
  }
  else if(attempt===2){
    showGhost(1);
    moveEE(t2.getAttribute('cx'),t2.getAttribute('cy'));
    statusBox.innerHTML="Attempt 2 (Above) : Monte Carlo sampled above.";
  }
  else if(attempt===3){
    showGhost(2);
    moveEE(t3.getAttribute('cx'),t3.getAttribute('cy'));
    statusBox.innerHTML="Attempt 3 (SUCCESS) : Monte Carlo picked successfully!";
    // visually lift object
    puck.setAttribute("cy", parseInt(puck.getAttribute("cy"))-40);
  }
  else if(attempt===4){
    showGhost(3);
    moveEE(t4.getAttribute('cx'),t4.getAttribute('cy'));
    statusBox.innerHTML="Attempt 4 (Below) : Monte Carlo sampled below.";
  }
}

function reset(){
  attempt=0;
  showGhost(-1);
  moveEE(480,260);
  puck.setAttribute("cy",320);
  statusBox.innerHTML="Click Run";
}

runBtn.onclick=run;
resetBtn.onclick=reset;
reset();
