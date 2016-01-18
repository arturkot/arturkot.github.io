---
---

T = THREE

return false unless (new T.WebGLRenderer())

#Globals
mouseXpos = false

# Basic elements
$container = document.getElementById 'js-3dcat'

# Settings
cameraX = -200
cameraY = 200
cameraZ = -200

# Setup
$container.className += ' threeActive'
w = $container.offsetWidth * 2
h = $container.offsetHeight * 2
scene = new T.Scene()
camera = new T.OrthographicCamera w / - 2, w / 2, h / 2, h / - 2, -1000, 1000
renderer = new T.WebGLRenderer { alpha: true }

# Utilities
textureLoader = new THREE.TextureLoader()
JSONLoader = new T.JSONLoader()

# Settings
renderer.antialias = true
renderer.setSize w, h
renderer.setClearColor 0x000000, 0
$container.appendChild renderer.domElement

# Textures
textureBody = new T.MeshPhongMaterial
  color: 0xCCCCCC
  map: textureLoader.load '/images/baked-occlusion-body.jpg'
  shininess: 1
  shading: T.FlatShading

textureHead = new T.MeshPhongMaterial
  color: 0xCCCCCC
  map: textureLoader.load '/images/baked-occlusion-face.jpg'
  shininess: 1
  shading: T.FlatShading

# Lights
hemisphereLight = new T.HemisphereLight 0x404040, 0xFEFEFE, 2

spotLight = new T.SpotLight
spotLight.intensity = 1.8
spotLight.position.set 400, 2000, 40

scene.add hemisphereLight
scene.add spotLight

# Geometry
theBody = null
theHead = null

drawCatBody = (bodyGeo) ->
  bodyGeo.applyMatrix new T.Matrix4().makeTranslation(0, 0, 1)
  theBody = new T.Mesh bodyGeo, textureBody
  theBody.position.set 0, 0, 0
  theBody.scale.set 140, 140, 140
  theBody.rotation.set 0, 90 * Math.PI / 180, 0
  scene.add theBody

drawCatHead = (headGeo) ->
  headGeo.applyMatrix new T.Matrix4().makeTranslation(0, 0, 1)
  theHead = new T.Mesh headGeo, textureHead
  theHead.position.set 0, 0, 0
  theHead.scale.set 140, 140, 140
  theHead.rotation.set 0, 90 * Math.PI / 180, 0
  scene.add theHead

JSONLoader.load '/geometry/3dcat-body.js', drawCatBody
JSONLoader.load '/geometry/3dcat-head.js', drawCatHead

# Update cat on mouse move
updateCat = ->
  if theBody and theHead and mouseXpos isnt false
    angle = 180 * mouseXpos / window.innerWidth
    theBody.rotation.set 0, (angle - 45) * Math.PI/ 180, 0
    theHead.rotation.set 0, (angle - 45) * Math.PI/ 180, 0

document.addEventListener 'mousemove', (e) ->
  mouseXpos = e.clientX

# Camera
camera.position.set cameraX + 1, cameraY + 1, cameraZ + 1
camera.lookAt new T.Vector3 cameraX, cameraY, cameraZ
camera.updateProjectionMatrix()

# Initate scene
animate = ->
  updateCat()
  renderer.render scene, camera
  requestAnimationFrame animate

animate()
