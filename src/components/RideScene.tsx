import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { advanceRide } from '@/lib/ride-motion';
import type { Specialty } from '@/lib/journey';

type SceneColors = { ember: string; chrome: string; background: string; muted: string };

function FlyThrough({ travel, reduced, specialty, colors }: { travel: RefObject<{ position: number; velocity: number }>; reduced: boolean; specialty: Specialty | null; colors: SceneColors }) {
  const tunnel = useRef<THREE.Group>(null);
  const shards = useRef<THREE.Group>(null);
  useFrame(({ camera }, rawDelta) => {
    const dt = Math.min(rawDelta, .05);
    if (!tunnel.current || !shards.current) return;
    tunnel.current.position.copy(camera.position);
    tunnel.current.quaternion.copy(camera.quaternion);
    const t = travel.current.position;
    tunnel.current.visible = !reduced && t > .08;
    tunnel.current.children.forEach((portal, i) => {
      const phase = ((t * 9 + i / 7) % 1 + 1) % 1;
      portal.position.set(Math.sin(i * 2.4) * 1.6, Math.cos(i * 1.7) * 1.2, -52 + phase * 58);
      portal.rotation.z = t * 4 + i * .48;
      portal.scale.setScalar(1 + phase * .35);
    });
    shards.current.position.copy(camera.position);
    shards.current.quaternion.copy(camera.quaternion);
    shards.current.visible = !reduced && t > .12;
    shards.current.children.forEach((shard, i) => {
      const phase = ((t * 6 + i / 12) % 1 + 1) % 1;
      const angle = i * 2.399;
      const radius = 4.5 + (i % 3) * 1.6;
      shard.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, -35 + phase * 42);
      shard.rotation.x += dt * (.2 + Math.abs(travel.current.velocity));
      shard.rotation.y = t * 7 + i;
      shard.scale.setScalar(.45 + phase * .8);
    });
  });
  return <>
    <group ref={tunnel}>{Array.from({ length: 7 }, (_, i) => <mesh key={i}>
      {specialty === 'web' ? <boxGeometry args={[12, 8, .07]} /> : <torusGeometry args={[6.5, i % 2 ? .025 : .055, 6, specialty === 'game' ? 4 : 64]} />}
      <meshStandardMaterial color={i % 2 ? colors.chrome : colors.ember} wireframe={specialty === 'web'} metalness={.7} roughness={.24} emissive={i % 2 ? colors.muted : colors.ember} emissiveIntensity={.25} />
    </mesh>)}</group>
    <group ref={shards}>{Array.from({ length: 12 }, (_, i) => <mesh key={i}>
      {specialty === 'game' ? <boxGeometry args={[.8, .8, .8]} /> : specialty === 'web' ? <octahedronGeometry args={[.7, 0]} /> : <icosahedronGeometry args={[.65, 0]} />}
      <meshStandardMaterial color={i % 3 ? colors.chrome : colors.ember} metalness={.8} roughness={i % 2 ? .18 : .5} />
    </mesh>)}</group>
  </>;
}

function World({ progress, reduced, specialty, colors }: { progress: RefObject<number>; reduced: boolean; specialty: Specialty | null; colors: SceneColors }) {
  const group = useRef<THREE.Group>(null);
  const travel = useRef({ position: 0, velocity: 0 });
  const rings = useRef<THREE.Group>(null);
  const bank = useRef(0);
  const speed = useRef(0);
  const target = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const rails = useMemo(() => [-1, 1].map(side => new THREE.CatmullRomCurve3(Array.from({ length: 100 }, (_, i) => {
    const t = i / 99 * Math.PI * 3.5;
    return new THREE.Vector3(Math.sin(t) * (5 + Math.cos(t) * 2) + side * .22, Math.cos(t) * 3 - 3, 3 - i * .42);
  }))), []);
  useFrame(({ camera, size }, rawDelta) => {
    const delta = Math.min(rawDelta, .05);
    if (reduced) {
      travel.current.position = progress.current;
      travel.current.velocity = 0;
    } else advanceRide(travel.current, progress.current, delta);
    const t = travel.current.position;
    const velocity = travel.current.velocity;
    speed.current = THREE.MathUtils.damp(speed.current, reduced ? 0 : Math.min(Math.abs(velocity) * 2.5, 1), 5, delta);
    if (reduced) { target.set(0, 1, 14); look.set(0, 0, -t * 30); }
    else {
      const surge = Math.tanh(velocity * 3);
      target.set(
        Math.sin(t * Math.PI * 3) * 6 + Math.sin(t * Math.PI * 7) * 1.5,
        1 + Math.sin(t * Math.PI * 5) * 3.4 - surge * 1.4,
        14 - t * 64 - surge * 3.5 + (size.width < 600 ? 7 * (1 - t) : 0),
      );
      look.set(Math.sin(t * Math.PI * 3 + .3) * 2.5, Math.sin(t * Math.PI * 5 + .2) * 1.2, -t * 64 - surge * 5);
    }
    camera.position.copy(target);
    camera.lookAt(look);
    const targetBank = reduced ? 0 : Math.sin(t * Math.PI * 6) * .24 + Math.tanh(velocity * 4) * Math.cos(t * Math.PI * 3) * .3;
    bank.current = THREE.MathUtils.damp(bank.current, targetBank, 5, delta);
    camera.rotation.z = bank.current;
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.damp(camera.fov, 43 + speed.current * 24, 5, delta);
      camera.updateProjectionMatrix();
    }
    if (group.current && !reduced) {
      const now = performance.now() / 1000;
      group.current.rotation.y += delta * (.8 + speed.current * 2.5);
      group.current.rotation.x += delta * .4;
      group.current.scale.setScalar(1 + Math.sin(now * 3) * .12);
      camera.position.x += Math.sin(now * 1.3) * .35;
      camera.position.y += Math.cos(now * 1.7) * .25;
    }
    if (rings.current && !reduced) rings.current.children.forEach((ring, i) => {
      ring.rotation.z += delta * (i % 2 ? 1.5 : -1.2);
      ring.rotation.x += delta * .6;
    });
  });
  return <>
    <FlyThrough travel={travel} reduced={reduced} specialty={specialty} colors={colors} />
    <color attach="background" args={[colors.background]} />
    <fog attach="fog" args={[colors.background, 19, 55]} />
    <ambientLight intensity={.7} />
    <directionalLight position={[4, 6, 8]} intensity={3} color={colors.chrome} />
    <pointLight position={[-5, 2, 4]} color={colors.ember} intensity={65} />
    <Environment resolution={128}>
      <Lightformer intensity={4} position={[0, 6, 0]} scale={[12, 6, 1]} />
      <Lightformer intensity={2} position={[-6, 0, 3]} rotation-y={Math.PI / 2} scale={[6, 12, 1]} />
      <Lightformer intensity={3} color={colors.ember} position={[5, 2, -2]} rotation-y={-Math.PI / 2} scale={[5, 8, 1]} />
    </Environment>
    <group ref={group} position={[1.3, .6, 0]} rotation={[.45, -.4, -.4]}>
      <mesh><torusKnotGeometry args={[2.8, .34, 220, 16, 2, 3]} /><meshStandardMaterial color={colors.ember} metalness={.65} roughness={.22} /></mesh>
      <mesh rotation={[.4, .1, .65]}><torusKnotGeometry args={[3.4, .065, 220, 8, 2, 3]} /><meshStandardMaterial color={colors.chrome} metalness={.95} roughness={.13} /></mesh>
    </group>
    {rails.map((curve, i) => <mesh key={i}><tubeGeometry args={[curve, 240, .055, 6, false]} /><meshStandardMaterial color={i ? colors.chrome : colors.ember} metalness={.8} roughness={.2} /></mesh>)}
    <group ref={rings}>{Array.from({ length: 12 }, (_, i) => <group key={i} position={[Math.sin(i * 1.8) * 5, Math.cos(i * 1.4) * 3, -9 - i * 3]} rotation={[i * .18, i * .3, i * .4]}>
      <mesh><torusGeometry args={[2.5 + i % 3, .065, 8, 64]} /><meshStandardMaterial color={i % 3 === 0 ? colors.ember : colors.muted} metalness={.7} roughness={.28} /></mesh>
      {i % 3 === 0 && <mesh position={[3.5, 1, 0]}><icosahedronGeometry args={[.7, 0]} /><meshStandardMaterial color={colors.chrome} metalness={.85} roughness={.2} /></mesh>}
    </group>)}</group>
  </>;
}

export function RideScene({ progress, reduced, specialty }: { progress: RefObject<number>; reduced: boolean; specialty: Specialty | null }) {
  const [colors, setColors] = useState<{ ember: string; chrome: string; background: string; muted: string }>();
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    setColors({ ember: css.getPropertyValue('--scene-ember').trim(), chrome: css.getPropertyValue('--scene-chrome').trim(), background: css.getPropertyValue('--scene-background').trim(), muted: css.getPropertyValue('--scene-muted').trim() });
  }, []);
  if (!colors) return null;
  return <div className="ride-canvas" aria-hidden="true"><Canvas dpr={[1, 1.5]} camera={{ position: [0, 1, 14], fov: 43 }} gl={{ antialias: true }}><World progress={progress} reduced={reduced} specialty={specialty} colors={colors} /></Canvas></div>;
}
