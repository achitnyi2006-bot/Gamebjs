import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const app = document.querySelector("#game");
app.innerHTML = `
  <div id="hud"><div class="logo">NEON <b>RUSH</b> <small>3D</small></div><div class="stat">SCORE <strong id="score">0000</strong><br>SPEED <strong id="speed">0</strong> KM/H</div></div>
  <div id="hint">STEER TO AVOID TRAFFIC</div>
  <div id="controls"><button id="left" aria-label="Steer left">◀</button><button id="boost" aria-label="Boost">BOOST</button><button id="right" aria-label="Steer right">▶</button></div>
  <div id="overlay"><div class="panel"><div class="eyebrow">NIGHT CITY • ARCADE RACING</div><h1 id="title">NEON<br>RUSH</h1><p id="message">Race through a glowing 3D city.</p><button id="start">START RUN</button><p class="tiny">Drag / swipe to steer · Avoid traffic</p></div></div>`;
const css = document.createElement("style");
css.textContent = `
#hud{position:absolute;z-index:2;top:calc(env(safe-area-inset-top,0px) + 12px);left:14px;right:14px;display:flex;justify-content:space-between;align-items:flex-start;pointer-events:none;text-shadow:0 0 12px #00dfff}
.logo{font-weight:1000;font-style:italic;letter-spacing:1px;font-size:20px}.logo b{color:#ff38d4}.logo small{font-size:10px;color:#69f7ff}
.stat{text-align:right;background:#050b20d9;border:1px solid #1cdcfb88;border-radius:10px;padding:8px 11px;font-size:10px;letter-spacing:1px;line-height:1.8}.stat strong{font-size:16px;color:#57f5ff}
#hint{position:absolute;z-index:2;top:88px;left:0;right:0;text-align:center;color:#9eefff;font-size:10px;letter-spacing:2px;pointer-events:none}
#controls{position:absolute;z-index:3;left:18px;right:18px;bottom:calc(env(safe-area-inset-bottom,0px) + 20px);display:flex;align-items:center;justify-content:space-between;pointer-events:none}
#controls button{pointer-events:auto;min-width:62px;height:58px;border:1px solid #36eaff;border-radius:17px;background:#06142bdc;color:white;font-weight:900;font-size:22px;box-shadow:0 0 20px #00cfff44;touch-action:none}
#controls #boost{font-size:12px;letter-spacing:2px;color:#ff8cf0;border-color:#ff3cd5}
#overlay{position:absolute;z-index:4;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;background:linear-gradient(#03071855,#030718db)}
#overlay.off{display:none}.panel{padding:25px 20px;width:min(92%,420px);border:1px solid #21ddff66;border-radius:22px;background:#050b20dc;box-shadow:0 0 55px #8d00ff25}
.eyebrow{font-size:10px;letter-spacing:2px;color:#6df5ff}#title{font-size:clamp(48px,15vw,76px);line-height:.83;font-weight:1000;font-style:italic;letter-spacing:-2px;margin:18px 0;color:#fff;text-shadow:0 0 14px #00dfff,0 0 34px #d000ff}
.panel p{color:#b6d6ef;font-size:14px}#start{margin-top:8px;padding:15px 32px;border:0;border-radius:12px;color:#fff;font-weight:900;letter-spacing:2px;background:linear-gradient(100deg,#00bfff,#8b20ff,#ff23c8);box-shadow:0 0 24px #00cfff44}.panel .tiny{font-size:10px;color:#86a9cc}
`;
document.head.append(css);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x040719);
scene.fog = new THREE.FogExp2(0x040719, 0.009);
const camera = new THREE.PerspectiveCamera(64, innerWidth / innerHeight, 0.1, 240);
camera.position.set(0, 5.4, 11.8);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
app.prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x7abaff, 0x170021, 2.1));
const moonLight = new THREE.DirectionalLight(0xa6caff, 2.2); moonLight.position.set(-8, 15, 5); scene.add(moonLight);
const glowA = new THREE.PointLight(0x00bfff, 45, 65); glowA.position.set(0, 8, 0); scene.add(glowA);
const glowB = new THREE.PointLight(0xff00c8, 24, 45); glowB.position.set(-9, 5, -16); scene.add(glowB);

const standard = (color, emissive = 0x000000, intensity = 1, metalness = .25, roughness = .35) =>
  new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: intensity, metalness, roughness });
const neonBlue = standard(0x11dfff, 0x00bfff, 2.5);
const neonPink = standard(0xff2ccf, 0xff00a8, 2.5);
const neonWhite = standard(0xd7faff, 0x66eaff, 1.6);
const roadMat = standard(0x080d20, 0x030718, .3, .45, .5);
const road = new THREE.Mesh(new THREE.PlaneGeometry(15, 240), roadMat);
road.rotation.x = -Math.PI / 2; road.position.set(0, -.08, -85); scene.add(road);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 300), standard(0x05091a));
ground.rotation.x = -Math.PI / 2; ground.position.set(0, -.16, -80); scene.add(ground);

const roadDecor = [];
for (let z = 18; z > -210; z -= 8) {
  for (const x of [-2.4, 2.4]) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(.08, .025, 3.4), neonBlue);
    dash.position.set(x, -.025, z); scene.add(dash); roadDecor.push(dash);
  }
}
for (const x of [-7.2, 7.2]) {
  const rail = new THREE.Mesh(new THREE.BoxGeometry(.16, .18, 240), neonPink);
  rail.position.set(x, .02, -85); scene.add(rail);
  const rail2 = new THREE.Mesh(new THREE.BoxGeometry(.1, .12, 240), neonBlue);
  rail2.position.set(x * .985, .2, -85); scene.add(rail2);
}

const buildings = [];
for (const side of [-1, 1]) {
  for (let i = 0; i < 44; i++) {
    const w = 2 + Math.random() * 3.5, h = 5 + Math.random() * 24, d = 3 + Math.random() * 5;
    const g = new THREE.Group();
    const wallMat = standard(side < 0 ? 0x101d44 : 0x211033, side < 0 ? 0x082b75 : 0x570044, .65, .3, .6);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat); wall.position.y = h / 2; g.add(wall);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + .15, .12, d + .15), side < 0 ? neonBlue : neonPink); roof.position.y = h; g.add(roof);
    const frontX = -side * (w / 2 + .015);
    for (let wy = 1.1; wy < h - .8; wy += 1.65) {
      for (let wz = -d / 2 + .5; wz < d / 2; wz += 1.0) {
        if (Math.random() > .35) {
          const win = new THREE.Mesh(new THREE.BoxGeometry(.045, .62, .48), Math.random() > .5 ? neonBlue : neonPink);
          win.position.set(frontX, wy, wz); g.add(win);
        }
      }
    }
    if (i % 5 === 0) {
      const sign = new THREE.Mesh(new THREE.BoxGeometry(.12, 1.6, Math.min(2.5, d)), side < 0 ? neonPink : neonBlue);
      sign.position.set(frontX * 1.03, h * .62, 0); g.add(sign);
    }
    g.position.set(side * (9 + Math.random() * 12), 0, 18 - i * 5.8);
    scene.add(g); buildings.push({ group: g, side });
  }
}

function makeCar(color, playerCar = false) {
  const g = new THREE.Group();
  const bodyMat = standard(color, color, playerCar ? .7 : .35, .75, .24);
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.65, .42, 3.15), bodyMat); body.position.y = .62; g.add(body);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.5, .18, 1.1), bodyMat); hood.position.set(0, .82, -1.0); g.add(hood);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.08, .5, 1.35), standard(0x101c37, 0x07507b, 1.2, .7, .18)); cabin.position.set(0, 1.0, .18); g.add(cabin);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(.95, .08, .95), standard(0x071226, color, .7)); roof.position.set(0, 1.28, .18); g.add(roof);
  const front = new THREE.Mesh(new THREE.BoxGeometry(1.25, .11, .08), neonWhite); front.position.set(0, .58, -1.59); g.add(front);
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.28, .12, .08), neonPink); back.position.set(0, .62, 1.59); g.add(back);
  for (const x of [-.87, .87]) {
    for (const z of [-1.05, 1.05]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.32, .32, .18, 12), standard(0x070a12, 0x0b1228, .4, .4));
      wheel.rotation.z = Math.PI / 2; wheel.position.set(x, .35, z); g.add(wheel);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .19, 10), neonBlue);
      hub.rotation.z = Math.PI / 2; hub.position.set(x * 1.005, .35, z); g.add(hub);
    }
  }
  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.45, .09, .25), standard(0x141a30, color, 1.4)); spoiler.position.set(0, 1.05, 1.42); g.add(spoiler);
  return g;
}
const player = makeCar(0x087dff, true);
player.position.set(0, 0, 4); scene.add(player);

const traffic = [];
let lane = 1, score = 0, speed = 105, running = false, spawnTimer = .5, boostTimer = 0;
const scoreEl = document.querySelector("#score"), speedEl = document.querySelector("#speed");
const overlay = document.querySelector("#overlay"), titleEl = document.querySelector("#title"), messageEl = document.querySelector("#message"), startBtn = document.querySelector("#start");
function setLane(n) { if (running) lane = Math.max(0, Math.min(2, lane + n)); }
document.querySelector("#left").addEventListener("pointerdown", () => setLane(-1));
document.querySelector("#right").addEventListener("pointerdown", () => setLane(1));
document.querySelector("#boost").addEventListener("pointerdown", () => { if (running) boostTimer = 2.5; });
addEventListener("keydown", e => { if (e.key === "ArrowLeft" || e.key === "a") setLane(-1); if (e.key === "ArrowRight" || e.key === "d") setLane(1); if (e.key === " " && !running) startGame(); if (e.key === "Shift" && running) boostTimer = 2.5; });
let startX = null;
renderer.domElement.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
renderer.domElement.addEventListener("touchend", e => { if (startX === null) return; const dx = e.changedTouches[0].clientX - startX; if (Math.abs(dx) > 25) setLane(dx > 0 ? 1 : -1); startX = null; }, { passive: true });

function spawnTraffic() {
  const colors = [0xff167f, 0xffb900, 0x9b44ff, 0x00e6a0];
  const l = Math.floor(Math.random() * 3);
  const car = makeCar(colors[Math.floor(Math.random() * colors.length)]);
  car.scale.setScalar(.88); car.position.set((l - 1) * 3, 0, -105);
  scene.add(car); traffic.push({ mesh: car, lane: l });
}
function startGame() {
  for (const t of traffic) scene.remove(t.mesh); traffic.length = 0;
  lane = 1; score = 0; speed = 105; spawnTimer = .7; boostTimer = 0; running = true;
  scoreEl.textContent = "0000"; startBtn.textContent = "RESTART"; overlay.classList.add("off");
}
function gameOver() {
  running = false; overlay.classList.remove("off"); titleEl.innerHTML = "RACE<br>OVER";
  messageEl.textContent = `Your score: ${Math.floor(score)} · Try again!`; startBtn.textContent = "RACE AGAIN";
}
startBtn.addEventListener("click", startGame);

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .04);
  const targetX = (lane - 1) * 3;
  player.position.x += (targetX - player.position.x) * Math.min(1, dt * 8);
  player.rotation.z = (player.position.x - targetX) * .045;
  camera.position.x += (player.position.x * .22 - camera.position.x) * dt * 2;
  camera.lookAt(player.position.x * .12, .6, -8);
  if (running) {
    const actualSpeed = speed + (boostTimer > 0 ? 65 : 0);
    if (boostTimer > 0) boostTimer -= dt;
    score += dt * actualSpeed * .18;
    scoreEl.textContent = String(Math.floor(score)).padStart(4, "0");
    speedEl.textContent = Math.floor(actualSpeed);
    spawnTimer -= dt;
    if (spawnTimer <= 0) { spawnTraffic(); spawnTimer = Math.max(.55, 1.25 - actualSpeed * .004) + Math.random() * .25; }
    for (const m of roadDecor) { m.position.z += actualSpeed * dt * .22; if (m.position.z > 22) m.position.z -= 228; }
    for (const b of buildings) { b.group.position.z += actualSpeed * dt * .11; if (b.group.position.z > 28) b.group.position.z -= 255; }
    for (let i = traffic.length - 1; i >= 0; i--) {
      const t = traffic[i]; t.mesh.position.z += actualSpeed * dt * .22;
      if (Math.abs(t.mesh.position.z - player.position.z) < 2.1 && Math.abs(t.mesh.position.x - player.position.x) < 1.35) { gameOver(); break; }
      if (t.mesh.position.z > 18) { scene.remove(t.mesh); traffic.splice(i, 1); }
    }
  }
  renderer.render(scene, camera);
}
animate();
addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); });
