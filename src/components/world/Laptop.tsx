"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { LAPTOP } from "@/lib/journey";

const KEY_COLUMNS = 14;
const KEY_ROWS = 5;
const KEY = 0.128;
const KEY_GAP = 0.034;
const ALUMINIUM = { color: "#c3c7cc", metalness: 0.85, roughness: 0.34 } as const;

/**
 * Built from primitives rather than a downloaded model: no licensing question,
 * no runtime fetch, and every dimension is shared with the camera path so the
 * flight into the screen lands exactly on it. No manufacturer logo.
 */
export function Laptop({ screen }: { screen: ReactNode }) {
  const keys = useRef<THREE.InstancedMesh>(null);
  const {
    baseWidth,
    baseDepth,
    baseThickness,
    baseTop,
    hingeZ,
    lidHeight,
    lidThickness,
    tilt,
    screenWidth,
    screenHeight,
    screenOffsetY,
  } = LAPTOP;

  const keyboardWidth = KEY_COLUMNS * (KEY + KEY_GAP) - KEY_GAP;
  const keyboardDepth = KEY_ROWS * (KEY + KEY_GAP) - KEY_GAP;
  const keyboardCenterZ = hingeZ + 0.2 + keyboardDepth / 2;

  useLayoutEffect(() => {
    const mesh = keys.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4();
    let index = 0;
    for (let row = 0; row < KEY_ROWS; row++) {
      for (let column = 0; column < KEY_COLUMNS; column++) {
        const x = -keyboardWidth / 2 + KEY / 2 + column * (KEY + KEY_GAP);
        const z = keyboardCenterZ - keyboardDepth / 2 + KEY / 2 + row * (KEY + KEY_GAP);
        matrix.makeTranslation(x, baseTop + 0.006, z);
        mesh.setMatrixAt(index++, matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [baseTop, keyboardCenterZ, keyboardDepth, keyboardWidth]);

  return (
    <group>
      <RoundedBox
        args={[baseWidth, baseThickness, baseDepth]}
        radius={0.028}
        smoothness={4}
        position={[0, baseTop - baseThickness / 2, hingeZ + baseDepth / 2]}
      >
        <meshStandardMaterial {...ALUMINIUM} />
      </RoundedBox>

      <mesh rotation-x={-Math.PI / 2} position={[0, baseTop + 0.0008, keyboardCenterZ]}>
        <planeGeometry args={[keyboardWidth + 0.06, keyboardDepth + 0.08]} />
        <meshStandardMaterial color="#17191d" roughness={0.85} />
      </mesh>

      <instancedMesh ref={keys} args={[undefined, undefined, KEY_COLUMNS * KEY_ROWS]}>
        <boxGeometry args={[KEY, 0.012, KEY]} />
        <meshStandardMaterial color="#0e1013" roughness={0.55} />
      </instancedMesh>

      <mesh rotation-x={-Math.PI / 2} position={[0, baseTop + 0.0009, keyboardCenterZ + keyboardDepth / 2 + 0.42]}>
        <planeGeometry args={[1.02, 0.62]} />
        <meshStandardMaterial color="#b6babf" metalness={0.8} roughness={0.42} />
      </mesh>

      <mesh rotation-z={Math.PI / 2} position={[0, baseTop + 0.004, hingeZ]}>
        <cylinderGeometry args={[0.028, 0.028, baseWidth * 0.86, 20]} />
        <meshStandardMaterial color="#8f9398" metalness={0.9} roughness={0.3} />
      </mesh>

      <group position={[0, baseTop + 0.005, hingeZ]} rotation-x={-tilt}>
        <RoundedBox args={[baseWidth, lidHeight, lidThickness]} radius={0.028} smoothness={4} position={[0, lidHeight / 2, 0]}>
          <meshStandardMaterial {...ALUMINIUM} />
        </RoundedBox>
        <mesh position={[0, lidHeight / 2, lidThickness / 2 + 0.001]}>
          <planeGeometry args={[baseWidth - 0.06, lidHeight - 0.06]} />
          <meshStandardMaterial color="#050607" roughness={0.18} metalness={0.2} />
        </mesh>
        <mesh position={[0, lidHeight / 2 + screenOffsetY, lidThickness / 2 + 0.002]}>
          <planeGeometry args={[screenWidth, screenHeight]} />
          {screen}
        </mesh>
      </group>
    </group>
  );
}
