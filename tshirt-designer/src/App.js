import { useState, useRef, useEffect } from 'react';
import './App.css';
import TshirtViewer from './TshirtViewer';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

function App() {
  const [selectedProduct, setSelectedProduct] = useState('tshirt');
  const [selectedColor, setSelectedColor] = useState('white');
  const [overlayText, setOverlayText] = useState('');
  const [overlayImage, setOverlayImage] = useState(null);
  const [overlayImagePosition, setOverlayImagePosition] = useState({ x: 312, y: 312 });
  const [overlayImageSize, setOverlayImageSize] = useState({ width: 400, height: 400 });
  const [overlayImageRotation, setOverlayImageRotation] = useState(0);
  const [overlayTextPosition, setOverlayTextPosition] = useState({ x: 512, y: 200 });
  const [overlayTextSize, setOverlayTextSize] = useState({ width: 400, height: 100 });
  const [overlayTextRotation, setOverlayTextRotation] = useState(0);
  const fileInputRef = useRef();

  // Canvas өлшемі
  const CANVAS_SIZE = 1024;

  // product-preview өлшемін анықтау үшін реф
  const previewRef = useRef();
  const [previewSize, setPreviewSize] = useState({ width: 1024, height: 1024 });

  // preview өлшемін динамикалық анықтау
  useEffect(() => {
    function updateSize() {
      if (previewRef.current) {
        setPreviewSize({
          width: previewRef.current.offsetWidth,
          height: previewRef.current.offsetHeight
        });
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Mockup позицияларын canvas координаттарына түрлендіру
  function toCanvasCoords(pos, size) {
    return {
      x: Math.round(pos.x * (CANVAS_SIZE / previewSize.width)),
      y: Math.round(pos.y * (CANVAS_SIZE / previewSize.height)),
      width: Math.round(size.width * (CANVAS_SIZE / previewSize.width)),
      height: Math.round(size.height * (CANVAS_SIZE / previewSize.height)),
    };
  }

  const tshirtColors = {
    white: '#FFFFFF',
    black: '#000000',
    red: '#FF0000',
    blue: '#005bea',
    green: '#008000',
    yellow: '#FFFF00',
    pink: '#FFC0CB',
    gray: '#808080'
  };

  const handleScreenshot = () => {
    alert('Screenshot functionality coming soon!');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setOverlayImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="app-root">
      <aside className="sidebar">
        <h1 className="logo">Киім Дизайнері</h1>
        <div className="sidebar-section">
          <button className={selectedProduct === 'tshirt' ? 'active' : ''} onClick={() => setSelectedProduct('tshirt')}>Футболка</button>
          <button className={selectedProduct === 'hoodie' ? 'active' : ''} onClick={() => setSelectedProduct('hoodie')}>Худи</button>
        </div>
        <div className="sidebar-section">
          <div className="color-label">Варианттар</div>
          <div className="color-grid">
            <button className="color-btn" style={{ backgroundColor: '#fff', border: '2px solid #bbb' }} onClick={() => setSelectedColor('white')} title="Ақ" />
            <button className="color-btn" style={{ backgroundColor: '#000', border: '2px solid #bbb' }} onClick={() => setSelectedColor('black')} title="Қара" />
            <button className="color-btn" style={{ backgroundColor: '#005bea', border: '2px solid #bbb' }} onClick={() => setSelectedColor('blue')} title="Көк" />
            <button className="color-btn" style={{ backgroundColor: '#FF0000', border: '2px solid #bbb' }} onClick={() => setSelectedColor('red')} title="Қызыл" />
            <button className="color-btn" style={{ backgroundColor: '#008000', border: '2px solid #bbb' }} onClick={() => setSelectedColor('green')} title="Жасыл" />
            <button className="color-btn" style={{ backgroundColor: '#FFC0CB', border: '2px solid #bbb' }} onClick={() => setSelectedColor('pink')} title="Қызғылт" />
            <button className="color-btn" style={{ backgroundColor: '#FFFF00', border: '2px solid #bbb' }} onClick={() => setSelectedColor('yellow')} title="Сары" />
            <button className="color-btn" style={{ backgroundColor: '#808080', border: '2px solid #bbb' }} onClick={() => setSelectedColor('gray')} title="Сұр" />
          </div>
        </div>
        <div className="sidebar-section">
          <input
            type="text"
            placeholder="Жазу енгізіңіз..."
            value={overlayText}
            onChange={e => setOverlayText(e.target.value)}
            style={{ marginBottom: 10, padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: '1rem' }}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <button onClick={() => fileInputRef.current.click()}>Сурет қосу</button>
          <button onClick={handleScreenshot}>Скриншот жасау</button>
        </div>
      </aside>
      <main className="main-preview">
        <div className="preview-area hi-tech">
          <div className={`product-preview ${selectedProduct}`} style={{ position: 'relative' }} ref={previewRef}>
            {selectedProduct === 'tshirt' ? (
              <>
                <TshirtViewer
                  color={tshirtColors[selectedColor]}
                  baseColor={tshirtColors[selectedColor]}
                  overlayText={overlayText}
                  overlayImage={overlayImage}
                  overlayImagePosition={toCanvasCoords(overlayImagePosition, overlayImageSize)}
                  overlayImageSize={toCanvasCoords(overlayImagePosition, overlayImageSize)}
                  overlayImageRotation={overlayImageRotation}
                  overlayTextPosition={toCanvasCoords(overlayTextPosition, overlayTextSize)}
                  overlayTextSize={toCanvasCoords(overlayTextPosition, overlayTextSize)}
                  overlayTextRotation={overlayTextRotation}
                />
                {/* Overlay for text and image with drag & resize */}
                {(overlayImage || overlayText) && (
                  <div className="tshirt-overlay">
                    {overlayImage && (
                      <Draggable
                        bounds="parent"
                        position={overlayImagePosition}
                        onStop={(_, data) => setOverlayImagePosition({ x: data.x, y: data.y })}
                      >
                        <ResizableBox
                          width={overlayImageSize.width}
                          height={overlayImageSize.height}
                          minConstraints={[60, 60]}
                          maxConstraints={[600, 600]}
                          onResize={(_, data) => setOverlayImageSize({ width: data.size.width, height: data.size.height })}
                        >
                          <div style={{ width: '100%', height: '100%', position: 'relative', transform: `rotate(${overlayImageRotation}deg)` }}>
                            <img src={overlayImage} alt="overlay" className="overlay-image" style={{ width: '100%', height: '100%' }} />
                            <input
                              type="range"
                              min={-180}
                              max={180}
                              value={overlayImageRotation}
                              onChange={e => setOverlayImageRotation(Number(e.target.value))}
                              style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }}
                            />
                          </div>
                        </ResizableBox>
                      </Draggable>
                    )}
                    {overlayText && (
                      <Draggable
                        bounds="parent"
                        position={overlayTextPosition}
                        onStop={(_, data) => setOverlayTextPosition({ x: data.x, y: data.y })}
                      >
                        <ResizableBox
                          width={overlayTextSize.width}
                          height={overlayTextSize.height}
                          minConstraints={[80, 30]}
                          maxConstraints={[600, 200]}
                          onResize={(_, data) => setOverlayTextSize({ width: data.size.width, height: data.size.height })}
                        >
                          <div
                            className="overlay-text"
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transform: `rotate(${overlayTextRotation}deg)`
                            }}
                          >
                            {overlayText}
                            <input
                              type="range"
                              min={-180}
                              max={180}
                              value={overlayTextRotation}
                              onChange={e => setOverlayTextRotation(Number(e.target.value))}
                              style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }}
                            />
                          </div>
                        </ResizableBox>
                      </Draggable>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div style={{color:'#888'}}>3D модель тек футболка үшін қолжетімді</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
