import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";

import starsTexture from "../img/stars.jpg";
import earthTexture from "../img/earth.jpg";

//import { getLatLngObj } from "tle.js";
//import { getGroundTracks } from 'tle.js';
const info = document.querySelector(".info");

const ISS_TLE = `1 25544U 98067A   22275.03521722  .00046746  00000+0  83199-3 0  9999
    2 25544  51.6418 167.2146 0003169 263.1060 229.2717 15.49661688361757`;

function GetTLE() {
  fetch("https://tle.ivanstanojevic.me/api/tle/25544")
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("There an error in the api");
      }
    })
    .then((data) => UpdateTLE(data))
    .catch((error) => console.log(error));
}

function UpdateTLE(data) {
  if (!data) return;
  new_TLE = data.line1 + "\n" + data.line2;
  if (new_TLE !== ISS_TLE) ISS_TLE = new_TLE;
}

let isOnISS = false;
let earthRot = true;

let isZoomed = true;
let path = false;

const ISSUrl = new URL("../assets/ISS.glb", import.meta.url);

const assetLoader = new GLTFLoader();

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 0, 50);

// ! Thirs Person Camera

let orbit = new OrbitControls(camera, renderer.domElement);

// orbit.update();

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
]);

const textureLoader = new THREE.TextureLoader();

const earthGeo = new THREE.SphereGeometry(14, 100, 100);
const earthMat = new THREE.MeshBasicMaterial({
  map: textureLoader.load(earthTexture),
  bumpMap: textureLoader.load("../img/elev_bump_4k.jpg"),
  bumpScale: 0.005,
  specularMap: textureLoader.load("../img/water_4k.png"),
});
const earth = new THREE.Mesh(earthGeo, earthMat);
scene.add(earth);

const cloudGeo = new THREE.SphereGeometry(20, 1000, 1000);
const cloudMat = new THREE.MeshPhongMaterial({
  map: textureLoader.load("../img/fair_clouds_4k.png"),
  transparent: true,
});
const cloud = new THREE.Mesh(cloudGeo, cloudMat);
scene.add(cloud);

// * HERE! ////////////////////

let model;
assetLoader.load(
  ISSUrl.href,
  function (gltf) {
    model = gltf.scene;

    earth.add(model);
    const jijelPos = calcPosFromLatLonRad(43.009953, -81.273613, 16.2);
    // model.rotateY(-5)

    model.position.set(jijelPos[0], jijelPos[1], jijelPos[2]);
    model.scale.set(0.007, 0.007, 0.007);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

const pointLight = new THREE.PointLight(0xffffff, 2, 300);
scene.add(pointLight);

const pointLight1 = new THREE.PointLight(0xffffff, 2, 300);
scene.add(pointLight1);
pointLight1.position.set(15, 15, 15);

function calcPosFromLatLonRad(lat, lon, radius) {
  var phi = (90 - lat) * (Math.PI / 180);
  var theta = (lon + 180) * (Math.PI / 180);

  x = -(radius * Math.sin(phi) * Math.cos(theta));
  z = radius * Math.sin(phi) * Math.sin(theta);
  y = radius * Math.cos(phi);

  return [x, y, z];
}

let latLonISS;
function getISS() {
  latLonISS = getLatLngObj(ISS_TLE);
  // console.log('js thing ==> '+ latLonISS.lat +'//'+ latLonISS.lng)

  model.position.set(
    calcPosFromLatLonRad(latLonISS.lat, latLonISS.lng, 16)[0],
    calcPosFromLatLonRad(latLonISS.lat, latLonISS.lng, 16)[1],
    calcPosFromLatLonRad(latLonISS.lat, latLonISS.lng, 16)[2]
  );
}

// var axisHelper2 = new THREE.AxesHelper(500)

const changeViewBtn = document.getElementById("chang-view");
const changeZoom = document.getElementById("chang-zoom");

// ! ANIMATE FUNCTION
function animate() {
  if (model) {
    getISS();
    renderer.render(scene, camera);
    // model.add(axisHelper2)
  }
  if (earthRot) {
    earth.rotateY(0.0002);
  } else {
    earth.rotateY(0);
  }
  orbit.update();

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

changeTarget();
_changeZoom();

// !    ===============intract section

function IsNeg(position, num) {
  if ((n = 0)) {
    return 0;
  }
  if (n < 0) {
    return -n;
  }
  return n;
}
console.log(IsNeg(-14, 2));

function _changeZoom() {
  changeZoom.addEventListener("click", () => {
    // camera.position.z = isZoomed ? -20 : 20

    gsap.to(camera.position, {
      duration: 0.5,
      x: isZoomed ? model.position.x * 1.15 : model.position.x * 2,
      z: isZoomed ? model.position.z * 1.15 : model.position.z * 2,
      y: isZoomed ? model.position.y * 1.15 : model.position.y * 2,
    });

    isZoomed = !isZoomed;

    changeZoom.innerText = isZoomed ? "zoom in +" : "zoom out -";
    orbit.update();
  });
}

function changeTarget() {
  changeViewBtn.addEventListener("click", () => {
    if (isOnISS) {
      changeViewBtn.innerText = "change to ISS view";
      orbit.target = earth.position;
    } else {
      changeViewBtn.innerText = "change to Earth view";
      if (model) {
        orbit.target = model.position;
      }
    }
    isOnISS = !isOnISS;
  });
  // stop earth rotation
  document.addEventListener("click", () => {
    earthRot = false;
    console.log("earthRot", earthRot);
  });
  renderer.render(scene, camera);
}

//! ============ ADDING PATH ==========

console.log(new Date().getTime());

const pathTriger = document.getElementById("pathTrigerk");
GetISSPath();
function GetISSPath() {
  getGroundTracks({
    tle: ISS_TLE,
    stepMS: 500,
    startTimeMS: new Date().getTime(),
    isLngLatFormat: false,
  }).then((result) => {
    let line = null;

    pathTriger.addEventListener("click", () => {
      console.log("clicked");
      if (line) {
        scene.remove(line);
        line = null;
        return;
      }
      const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
      const points = [];

      result[1].forEach((value) => {
        points.push(LatLonToPos(value[0], value[1], 16));
      });
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      line = new THREE.Line(geometry, material);
      scene.add(line);
      console.log(line);
    });
  });
}

function LatLonToPos(lat, lon, earthRadius) {
  var phi = (90 - lat) * (Math.PI / 180);
  var theta = (lon + 180) * (Math.PI / 180);

  x = -(earthRadius * Math.sin(phi) * Math.cos(theta));
  y = earthRadius * Math.cos(phi);
  z = earthRadius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

// !============== info ===============
import { getSatelliteInfo } from "tle.js";
const satInfo = getSatelliteInfo(
  ISS_TLE, // Satellite TLE string or array.
  new Date().getTime(), // Timestamp (ms)
  34.243889, // Observer latitude (degrees)
  -116.911389, // Observer longitude (degrees)
  0 // Observer elevation (km)
);
function updateInfo() {
  info.innerHTML = `
            Lat: ${satInfo.lat} <br>
            Lng: ${satInfo.lng} <br>
            height: ${satInfo.height} <br>
            azimuth: ${satInfo.azimuth} <br>
            range: ${satInfo.range} <br>
            velocity: ${satInfo.velocity} <br>
            elevation: ${satInfo.elevation}
        `;
}
setInterval(() => {
  updateInfo();
}, 500);

const StartTraking = document.querySelector("#StartTraking");
StartTraking.addEventListener("click", () => {
  console.log("clicked");
  setInterval(() => {
    const traceGeo = new THREE.SphereGeometry(0.01, 30, 30);
    const traceMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
    });
    const trace = new THREE.Mesh(traceGeo, traceMat);

    latLonISS = getLatLngObj(ISS_TLE);
    earth.add(trace);
    trace.position.set(
      calcPosFromLatLonRad(latLonISS.lat, latLonISS.lng, 16)[0],
      calcPosFromLatLonRad(latLonISS.lat, latLonISS.lng, 16)[1],
      calcPosFromLatLonRad(latLonISS.lat, latLonISS.lng, 16)[2]
    );
  }, 5000);
  StartTraking.style.color = "black";
  StartTraking.style.backgroundColor = "white";
  StartTraking.style.cursor = "default";
});
