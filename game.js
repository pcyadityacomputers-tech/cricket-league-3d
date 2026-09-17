import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

let scene;
let camera;
let renderer;

let ball;
let bat;
let batsman;
let bowler;

let ballMoving = false;
let ballProgress = 0;
let gameRunning = false;
let shotLocked = false;

let runs = 0;
let wickets = 0;
let balls = 0;

const runsEl = document.getElementById("runs");
const wicketsEl = document.getElementById("wickets");
const ballsEl = document.getElementById("balls");
const messageEl = document.getElementById("message");
const startButton = document.getElementById("start");


/* =========================
   START 3D ENGINE
========================= */

scene = new THREE.Scene();

scene.background =
  new THREE.Color(0x78c8f5);


camera =
  new THREE.PerspectiveCamera(
    55,
    window.innerWidth /
    window.innerHeight,
    0.1,
    500
  );

camera.position.set(
  0,
  8,
  18
);


renderer =
  new THREE.WebGLRenderer({
    antialias: true
  });

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,
    2
  )
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

document.body.appendChild(
  renderer.domElement
);


/* =========================
   LIGHTING
========================= */

const skyLight =
  new THREE.HemisphereLight(
    0xffffff,
    0x345c35,
    2
  );

scene.add(skyLight);


const sun =
  new THREE.DirectionalLight(
    0xffffff,
    2.5
  );

sun.position.set(
  15,
  25,
  10
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

scene.add(sun);


/* =========================
   STADIUM
========================= */

function createStadium(){

  const ground =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        32,
        32,
        0.5,
        64
      ),
      new THREE.MeshStandardMaterial({
        color: 0x146b2d
      })
    );

  ground.position.y = -0.35;

  ground.receiveShadow = true;

  scene.add(ground);


  const outerRing =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        29,
        3.5,
        12,
        64
      ),
      new THREE.MeshStandardMaterial({
        color: 0x4c515a
      })
    );

  outerRing.rotation.x =
    Math.PI / 2;

  outerRing.position.y =
    1.5;

  scene.add(outerRing);


  /* Stadium lights */

  for(let i = 0; i < 6; i++){

    const angle =
      i / 6 *
      Math.PI * 2;

    const x =
      Math.cos(angle) * 25;

    const z =
      Math.sin(angle) * 25;


    const pole =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.15,
          0.15,
          9,
          12
        ),
        new THREE.MeshStandardMaterial({
          color: 0x333333
        })
      );

    pole.position.set(
      x,
      4.5,
      z
    );

    scene.add(pole);


    const lamp =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.4,
          0.4,
          0.5
        ),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xffffff,
          emissiveIntensity: 0.4
        })
      );

    lamp.position.set(
      x,
      9,
      z
    );

    scene.add(lamp);
  }
}


/* =========================
   FIELD
========================= */

function createField(){

  const field =
    new THREE.Mesh(
      new THREE.CircleGeometry(
        25,
        64
      ),
      new THREE.MeshStandardMaterial({
        color: 0x208b3d
      })
    );

  field.rotation.x =
    -Math.PI / 2;

  field.position.y =
    -0.05;

  field.receiveShadow = true;

  scene.add(field);


  /* inner field */

  const inner =
    new THREE.Mesh(
      new THREE.CircleGeometry(
        15,
        64
      ),
      new THREE.MeshStandardMaterial({
        color: 0x299b45
      })
    );

  inner.rotation.x =
    -Math.PI / 2;

  inner.position.y =
    0.01;

  scene.add(inner);
}


/* =========================
   PITCH
========================= */

function createPitch(){

  const pitch =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        4.2,
        0.15,
        22
      ),
      new THREE.MeshStandardMaterial({
        color: 0xc39a63
      })
    );

  pitch.position.y =
    0.08;

  pitch.receiveShadow = true;

  scene.add(pitch);


  const white =
    new THREE.MeshBasicMaterial({
      color: 0xffffff
    });


  for(const z of [-8,8]){

    const crease =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          4.8,
          0.04,
          0.15
        ),
        white
      );

    crease.position.set(
      0,
      0.18,
      z
    );

    scene.add(crease);
  }


  createWickets(8);
  createWickets(-8);
}


/* =========================
   WICKETS
========================= */

function createWickets(z){

  for(
    const x of [-0.55,0,0.55]
  ){

    const stump =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.07,
          0.07,
          1.8,
          12
        ),
        new THREE.MeshStandardMaterial({
          color: 0xffffff
        })
      );

    stump.position.set(
      x,
      0.95,
      z
    );

    stump.castShadow = true;

    scene.add(stump);
  }


  for(
    const x of [-0.275,0.275]
  ){

    const bail =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.04,
          0.04,
          0.7,
          10
        ),
        new THREE.MeshStandardMaterial({
          color: 0xf4d35e
        })
      );

    bail.rotation.z =
      Math.PI / 2;

    bail.position.set(
      x,
      1.85,
      z
    );

    scene.add(bail);
  }
}


/* =========================
   PLAYER
========================= */

function createPlayer(
  shirtColor,
  scale = 1
){

  const player =
    new THREE.Group();


  const shirt =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.5,
        0.65,
        1.5,
        20
      ),
      new THREE.MeshStandardMaterial({
        color: shirtColor
      })
    );

  shirt.position.y =
    2.2;

  player.add(shirt);


  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.43,
        20,
        20
      ),
      new THREE.MeshStandardMaterial({
        color: 0xb97852
      })
    );

  head.position.y =
    3.35;

  player.add(head);


  const helmet =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.49,
        20,
        12,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2
      ),
      new THREE.MeshStandardMaterial({
        color: 0x17202a
      })
    );

  helmet.position.y =
    3.45;

  player.add(helmet);


  const legMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xe8e8e8
    });


  for(
    const x of [-0.22,0.22]
  ){

    const leg =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.12,
          0.15,
          1.7,
          12
        ),
        legMaterial
      );

    leg.position.set(
      x,
      0.75,
      0
    );

    player.add(leg);
  }


  player.scale.setScalar(scale);

  player.traverse(
    object => {

      if(object.isMesh){

        object.castShadow = true;

        object.receiveShadow = true;
      }
    }
  );


  return player;
}


/* =========================
   BATSMAN
========================= */

function createBatsman(){

  batsman =
    createPlayer(
      0x1261d6,
      1.1
    );

  batsman.position.set(
    0,
    0,
    -7
  );

  scene.add(batsman);


  bat =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.32,
        2.8,
        0.7
      ),
      new THREE.MeshStandardMaterial({
        color: 0xd6a84f
      })
    );

  bat.position.set(
    0.8,
    1.8,
    -7
  );

  bat.rotation.z =
    THREE.MathUtils.degToRad(-12);

  bat.castShadow = true;

  scene.add(bat);
}


/* =========================
   BOWLER
========================= */

function createBowler(){

  bowler =
    createPlayer(
      0xdc2635,
      1
    );

  bowler.position.set(
    0,
    0,
    7
  );

  scene.add(bowler);
}


/* =========================
   FIELDERS
========================= */

function createFielders(){

  const positions = [

    [-11,2],
    [11,2],
    [-13,9],
    [13,9],
    [-8,13],
    [8,13],
    [-15,6],
    [15,6]

  ];


  positions.forEach(
    ([x,z]) => {

      const fielder =
        createPlayer(
          0x18a558,
          0.65
        );

      fielder.position.set(
        x,
        0,
        z
      );

      scene.add(
        fielder
      );
    }
  );
}


/* =========================
   BALL
========================= */

function createBall(){

  ball =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.25,
        24,
        24
      ),
      new THREE.MeshStandardMaterial({
        color: 0xc91429
      })
    );

  ball.castShadow = true;

  ball.position.set(
    0,
    1,
    7
  );

  scene.add(ball);
}


/* =========================
   SHOT
========================= */

function playShot(type){

  if(!gameRunning)
    return;

  if(!ballMoving)
    return;

  if(shotLocked)
    return;

  if(ballProgress < 0.72){

    messageEl.textContent =
      "Too early!";

    return;
  }


  shotLocked = true;

  ballMoving = false;

  balls++;


  let score = 0;


  if(type === "defend"){

    score = 0;

    messageEl.textContent =
      "DEFENDED";
  }


  if(type === "drive"){

    if(
      Math.random() < 0.7
    ){

      score = 4;

      messageEl.textContent =
        "FOUR!";

    }else{

      score = 2;

      messageEl.textContent =
        "2 RUNS!";
    }
  }


  if(type === "loft"){

    if(
      Math.random() < 0.25
    ){

      wickets++;

      messageEl.textContent =
        "OUT!";

    }else{

      score =
        Math.random() < 0.5
        ? 6
        : 4;

      messageEl.textContent =
        score === 6
        ? "SIX!"
        : "FOUR!";
    }
  }


  runs += score;

  updateScore();

  animateBat(type);


  setTimeout(
    nextBall,
    1300
  );
}


/* =========================
   BAT ANIMATION
========================= */

function animateBat(type){

  let angle = 0;


  if(type === "defend")
    angle = 55;

  if(type === "drive")
    angle = -70;

  if(type === "loft")
    angle = -120;


  bat.rotation.z =
    THREE.MathUtils.degToRad(
      angle
    );


  setTimeout(
    () => {

      bat.rotation.z =
        THREE.MathUtils.degToRad(-12);

    },
    600
  );
}


/* =========================
   BOWL
========================= */

function bowl(){

  if(!gameRunning)
    return;


  ballMoving = true;

  shotLocked = false;

  ballProgress = 0;


  ball.position.set(
    0,
    1,
    7
  );


  messageEl.textContent =
    "BALL COMING!";
}


/* =========================
   BALL MOVEMENT
========================= */

function updateBall(){

  if(!ballMoving)
    return;


  ballProgress +=
    0.018;


  const start =
    new THREE.Vector3(
      0,
      1,
      7
    );


  const end =
    new THREE.Vector3(
      0,
      1.25,
      -7
    );


  ball.position.lerpVectors(
    start,
    end,
    ballProgress
  );


  ball.rotation.x +=
    0.25;


  ball.rotation.z +=
    0.15;


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


/* =========================
   NEXT BALL
========================= */

function nextBall(){

  if(
    balls >= 12 ||
    wickets >= 3
  ){

    gameRunning = false;

    messageEl.textContent =
      "INNINGS COMPLETE!";

    startButton.textContent =
      "PLAY AGAIN";

    startButton.style.display =
      "block";

    return;
  }


  setTimeout(
    bowl,
    700
  );
}


/* =========================
   SCORE
========================= */

function updateScore(){

  runsEl.textContent =
    runs;

  wicketsEl.textContent =
    wickets;

  ballsEl.textContent =
    balls;
}


/* =========================
   CAMERA
========================= */

function updateCamera(){

  if(ballMoving){

    camera.position.lerp(
      new THREE.Vector3(
        0,
        5.5,
        14
      ),
      0.04
    );

    camera.lookAt(
      ball.position
    );

  }else{

    camera.position.lerp(
      new THREE.Vector3(
        0,
        6.5,
        15
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


/* =========================
   START MATCH
========================= */

startButton.onclick =
function(){

  runs = 0;
  wickets = 0;
  balls = 0;

  gameRunning = true;

  updateScore();

  startButton.style.display =
    "none";

  messageEl.textContent =
    "GET READY!";

  setTimeout(
    bowl,
    1000
  );
};


/* =========================
   BUTTONS
========================= */

document
.querySelectorAll(".shot")
.forEach(
  button => {

    button.addEventListener(
      "pointerdown",
      () => {

        playShot(
          button.dataset.shot
        );

      }
    );
  }
);


/* =========================
   RESIZE
========================= */

window.addEventListener(
  "resize",
  () => {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

  }
);


/* =========================
   CREATE WORLD
========================= */

createStadium();
createField();
createPitch();
createBatsman();
createBowler();
createFielders();
createBall();


/* =========================
   GAME LOOP
========================= */

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

animate();