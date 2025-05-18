import { useRef, useState } from 'react';
import { Stage, Layer, Text, Image as KonvaImage } from 'react-konva';
import html2canvas from 'html2canvas';

function TShirtDesigner() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('Жазуың осында');
  const [textPos, setTextPos] = useState({ x: 50, y: 250 });
  const [imagePos, setImagePos] = useState({ x: 50, y: 50 });
  const stageRef = useRef();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function () {
      const img = new window.Image();
      img.src = reader.result;
      img.onload = () => {
        setImage(img);
      };
    };
    reader.readAsDataURL(file);
  };

  const downloadImage = () => {
    const stage = stageRef.current;
    html2canvas(stage.container()).then((canvas) => {
      const link = document.createElement('a');
      link.download = 'tshirt_design.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Футболка дизайны</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <br />
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Жазу енгіз"
        style={{ marginTop: '10px' }}
      />
      <br />
      <button onClick={downloadImage} style={{ marginTop: '10px' }}>
        PNG ретінде жүктеу
      </button>

      <div
        style={{
          marginTop: '20px',
          border: '1px solid #ccc',
          width: '400px',
          height: '500px',
        }}
      >
        <Stage width={400} height={500} ref={stageRef}>
          <Layer>
            {image && (
              <KonvaImage
                image={image}
                x={imagePos.x}
                y={imagePos.y}
                draggable
                onDragEnd={(e) =>
                  setImagePos({ x: e.target.x(), y: e.target.y() })
                }
              />
            )}
            <Text
              text={text}
              x={textPos.x}
              y={textPos.y}
              fontSize={24}
              fill="black"
              draggable
              onDragEnd={(e) =>
                setTextPos({ x: e.target.x(), y: e.target.y() })
              }
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default TShirtDesigner;
