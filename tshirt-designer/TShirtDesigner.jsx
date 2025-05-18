import React, { useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Transformer } from 'react-konva';
import html2canvas from 'html2canvas';

const TShirtDesigner = () => {
  const stageRef = useRef(null);
  const [text, setText] = useState("Мені жылжыт!");
  const [textProps, setTextProps] = useState({ x: 50, y: 100, fontSize: 24, draggable: true });

  const downloadImage = () => {
    const stage = stageRef.current;
    html2canvas(stage.container()).then(canvas => {
      const link = document.createElement('a');
      link.download = 'tshirt-design.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Жазуды енгіз"
        />
        <button onClick={downloadImage}>Сақтау</button>
      </div>
      <Stage width={400} height={500} ref={stageRef} style={{ border: '1px solid #ccc' }}>
        <Layer>
          <KonvaImage
            image={null}
            width={400}
            height={500}
            fill="white"
          />
          <Text {...textProps} text={text} fill="black" />
        </Layer>
      </Stage>
    </div>
  );
};

export default TShirtDesigner;
