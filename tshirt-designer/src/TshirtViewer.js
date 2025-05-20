import React, { Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
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

function createTshirtTexture({ baseColor, overlayText, overlayImage, overlayImagePosition, overlayImageSize, overlayImageRotation, overlayTextPosition, overlayTextSize, overlayTextRotation }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Фон түсі таңдалған түс
  ctx.fillStyle = baseColor || '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Сурет салу (егер бар болса)
  if (overlayImage) {
    const img = new window.Image();
    img.src = overlayImage;
    img.onload = () => {
      ctx.save();
      ctx.translate(overlayImagePosition.x + overlayImageSize.width / 2, overlayImagePosition.y + overlayImageSize.height / 2);
      ctx.rotate((overlayImageRotation * Math.PI) / 180);
      ctx.drawImage(img, -overlayImageSize.width / 2, -overlayImageSize.height / 2, overlayImageSize.width, overlayImageSize.height);
      ctx.restore();
    };
    // Егер сурет жүктеліп үлгермесе, алдын ала салу (кейде керек)
    if (img.complete) {
      ctx.save();
      ctx.translate(overlayImagePosition.x + overlayImageSize.width / 2, overlayImagePosition.y + overlayImageSize.height / 2);
      ctx.rotate((overlayImageRotation * Math.PI) / 180);
      ctx.drawImage(img, -overlayImageSize.width / 2, -overlayImageSize.height / 2, overlayImageSize.width, overlayImageSize.height);
      ctx.restore();
    }
  }

  // Мәтін салу (егер бар болса)
  if (overlayText) {
    ctx.save();
    ctx.translate(overlayTextPosition.x + overlayTextSize.width / 2, overlayTextPosition.y + overlayTextSize.height / 2);
    ctx.rotate((overlayTextRotation * Math.PI) / 180);
    ctx.font = `bold ${Math.floor(overlayTextSize.height * 0.7)}px sans-serif`;
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(overlayText, 0, 0, overlayTextSize.width);
    ctx.restore();
  }

  return new THREE.CanvasTexture(canvas);
}

function TshirtModel({ color, baseColor, overlayText, overlayImage, overlayImagePosition, overlayImageSize, overlayImageRotation, overlayTextPosition, overlayTextSize, overlayTextRotation, ...props }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [texture, setTexture] = useState(null);

  const { scene } = useGLTF('/assets/tshirt.glb', undefined, 
    (error) => {
      console.error('GLTF loading error:', error);
      setError(error);
      setLoading(false);
    }
  );

  useEffect(() => {
    if (scene) {
      setLoading(false);
    }
  }, [scene]);

  // Canvas-текстураны жаңарту
  useEffect(() => {
    const tex = createTshirtTexture({ baseColor, overlayText, overlayImage, overlayImagePosition, overlayImageSize, overlayImageRotation, overlayTextPosition, overlayTextSize, overlayTextRotation });
    setTexture(tex);
  }, [baseColor, overlayText, overlayImage, overlayImagePosition, overlayImageSize, overlayImageRotation, overlayTextPosition, overlayTextSize, overlayTextRotation]);

  // Материалдарды өзгерту
  useEffect(() => {
    if (scene) {
      scene.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach(mat => {
            if (mat.name.toLowerCase().includes('tshirt')) {
              if (texture) {
                mat.map = texture;
                mat.color.set('#ffffff'); // Текстура бар кезде түс ақ
                mat.needsUpdate = true;
              } else {
                mat.map = null;
                mat.color.set(color); // Текстура жоқ кезде қалаған түс
                mat.needsUpdate = true;
              }
              mat.side = THREE.DoubleSide;
            }
          });
        }
      });
    }
  }, [color, scene, texture]);

  // Debug: log full scene hierarchy
  useEffect(() => {
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

  return (
    <Center>
      <primitive 
        object={scene} 
        scale={0.04} 
        rotation={[0, Math.PI, 0]} 
        {...props} 
      />
    </Center>
  );
}

export default function TshirtViewer({ color = '#ffffff', baseColor = '#ffffff', overlayText, overlayImage, overlayImagePosition, overlayImageSize, overlayImageRotation, overlayTextPosition, overlayTextSize, overlayTextRotation }) {
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
          <TshirtModel
            color={color}
            baseColor={baseColor}
            overlayText={overlayText}
            overlayImage={overlayImage}
            overlayImagePosition={overlayImagePosition}
            overlayImageSize={overlayImageSize}
            overlayImageRotation={overlayImageRotation}
            overlayTextPosition={overlayTextPosition}
            overlayTextSize={overlayTextSize}
            overlayTextRotation={overlayTextRotation}
          />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          maxPolarAngle={Math.PI/2} 
          minPolarAngle={Math.PI/2} 
        />
      </Canvas>
    </div>
  );
}

// GLTFLoader үшін қажет
useGLTF.preload('/assets/tshirt.glb'); 