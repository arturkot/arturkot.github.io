import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  TextureLoader,
  MeshPhongMaterial,
  FlatShading,
  SpotLight,
  HemisphereLight,
  Matrix4,
  Mesh,
  Vector3,
} from "https://cdn.skypack.dev/three@0.138.2";
import { GLTFLoader } from "/js/GLTFLoader.js";

const ANIMATION_SPEED = 4;
const cameraX = -200;
const cameraY = 200;
const cameraZ = -200;

const isHoverSupport = matchMedia("(hover: hover").matches;
let catCenterXpos = window.innerWidth / 2;
let catCenterYpos = 280;
let mouseXpos = false;
let mouseYpos = false;
let isAnimating = false;
let startAngle = 0;
let currentAngle = 0;

const $container = document.getElementById("js-3dcat");

$container.classList.add("threeActive");
const w = $container.offsetWidth * 2;
const h = $container.offsetHeight * 2;
const scene = new Scene();
const camera = new OrthographicCamera(
  w / -2,
  w / 2,
  h / 2,
  h / -2,
  -1000,
  1000
);
const renderer = new WebGLRenderer({ alpha: true });
const textureLoader = new TextureLoader();
const loader = new GLTFLoader();

renderer.antialias = true;
renderer.setSize(w, h);
renderer.setClearColor(0x000000, 0);
$container.appendChild(renderer.domElement);

const textureBody = new MeshPhongMaterial({
  color: 0xcccccc,
  map: textureLoader.load("/images/baked-occlusion-body.jpg"),
  shininess: 1,
  shading: FlatShading,
});

const hemisphereLight = new HemisphereLight(0x404040, 0xfefefe, 2);
const spotLight = new SpotLight();
spotLight.intensity = 1.8;
spotLight.position.set(400, 2000, 40);

scene.add(hemisphereLight);
scene.add(spotLight);

const theBody = null;
const easeOutQuad = (t) => t * (2 - t);

const drawCatBody = (gltf) => {
  const bodyGeo = gltf.scene.children[0].geometry;
  bodyGeo.applyMatrix(new Matrix4().makeTranslation(0, 0, 1));
  const theBody = new Mesh(bodyGeo, textureBody);
  theBody.position.set(0, 0, 0);
  theBody.scale.set(140, 140, 140);
  theBody.rotation.set(0, (currentAngle * Math.PI) / 180, 0);
  scene.add(theBody);
};

loader.load("/geometry/3dcat-body.gltf", drawCatBody);

const updateCat = () => {
  if (!theBody || !mouseXpos) return;

  if (mouseYpos < catCenterYpos + 100) mouseYpos = catCenterYpos;
  const atan2 = Math.atan2(
    catCenterYpos - mouseYpos,
    catCenterXpos - mouseXpos
  );
  const targetAngle = (atan2 * -180) / Math.PI - 45;

  if (!isHoverSupport) {
    if (targetAngle === currentAngle) return;
    if (!isAnimating) startAngle = currentAngle;
    let updateAngle = currentAngle;

    if (isAnimating) {
      updateAngle =
        startAngle +
        easeOutQuad(
          Math.abs(currentAngle - startAngle) /
            Math.abs(targetAngle - startAngle)
        ) *
          (targetAngle - startAngle);
    }

    if (currentAngle < targetAngle) {
      currentAngle += ANIMATION_SPEED;
      isAnimating = true;
      if (targetAngle < currentAngle) {
        isAnimating = false;
        currentAngle = targetAngle;
      }
    }

    if (currentAngle > targetAngle) {
      currentAngle -= ANIMATION_SPEED;
      isAnimating = true;
      if (targetAngle > currentAngle) {
        isAnimating = false;
        currentAngle = targetAngle;
      }
    }
  }

  theBody.rotation.set(0, (targetAngle * Math.PI) / 180, 0);
};

document.addEventListener("mousemove", (e) => {
  mouseXpos = e.clientX;
  mouseYpos = e.clientY;
});

window.addEventListener("resize", () => {
  catCenterXpos = window.innerWidth / 2;
});

camera.position.set(cameraX + 1, cameraY + 1, cameraZ + 1);
camera.lookAt(new Vector3(cameraX, cameraY, cameraZ));
camera.updateProjectionMatrix();

function animate() {
  updateCat();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// ---
// ---
//
// T = THREE
//
// unless new T.WebGLRenderer()
//   htmlEl = document.getElementsByTagName('html')[0]
//   htmlEl.classList.add 'is-no-webgl'
//   return
//

// # Lights
// hemisphereLight = new T.HemisphereLight 0x404040, 0xFEFEFE, 2
//
// spotLight = new T.SpotLight
// spotLight.intensity = 1.8
// spotLight.position.set 400, 2000, 40
//
// scene.add hemisphereLight
// scene.add spotLight
//
// # Geometry
// theBody = null
//
// easeOutQuad = (t) -> t * (2 - t)
//
// drawCatBody = (bodyGeo) ->
//   bodyGeo.applyMatrix new T.Matrix4().makeTranslation(0, 0, 1)
//   theBody = new T.Mesh bodyGeo, textureBody
//   theBody.position.set 0, 0, 0
//   theBody.scale.set 140, 140, 140
//   theBody.rotation.set 0, currentAngle * Math.PI / 180, 0
//   scene.add theBody
//
// JSONLoader.load '/geometry/3dcat-body.json', drawCatBody
//
// # Update cat on mouse move
// updateCat = ->
//   if theBody and mouseXpos isnt false
//     mouseYpos = catCenterYpos + 100 if mouseYpos < catCenterYpos + 100
//     atan2 = Math.atan2(catCenterYpos - mouseYpos, catCenterXpos - mouseXpos)
//     targetAngle =  (atan2 * -180 / Math.PI) - 45
//
//     # targetAngle = (180 * mouseXpos / window.innerWidth) - 45
//
//     if Modernizr.touchevents
//       return if targetAngle is currentAngle
//
//       startAngle = currentAngle unless isAnimating
//       updateAngle = currentAngle
//
//       if isAnimating
//         updateAngle = startAngle +
//         easeOutQuad(Math.abs(currentAngle - startAngle) /
//         Math.abs(targetAngle - startAngle)) *
//         (targetAngle - startAngle)
//
//       if currentAngle < targetAngle
//         currentAngle += ANIMATION_SPEED
//         isAnimating = yes
//         if targetAngle < currentAngle
//           isAnimating = no
//           currentAngle = targetAngle
//
//       if currentAngle > targetAngle
//         currentAngle -= ANIMATION_SPEED
//         isAnimating = yes
//         if targetAngle > currentAngle
//           isAnimating = no
//           currentAngle = targetAngle
//
//       theBody.rotation.set 0, updateAngle * Math.PI / 180, 0
//     else
//       theBody.rotation.set 0, targetAngle * Math.PI / 180, 0
//
// document.addEventListener 'mousemove', (e) ->
//   mouseXpos = e.clientX
//   mouseYpos = e.clientY
//
// window.addEventListener 'resize', ->
//   catCenterXpos = window.innerWidth / 2
//
// # Camera
// camera.position.set cameraX + 1, cameraY + 1, cameraZ + 1
// camera.lookAt new T.Vector3 cameraX, cameraY, cameraZ
// camera.updateProjectionMatrix()
//
// # Initate scene
// animate = ->
//   updateCat()
//   renderer.render scene, camera
//   requestAnimationFrame animate
//
// animate()
