import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

let scene, camera, renderer;
let ball;
let batsman;
let bowler;
let bat;
let fielders = [];

let running = false;
let ballMoving = false;
let ballProgress = 0;
let selectedShot = null;

let runs = 0;
let wickets = 0;
let balls = 0;

const runsEl = document.getElementById("runs");
const wicketsEl = document.getElementById("wickets");
const ballsEl = document.getElementById("balls");
const messageEl = document.getElementById("message");
const startBtn = document.getElementById("start");

init();
animate();

function init() {

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x79cfff);

  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.set(0, 8, 17);
  camera.lookAt(0, 2, 0);

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.shadowMap.enabled = true;

  document.body.appendChild(renderer.domElement);

  createLights();
  createStadium();
  createPitch();
  createPlayers();
  createBall();
  createFielders();

  window.addEventListener(
    "resize",
    resize
  );

  document.querySelectorAll(".shot").forEach(button => {

    button.addEventListener(
      "pointerdown",
      () => playShot(button.dataset.shot)
    );

  });

  startBtn.addEventListener(
    "click",
    startMatch
  );
}


/* LIGHTS */

function createLights() {

  const ambient =
    new THREE.AmbientLight(
      0xffffff,
      1.4
    );

  scene.add(ambient);

  const sun =
    new THREE.DirectionalLight(
      0xffffff,
      2
    );

  sun.position.set(
    10,
    20,
    10
  );

  sun.castShadow = true;

  scene.add(sun);
}


/* STADIUM */

function createStadium() {

  const groundGeometry =
    new THREE.CylinderGeometry(
      32,
      32,
      0.4,
      64
    );

  const groundMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x126b2d
    });

  const ground =
    new THREE.Mesh(
      groundGeometry,
      groundMaterial
    );

  ground.position.y = -0.3;
  ground.receiveShadow = true;

  scene.add(ground);


  const stadiumGeometry =
    new THREE.CylinderGeometry(
      37,
      34,
      5,
      64,
      1,
      true
    );

  const stadiumMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x4b4f58,
      side: THREE.BackSide
    });

  const stadium =
    new THREE.Mesh(
      stadiumGeometry,
      stadiumMaterial
    );

  stadium.position.y = 2;

  scene.add(stadium);


  for(let i = 0; i < 32; i++){

    const angle =
      (i / 32) * Math.PI * 2;

    const x =
      Math.cos(angle) * 28;

    const z =
      Math.sin(angle) * 28;

    const stand =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          3,
          4,
          2
        ),
        new THREE.MeshStandardMaterial({
          color: 0x777b83
        })
      );

    stand.position.set(
      x,
      2,
      z
    );

    stand.lookAt(0,2,0);

    scene.add(stand);
  }
}


/* PITCH */

function createPitch() {

  const grass =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        13,
        13,
        0.15,
        64
      ),
      new THREE.MeshStandardMaterial({
        color: 0x20883b
      })
    );

  grass.position.y = 0;

  scene.add(grass);


  const pitch =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        4,
        0.12,
        22
      ),
      new THREE.MeshStandardMaterial({
        color: 0xc49a62
      })
    );

  pitch.position.y = 0.12;

  scene.add(pitch);


  const creaseMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xffffff
    });


  for(const z of [-8,8]){

    const crease =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          4.5,
          0.04,
          0.15
        ),
        creaseMaterial
      );

    crease.position.set(
      0,
      0.2,
      z
    );

    scene.add(crease);
  }


  createStumps(8);
  createStumps(-8);
}


/* STUMPS */

function createStumps(z) {

  for(let x of [-0.55,0,0.55]){

    const stump =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.08,
          0.08,
          2,
          12
        ),
        new THREE.MeshStandardMaterial({
          color: 0xffffff
        })
      );

    stump.position.set(
      x,
      1,
      z
    );

    stump.castShadow = true;

    scene.add(stump);
  }
}


/* PLAYER */

function createPlayer(
  color,
  z,
  scale
){

  const group =
    new THREE.Group();


  const body =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.45,
        0.55,
        1.5,
        16
      ),
      new THREE.MeshStandardMaterial({
        color
      })
    );

  body.position.y = 2;

  group.add(body);


  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.42,
        16,
        16
      ),
      new THREE.MeshStandardMaterial({
        color: 0xc98b67
      })
    );

  head.position.y = 3.15;

  group.add(head);


  const helmet =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.48,
        16,
        16,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2
      ),
      new THREE.MeshStandardMaterial({
        color: 0x20252c
      })
    );

  helmet.position.y = 3.2;

  group.add(helmet);


  const legMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xeeeeee
    });


  for(let x of [-0.22,0.22]){

    const leg =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.12,
          0.14,
          1.5,
          10
        ),
        legMaterial
      );

    leg.position.set(
      x,
      0.75,
      0
    );

    group.add(leg);
  }


  group.position.z = z;

  group.scale.setScalar(scale);

  group.traverse(
    object => {
      if(object.isMesh)
        object.castShadow = true;
    }
  );

  scene.add(group);

  return group;
}


/* PLAYERS */

function createPlayers() {

  batsman =
    createPlayer(
      0x1769e0,
      -7,
      1
    );

  bowler =
    createPlayer(
      0xd62828,
      7,
      0.95
    );


  bat =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.25,
        2.6,
        0.65
      ),
      new THREE.MeshStandardMaterial({
        color: 0xd5a34b
      })
    );

  bat.position.set(
    0.8,
    1.8,
    -7
  );

  bat.rotation.x =
    THREE.MathUtils.degToRad(15);

  scene.add(bat);
}


/* BALL */

function createBall() {

  ball =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.25,
        24,
        24
      ),
      new THREE.MeshStandardMaterial({
        color: 0xb51224
      })
    );

  ball.position.set(
    0,
    1,
    7
  );

  ball.castShadow = true;

  scene.add(ball);
}


/* FIELDERS */

function createFielders() {

  const positions = [
    [-10, -1],
    [10, -1],
    [-12, 8],
    [12, 8],
    [-7, 11],
    [7, 11],
    [-13, 4],
    [13, 4]
  ];


  positions.forEach(
    position => {

      const fielder =
        createPlayer(
          0x16a34a,
          position[1],
          0.65
        );

      fielder.position.x =
        position[0];

      fielders.push(
        fielder
      );
    }
  );
}


/* MATCH */

function startMatch() {

  runs = 0;
  wickets = 0;
  balls = 0;

  running = true;
  ballMoving = false;

  updateScore();

  startBtn.style.display =
    "none";

  messageEl.textContent =
    "Bowler is ready...";

  setTimeout(
    bowl,
    1000
  );
}


/* BOWL */

function bowl() {

  if(!running)
    return;

  ballMoving = true;
  ballProgress = 0;
  selectedShot = null;

  ball.position.set(
    0,
    1,
    7
  );

  messageEl.textContent =
    "Choose your shot!";
}


/* SHOT */

function playShot(type) {

  if(!running)
    return;

  if(!ballMoving)
    return;

  if(ballProgress < 0.72){

    messageEl.textContent =
      "Wait for the ball!";

    return;
  }

  selectedShot = type;

  ballMoving = false;

  balls++;

  let result = 0;

  if(type === "defend"){

    result = 0;

    messageEl.textContent =
      "DEFENDED!";
  }

  if(type === "drive"){

    result =
      Math.random() < 0.65
      ? 4
      : 2;

    messageEl.textContent =
      result === 4
      ? "FOUR!"
      : "GOOD DRIVE!";
  }

  if(type === "loft"){

    if(Math.random() < 0.25){

      wickets++;

      messageEl.textContent =
        "OUT!";

    }else{

      result =
        Math.random() < 0.5
        ? 6
        : 4;

      messageEl.textContent =
        result === 6
        ? "SIX!"
        : "FOUR!";
    }
  }

  runs += result;

  updateScore();

  animateShot();

  setTimeout(
    nextBall,
    1200
  );
}


/* SHOT ANIMATION */

function animateShot(){

  if(selectedShot === "defend"){

    bat.rotation.x =
      THREE.MathUtils.degToRad(60);

  }

  if(selectedShot === "drive"){

    bat.rotation.x =
      THREE.MathUtils.degToRad(-70);

  }

  if(selectedShot === "loft"){

    bat.rotation.x =
      THREE.MathUtils.degToRad(-120);

  }

  setTimeout(
    () => {

      bat.rotation.x =
        THREE.MathUtils.degToRad(15);

    },
    700
  );
}


/* NEXT BALL */

function nextBall(){

  if(
    wickets >= 3 ||
    balls >= 12
  ){

    running = false;

    messageEl.textContent =
      "INNINGS COMPLETE!";

    startBtn.textContent =
      "PLAY AGAIN";

    startBtn.style.display =
      "block";

    return;
  }

  setTimeout(
    bowl,
    700
  );
}


/* UPDATE BALL */

function updateBall(){

  if(!ballMoving)
    return;

  ballProgress += 0.018;

  const start =
    new THREE.Vector3(
      0,
      1,
      7
    );

  const end =
    new THREE.Vector3(
      0,
      1.2,
      -7
    );

  ball.position.lerpVectors(
    start,
    end,
    ballProgress
  );


  if(ballProgress >= 1){

    ballMoving = false;

    balls++;

    updateScore();

    messageEl.textContent =
      "DOT BALL";

    setTimeout(
      nextBall,
      700
    );
  }
}


/* CAMERA */

function updateCamera(){

  if(ballMoving){

    const target =
      ball.position.clone();

    camera.position.lerp(
      new THREE.Vector3(
        0,
        6,
        13
      ),
      0.04
    );

    camera.lookAt(
      target
    );

  }else{

    camera.position.lerp(
      new THREE.Vector3(
        0,
        7,
        16
      ),
      0.04
    );

    camera.lookAt(
      0,
      2,
      0
    );
  }
}


/* SCORE */

function updateScore(){

  runsEl.textContent =
    runs;

  wicketsEl.textContent =
    wickets;

  ballsEl.textContent =
    balls;
}


/* RESIZE */

function resize(){

  camera.aspect =
    window.innerWidth /
    window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
}


/* LOOP */

function animate(){

  requestAnimationFrame(
    animate
  );

  updateBall();

  updateCamera();

  renderer.render(
    scene,
    camera
  );
}