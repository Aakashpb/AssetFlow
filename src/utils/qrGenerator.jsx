// Procedural Visual QR Code Generator (SVG Finder Patterns + Random Matrix)
export function generateMockQR(dataString) {
  const size = 100;
  const pixelGridSize = 25;
  const px = size / pixelGridSize;
  
  let svgContent = "";
  
  // Outer squares (Finder Patterns)
  // Top-left
  svgContent += `<rect x="0" y="0" width="${px * 7}" height="${px * 7}" fill="black"/>`;
  svgContent += `<rect x="${px}" y="${px}" width="${px * 5}" height="${px * 5}" fill="white"/>`;
  svgContent += `<rect x="${px * 2}" y="${px * 2}" width="${px * 3}" height="${px * 3}" fill="black"/>`;
  
  // Top-right
  svgContent += `<rect x="${size - px * 7}" y="0" width="${px * 7}" height="${px * 7}" fill="black"/>`;
  svgContent += `<rect x="${size - px * 6}" y="${px}" width="${px * 5}" height="${px * 5}" fill="white"/>`;
  svgContent += `<rect x="${size - px * 5}" y="${px * 2}" width="${px * 3}" height="${px * 3}" fill="black"/>`;
  
  // Bottom-left
  svgContent += `<rect x="0" y="${size - px * 7}" width="${px * 7}" height="${px * 7}" fill="black"/>`;
  svgContent += `<rect x="${px}" y="${size - px * 6}" width="${px * 5}" height="${px * 5}" fill="white"/>`;
  svgContent += `<rect x="${px * 2}" y="${size - px * 5}" width="${px * 3}" height="${px * 3}" fill="black"/>`;
  
  // Seedable pseudo-random grid to look identical for the same string
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    hash = dataString.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Draw random-looking data pixels (skipping corner finder areas)
  for (let r = 0; r < pixelGridSize; r++) {
    for (let c = 0; c < pixelGridSize; c++) {
      const isTopLeft = r < 8 && c < 8;
      const isTopRight = r < 8 && c >= pixelGridSize - 8;
      const isBottomLeft = r >= pixelGridSize - 8 && c < 8;
      
      if (!isTopLeft && !isTopRight && !isBottomLeft) {
        const val = Math.abs(Math.sin(hash + r * 13 + c * 37));
        if (val > 0.45) {
          svgContent += `<rect x="${c * px}" y="${r * px}" width="${px}" height="${px}" fill="black"/>`;
        }
      }
    }
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-24 h-24 qr-code-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="white" />
      <g dangerouslySetInnerHTML={{ __html: svgContent }} />
    </svg>
  );
}
