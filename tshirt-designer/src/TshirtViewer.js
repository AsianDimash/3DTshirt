import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';

function logChildren(obj, depth = 0) {
  if (!obj) return;
  const indent = ' '.repeat(depth * 2);
  console.log(`${indent}${obj.type} - ${obj.name}`);
  if (obj.children && obj.children.length > 0) {
    obj.children.forEach(child => logChildren(child, depth + 1));
  }
}

function TshirtModel({ color, ...props }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Attempting to load model from:', '/assets/tshirt.glb');
  }, []);

  const { scene, materials } = useGLTF('/assets/tshirt.glb', undefined, 
    (error) => {
      console.error('GLTF loading error:', error);
      setError(error);
      setLoading(false);
    }
  );

  useEffect(() => {
    if (scene) {
      console.log('Model loaded successfully');
      setLoading(false);
    }
  }, [scene]);

  // Барлық материалдарды ақ түсті футболкаға ауыстыру
  React.useEffect(() => {
    if (scene) {
      scene.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach(mat => {
            console.log('Material:', mat.name, mat.type, mat.color);
            if (mat.color) {
              mat.color.set(color);
              mat.needsUpdate = true;
              mat.side = THREE.DoubleSide;
              mat.transparent = false;
              mat.opacity = 1;
            }
          });
        }
      });
    }
  }, [color, scene]);

  // Debug: log full scene hierarchy
  React.useEffect(() => {
    if (scene) {
      console.log('Scene hierarchy:');
      logChildren(scene);
    }
  }, [scene]);

  if (loading) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    );
  }

  if (error) {
    console.error('Error state:', error);
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }

  // Барлық Object3D және Mesh-терді жинау
  const objects = [];
  scene && scene.traverse && scene.traverse((obj) => {
    if (obj.type === 'Mesh' || obj.type === 'Object3D') objects.push(obj);
  });

  console.log('Found objects:', objects.length);

  // Тек бірінші Object3D-ны көрсетеміз, rotation-ды оңай ауыстыру үшін
  const rotation = [-Math.PI / 2, Math.PI, 0]; // [x, y, z] - upright orientation
  return (
    <Center>
      {objects[0] && (
        <primitive object={objects[0]} scale={0.04} rotation={rotation} {...props} />
      )}
    </Center>
  );
}

export default function TshirtViewer({ color = '#ffffff' }) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 1.2, 4], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 5, 2]} intensity={0.7} />
        <Suspense fallback={
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="gray" />
          </mesh>
        }>
          <TshirtModel color={color} />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI/2} minPolarAngle={Math.PI/2} />
      </Canvas>
    </div>
  );
}

// GLTFLoader үшін қажет
useGLTF.preload('/assets/tshirt.glb'); 