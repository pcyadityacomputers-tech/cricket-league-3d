import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

/* =========================
   CRICKET ARENA 3D
========================= */

let scene, camera, renderer;
let ball, bat, batsman, bowler;
let ballMoving = false;
let ballProgress = 0;
let gameRunning = false;
let shotPlayed = false;

let runs = 0;
let wickets = 0;
let balls = 0;

const runsEl = document.getElementById("runs");
const wicketsEl = document.getElementById("wickets");
const ballsEl = document.getElementById("balls");
const messageEl = document.getElementById("message");
const startButton = document.getElementById("start");

/* =========================
   SCENE
========================= */

scene = new THREE.Scene();

scene.background = new THREE.Color(0x79c8f5);

scene.fog = new THREE.Fog(
  0x79c8f5,
  35,
  100
);

/* =========================
   CAMERA
========================= */

camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);

camera.position.set(
  0,
  8,
  17
);

/* =========================
   RENDERER
========================= */

renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

document.body.appendChild(
  renderer.domElement
);

/* =========================
   LIGHT
========================= */

const ambient =
  new THREE.HemisphereLight(
    0xffffff,
    0x315c38,
    2.2
  );

scene.add(ambient);

const sun =
  new THREE.DirectionalLight(
    0xffffff,
    3
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

function createStadium() {

  /* Main stadium ground */

  const stadiumGround =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        40,
        40,
        0.6,
        64
      ),
      new THREE.MeshStandardMaterial({
        color: 0x175d2a
      })
    );

  stadiumGround.position.y = -0.45;
  stadiumGround.receiveShadow = true;

  scene.add(stadiumGround);

  /* Seating ring */

  const seats =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        32,
        5,
        16,
        96
      ),
      new THREE.MeshStandardMaterial({
        color: 0x414750
      })
    );

  seats.rotation.x =
    Math.PI / 2;

  seats.position.y = 1.2;

  scene.add(seats);

  /* Stadium lights */

  for (let i = 0; i < 6; i++) {

    const angle =
      (i / 6) * Math.PI * 2;

    const x =
      Math.cos(angle) * 29;

    const z =
      Math.sin(angle) * 29;

    const pole =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.18,
          0.18,
          12,
          12
        ),
        new THREE.MeshStandardMaterial({
          color: 0x25282d
        })
      );

    pole.position.set(
      x,
      6,
      z
    );

    pole.castShadow = true;

    scene.add(pole);

    const lamp =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          2,
          0.5,
          0.8
        ),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xffffff,
          emissiveIntensity: 0.6
        })
      );

    lamp.position.set(
      x,
      12,
      z
    );

    scene.add(lamp);
  }
}

/* =========================
   FIELD
========================= */

function createField() {

  const field =
    new THREE.Mesh(
      new THREE.CircleGeometry(
        27,
        96
      ),
      new THREE.MeshStandardMaterial({
        color: 0x249447
      })
    );

  field.rotation.x =
    -Math.PI / 2;

  field.position.y = -0.08;

  field.receiveShadow = true;

  scene.add(field);

  /* Inner circle */

  const inner =
    new THREE.Mesh(
      new THREE.RingGeometry(
        12,
        12.12,
        96
      ),
      new THREE.MeshBasicMaterial({
        color: 0xd8f0d8,
        side: THREE.DoubleSide
      })
    );

  inner.rotation.x =
    -Math.PI / 2;

  inner.position.y = 0.02;

  scene.add(inner);
}

/* =========================
   PITCH
========================= */

function createPitch() {

  const pitch =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        4.5,
        0.18,
        22
      ),
      new THREE.MeshStandardMaterial({
        color: 0xc49a62
      })
    );

  pitch.position.y = 0.08;

  pitch.receiveShadow = true;

  scene.add(pitch);

  const lineMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

  for (const z of [-8, 8]) {

    const crease =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          4.8,
          0.05,
          0.18
        ),
        lineMaterial
      );

    crease.position.set(
      0,
      0.2,
      z
    );

    scene.add(crease);
  }

  createWickets(-8);
  createWickets(8);
}

/* =========================
   WICKETS
========================= */

function createWickets(z) {

  for (const x of [-0.55, 0, 0.55]) {

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
      1,
      z
    );

    stump.castShadow = true;

    scene.add(stump);
  }

  for (const x of [-0.275, 0.275]) {

    const bail =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.55,
          0.07,
          0.07
        ),
        new THREE.MeshStandardMaterial({
          color: 0xf3c64e
        })
      );

    bail.position.set(
      x,
      1.9,
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
  scale
) {

  const player =
    new THREE.Group();

  /* Body */

  const body =
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

  body.position.y = 2.2;

  player.add(body);

  /* Head */

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

  head.position.y = 3.35;

  player.add(head);

  /* Helmet */

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

  helmet.position.y = 3.48;

  player.add(helmet);

  /* Legs */

  const legMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xe7e7e7
    });

  for (const x of [-0.22, 0.22]) {

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

      if (object.isMesh) {

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

function createBatsman() {

  batsman =
    createPlayer(
      0x1464d8,
      1.1
    );

  batsman.position.set(
    0,
    0,
    -7
  );

  scene.add(batsman);

  /* Bat */

  bat =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.35,
        2.8,
        0.75
      ),
      new THREE.MeshStandardMaterial({
        color: 0xd8a84e
      })
    );

  bat.position.set(
    0.85,
    1.8,
    -7
  );

  bat.rotation.z =
    THREE.MathUtils.degToRad(-15);

  bat.castShadow = true;

  scene.add(bat);
}

/* =========================
   BOWLER
========================= */

function createBowler() {

  bowler =
    createPlayer(
      0xdc2738,
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

function createFielders() {

  const positions = [
    [-11, 2],
    [11, 2],
    [-13, 8],
    [13, 8],
    [-9, 14],
    [9, 14],
    [-17, 5],
    [17, 5]
  ];

  positions.forEach(
    ([x, z]) => {

      const fielder =
        createPlayer(
          0x18a85b,
          0.65
        );

      fielder.position.set(
        x,
        0,
        z
      );

      scene.add(fielder);

    }
  );
}

/* =========================
   BALL
========================= */

function createBall() {

  ball =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.25,
        24,
        24
      ),
      new THREE.MeshStandardMaterial({
        color: 0xd7192f
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
   START MATCH
========================= */

startButton.onclick = () => {

  runs = 0;
  wickets = 0;
  balls = 0;

  gameRunning = true;
  ballMoving = false;
  shotPlayed = false;

  updateScore();

  startButton.style.display =
    "none";

  messageEl.textContent =
    "GET READY!";

  setTimeout(
    bowlBall,
    1000
  );
};

/* =========================
   BOWL
========================= */

function bowlBall() {

  if (!gameRunning)
    return;

  ballMoving = true;
  shotPlayed = false;
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
   SHOT
========================= */

function playShot(type) {

  if (!gameRunning)
    return;

  if (!ballMoving)
    return;

  if (shotPlayed)
    return;

  /* Timing */

  if (ballProgress < 0.68) {

    messageEl.textContent =
      "TOO EARLY!";

    return;
  }

  shotPlayed = true;
  ballMoving = false;

  balls++;

  let result = 0;

  if (type === "defend") {

    result = 0;

    messageEl.textContent =
      "DEFENDED";
  }

  if (type === "drive") {

    if (Math.random() < 0.7) {

      result = 4;

      messageEl.textContent =
        "FOUR!";

    } else {

      result = 2;

      messageEl.textContent =
        "2 RUNS!";
    }
  }

  if (type === "loft") {

    if (Math.random() < 0.22) {

      wickets++;

      messageEl.textContent =
        "OUT!";

    } else {

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

  swingBat(type);

  setTimeout(
    nextBall,
    1200
  );
}

/* =========================
   BAT ANIMATION
========================= */

function swingBat(type) {

  let angle = -15;

  if (type === "defend")
    angle = 45;

  if (type === "drive")
    angle = -70;

  if (type === "loft")
    angle = -120;

  bat.rotation.z =
    THREE.MathUtils.degToRad(
      angle
    );

  setTimeout(
    () => {

      bat.rotation.z =
        THREE.MathUtils.degToRad(-15);

    },
    550
  );
}

/* =========================
   BALL ANIMATION
========================= */

function updateBall() {

  if (!ballMoving)
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
      1.25,
      -7
    );

  ball.position.lerpVectors(
    start,
    end,
    ballProgress
  );

  ball.rotation.x += 0.3;
  ball.rotation.z += 0.2;

  if (ballProgress >= 1) {

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

function nextBall() {

  if (
    balls >= 12 ||
    wickets >= 3
  ) {

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
    bowlBall,
    700
  );
}

/* =========================
   SCORE
========================= */

function updateScore() {

  runsEl.textContent = runs;
  wicketsEl.textContent = wickets;
  ballsEl.textContent = balls;
}

/* =========================
   CONTROLS
========================= */

document
  .querySelectorAll(".shot")
  .forEach(button => {

    button.addEventListener(
      "pointerdown",
      () => {

        playShot(
          button.dataset.shot
        );

      }
    );

  });

/* =========================
   CAMERA
========================= */

function updateCamera() {

  if (ballMoving) {

    camera.position.lerp(
      new THREE.Vector3(
        0,
        5.8,
        15
      ),
      0.04
    );

    camera.lookAt(
      ball.position
    );

  } else {

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
   BUILD WORLD
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

function animate() {

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