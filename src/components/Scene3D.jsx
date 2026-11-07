import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { model } from "../data/product";

// Where the headphones stand in each section of the page (one pose per section, in order).
// x: -1 = left side, 1 = right side. turn / tilt: in turns (1 = a full turn). size: 1 = normal
// phoneY (optional): height on phones, where the model is always in the middle (normal is 0.14)
const poses = [
  { x: 0, y: 0.19, turn: -0.06, tilt: 0.02, size: 0.84 }, // hero
  { x: 0.55, y: 0, turn: 0.16, tilt: 0.05, size: 0.95 }, // sound
  { x: -0.55, y: 0, turn: -0.22, tilt: -0.04, size: 0.95 }, // silence
  { x: 0.55, y: 0.02, turn: 0.45, tilt: 0.06, size: 0.9 }, // battery (shows the back)
  { x: 0, y: 0.22, turn: 0.75, tilt: 0.08, size: 0.62 }, // big numbers
  { x: 0, y: -0.01, turn: 0.92, tilt: 0.05, size: 0.7, phoneY: 0.03 }, // colors (front, centered like a showroom)
  { x: -0.55, y: 0, turn: 1.12, tilt: 0.04, size: 0.78 }, // specs
  { x: 0, y: 0.2, turn: 0.94, tilt: 0.02, size: 0.6 }, // buy
];

// The model is one piece, so we find the ear cups ourselves.
// The cups are tilted, so for each cup we measure:
//   center: its middle point
//   axis:   the direction it faces (toward the head)
//   radius: its size
// Then the shader decides PIXEL BY PIXEL if a spot is the speaker cloth:
// it must face the head, sit deep inside the cushion, and be inside the middle circle.
// Everything else (cushion, rims, walls) keeps the chosen color.
const cups = {
  uMidX: { value: 0 }, // the middle between the two cups
  uCenterA: { value: new THREE.Vector3() }, uAxisA: { value: new THREE.Vector3() }, uRadA: { value: 1 }, // left cup
  uCenterB: { value: new THREE.Vector3() }, uAxisB: { value: new THREE.Vector3() }, uRadB: { value: 1 }, // right cup
  uCushion: { value: new THREE.Color("#0d0d0f") }, // color of the cloth
};

// The direction in which a cloud of points is thinnest (a flat cup is thin along its axis)
function thinnestDirection(points, center) {
  const c = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // 3x3 spread of the points
  points.forEach((p) => {
    const d = [p.x - center.x, p.y - center.y, p.z - center.z];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) c[i * 3 + j] += d[i] * d[j];
  });
  const big = c[0] + c[4] + c[8];
  // Repeating (big - spread) × v makes v turn toward the thinnest direction
  let v = new THREE.Vector3(1, 0.3, 0.1);
  for (let k = 0; k < 200; k++) {
    v = new THREE.Vector3(
      big * v.x - (c[0] * v.x + c[1] * v.y + c[2] * v.z),
      big * v.y - (c[3] * v.x + c[4] * v.y + c[5] * v.z),
      big * v.z - (c[6] * v.x + c[7] * v.y + c[8] * v.z)
    ).normalize();
  }
  return v;
}

function measureCups(source) {
  const geo = source.index ? source.clone() : mergeVertices(source.clone());
  geo.computeVertexNormals(); // the model came without them: needed for light and for "facing the head"
  geo.computeBoundingBox();
  const box = geo.boundingBox;
  const midX = (box.min.x + box.max.x) / 2;
  const cupLine = box.min.y + (box.max.y - box.min.y) * 0.45; // below this height are the cups

  const pos = geo.attributes.position;
  const sides = [[], []];
  for (let v = 0; v < pos.count; v++) {
    const p = new THREE.Vector3().fromBufferAttribute(pos, v);
    if (p.y < cupLine) sides[p.x < midX ? 0 : 1].push(p);
  }
  const measured = sides.map((points) => {
    const center = points.reduce((sum, p) => sum.add(p), new THREE.Vector3()).divideScalar(points.length);
    const axis = thinnestDirection(points, center);
    if ((midX - center.x) * axis.x < 0) axis.negate(); // make it point toward the head
    // Radius: almost the farthest point from the axis (ignore a few stray points)
    const dists = points
      .map((p) => {
        const rel = p.clone().sub(center);
        return rel.sub(axis.clone().multiplyScalar(rel.dot(axis))).length();
      })
      .sort((a, b) => a - b);
    return { center, axis, radius: dists[Math.floor(dists.length * 0.98)] };
  });

  cups.uMidX.value = midX;
  cups.uCenterA.value.copy(measured[0].center); cups.uAxisA.value.copy(measured[0].axis); cups.uRadA.value = measured[0].radius;
  cups.uCenterB.value.copy(measured[1].center); cups.uAxisB.value.copy(measured[1].axis); cups.uRadB.value = measured[1].radius;
  return geo;
}

// Shader code: how much this pixel is speaker cloth (0 = chosen color, 1 = dark cloth)
const insideGLSL = /* glsl */ `
uniform float uMidX, uRadA, uRadB;
uniform vec3 uCenterA, uAxisA, uCenterB, uAxisB, uCushion;
varying vec3 vLocalPos;
varying vec3 vLocalNor;
float insideAmount() {
  bool left = vLocalPos.x < uMidX;
  vec3 center = left ? uCenterA : uCenterB;
  vec3 axis = left ? uAxisA : uAxisB;
  float radius = left ? uRadA : uRadB;
  vec3 rel = vLocalPos - center;
  float along = dot(rel, axis);                                  // how far toward the head
  float fromMiddle = length(rel - along * axis) / radius;        // 0 = middle, 1 = edge of the cup
  float facing = smoothstep(0.35, 0.6, dot(normalize(vLocalNor), axis)); // looks at the head
  float deep = 1.0 - smoothstep(0.09, 0.12, along);              // sits deep, not on the cushion
  float circle = 1.0 - smoothstep(0.56, 0.6, fromMiddle);        // clean round edge
  return facing * deep * circle;
}
`;

// Mix two poses: t = 0 gives a, t = 1 gives b
const withPhone = (p) => ({ phoneY: 0.14, ...p });
const mix = (a, b, t) => {
  a = withPhone(a);
  b = withPhone(b);
  return Object.fromEntries(Object.keys(a).map((k) => [k, a[k] + (b[k] - a[k]) * t]));
};

function Headphones({ color, stage, spin, rtl }) {
  const { scene } = useGLTF(model.file);
  const group = useRef(null);
  const { viewport } = useThree(); // the visible space, in 3D units
  const phone = viewport.aspect < 0.9;

  // One shiny material for the body; inside the cups the shader paints dark, soft cloth
  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({ roughness: 0.4, metalness: 0.15, clearcoat: 0.55, clearcoatRoughness: 0.4 });
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, cups);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vLocalPos;\nvarying vec3 vLocalNor;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLocalPos = position;\nvLocalNor = normal;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\n" + insideGLSL)
        .replace(
          "#include <color_fragment>",
          "#include <color_fragment>\nfloat inside = insideAmount();\ndiffuseColor.rgb = mix(diffuseColor.rgb, uCushion, inside);"
        )
        // Cloth has no shine: rough, not metal, no clear coat
        .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.92, inside);")
        .replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\nmetalnessFactor *= 1.0 - inside;")
        .replace(
          "#include <lights_physical_fragment>",
          "#include <lights_physical_fragment>\nmaterial.clearcoat *= 1.0 - inside;\nmaterial.specularColor *= 1.0 - 0.85 * inside;"
        );
    };
    return m;
  }, []);

  const object = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((part) => {
      if (part.isMesh) {
        part.geometry = measureCups(part.geometry);
        part.material = material;
      }
    });
    return copy;
  }, [scene, material]);

  const target = useMemo(() => new THREE.Color(), []);
  useEffect(() => {
    target.set(color);
  }, [color, target]);

  const intro = useRef(0); // 0 → 1 in the first second: the headphones rise into place

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    // Move the body color softly toward the chosen one
    material.color.lerp(target, Math.min(1, delta * 6));
    intro.current = Math.min(1, intro.current + delta * 0.8);
    const ease = 1 - Math.pow(1 - intro.current, 3);

    // stage.current is like 2.4 = 40% of the way from section 2 to section 3
    const i = Math.min(poses.length - 1, Math.floor(stage.current));
    const p = mix(poses[i], poses[Math.min(poses.length - 1, i + 1)], stage.current - i);

    // Sizes in 3D units: the model is about 2 units tall
    const base = (viewport.height * (phone ? 0.36 : 0.62)) / 2;
    const want = {
      x: phone ? 0 : p.x * viewport.width * 0.42 * (rtl ? -1 : 1), // Arabic page: mirror left and right
      y: (phone ? viewport.height * p.phoneY : p.y * viewport.height) - (1 - ease) * 0.8,
      scale: base * p.size * (0.85 + 0.15 * ease),
      ry: p.turn * Math.PI * 2 + (1 - ease) * -1.2 + spin.current, // + the turn added by dragging
      rx: p.tilt * Math.PI * 2,
    };
    // Glide toward the target pose (smooth, no jumps)
    const k = Math.min(1, delta * 3.5);
    g.position.x += (want.x - g.position.x) * k;
    g.position.y += (want.y - g.position.y) * k;
    g.scale.setScalar(g.scale.x + (want.scale - g.scale.x) * k);
    g.rotation.y += (want.ry - g.rotation.y) * k;
    g.rotation.x += (want.rx - g.rotation.x) * k;
  });

  return (
    <group ref={group} scale={0.01}>
      <Center>
        <primitive object={object} />
      </Center>
      {/* A soft light between the two cups, so the inner sides of the cushions show
          their real color instead of falling into dark shadow */}
      <pointLight position={[0, -0.4, 0]} intensity={1.6} decay={0} color="#fff6ea" />
    </group>
  );
}

// stage: a ref with the current section (with fractions while scrolling)
// spin: a ref with the extra turn from dragging with the mouse or finger
export default function Scene3D({ color, stage, spin, rtl }) {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 30 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      {/* Rim lights from behind: bright edges, so dark colors stand out */}
      <directionalLight position={[-5, 2, -5]} intensity={3.2} />
      <directionalLight position={[5, 1, -5]} intensity={3.2} />

      {/* Studio reflections made of light panels (no download needed) */}
      <Environment resolution={256}>
        <Lightformer intensity={2.2} position={[0, 5, 2]} scale={[10, 2, 1]} />
        <Lightformer intensity={1.2} position={[-6, 1, 1]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer intensity={1.2} position={[6, 1, 1]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer intensity={4} position={[-3, 1, -5]} scale={[2, 8, 1]} />
        <Lightformer intensity={4} position={[3, 1, -5]} scale={[2, 8, 1]} />
      </Environment>

      <Headphones color={color} stage={stage} spin={spin} rtl={rtl} />
      <ContactShadows position={[0, -2.3, 0]} opacity={0.45} scale={12} blur={3} far={4} />
    </Canvas>
  );
}

useGLTF.preload(model.file);
