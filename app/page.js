"use client";

import { useState, useEffect } from "react";

export default function Home() {
  // STATE FOR PIXEL DATA AND LOADING
  const [pixelData, setPixelData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);

  // LOAD PIXEL DATA ON COMPONENT MOUNT
  useEffect(() => {
    loadPixelData();
  }, []);

  // FETCH PIXEL DATA FROM API
  const loadPixelData = async () => {
    try {
      const response = await fetch('/api/pixels');
      const data = await response.json();
      setPixelData(data);
      console.log("LOADED DATA:", data.length, "pants");
      console.log("SAMPLE DATA:", data.slice(0, 5));
      
      // LOAD DEFAULT IMAGES FROM CENTER OF GRID
      setTimeout(() => {
        findClosestImages(50, 50);
      }, 500);
      
    } catch (error) {
      console.error("ERROR LOADING PIXEL DATA:", error);
      // FALLBACK TEST DATA
      const testData = Array.from({ length: 100 }, (_, i) => ({
        filename: `test_${i}.jpg`,
        x: Math.random() * 1000,
        y: Math.random() * 1000
      }));
      setPixelData(testData);
      console.log("USING TEST DATA:", testData.length, "pants");
      
      // LOAD DEFAULT IMAGES FROM CENTER OF GRID
      setTimeout(() => {
        findClosestImages(50, 50);
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  // FIND 9 CLOSEST IMAGES TO CLICK LOCATION
  const findClosestImages = async (clickX, clickY) => {
    const normalizedX = clickX / 100; // CONVERT GRID POSITION TO 0-1
    const normalizedY = clickY / 100;
    
    setLoadingImages(true);
    setSelectedImages([]); // CLEAR PREVIOUS IMAGES
    
    try {
      // CALCULATE DISTANCES TO ALL IMAGES FIRST
      const distances = pixelData.map((pixel, index) => ({
        ...pixel,
        index,
        distance: Math.sqrt(
          Math.pow(pixel.x - normalizedX, 2) + 
          Math.pow(pixel.y - normalizedY, 2)
        )
      }));
      
      // SORT BY DISTANCE AND GET TOP 9
      const closest = distances
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 9);
      
      // REMOVE DUPLICATES BASED ON FILENAME
      const uniqueImages = closest.filter((image, index, self) => 
        index === self.findIndex(img => img.filename === image.filename)
      );
      
      // IF WE HAVE LESS THAN 9 UNIQUE IMAGES, GET MORE
      if (uniqueImages.length < 9) {
        const moreImages = distances
          .sort((a, b) => a.distance - b.distance)
          .slice(9, 20) // GET MORE CANDIDATES
        
        // ADD MORE UNIQUE IMAGES
        moreImages.forEach(img => {
          if (uniqueImages.length < 9 && !uniqueImages.some(existing => existing.filename === img.filename)) {
            uniqueImages.push(img);
          }
        });
      }
      
      // GET ALL IMAGE LINKS IN ONE API CALL
      const filenames = uniqueImages.slice(0, 9).map(img => img.filename);
      
      const response = await fetch('/api/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x: normalizedX,
          y: normalizedY,
          category: 'mens_pants',
          count: 9,
          filenames: filenames // PASS ALL FILENAMES AT ONCE
        }),
      });
      
      const result = await response.json();
      
      if (result.status === 'success' && result.image_links) {
        // CREATE IMAGES WITH LINKS
        const imagesWithLinks = uniqueImages.slice(0, 9).map((image, index) => ({
          ...image,
          imageLink: result.image_links[index] || null
        }));
        
        // PROGRESSIVELY SHOW IMAGES WITH DELAYS
        const finalImages = [];
        for (let i = 0; i < imagesWithLinks.length; i++) {
          finalImages.push(imagesWithLinks[i]);
          setSelectedImages([...finalImages]);
        }
        
        console.log("ALL IMAGES LOADED:", finalImages);
      }
      
      setLoadingImages(false);
    } catch (error) {
      console.error("ERROR FETCHING IMAGES:", error);
      setLoadingImages(false);
    }
  };

  // THEMED LOADING SPINNER - MATCHES CELL COLORS
  function Spinner() {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="relative">
          {/* MAIN SPINNING RING WITH ORANGE THEME */}
          <div 
            className="w-12 h-12 border-4 rounded-full" 
            style={{ 
              borderTopColor: '#ffc107', 
              borderRightColor: '#ffa500', 
              borderBottomColor: 'rgba(255, 193, 7, 0.3)', 
              borderLeftColor: 'rgba(255, 165, 0, 0.3)',
              animation: 'spin 1s linear infinite',
              boxShadow: '0 0 12px rgba(255, 165, 0, 0.6)'
            }}
          ></div>
          {/* INNER PULSING CIRCLE */}
          <div 
            className="absolute inset-2 rounded-full"
            style={{
              backgroundColor: 'rgba(255, 193, 7, 0.4)',
              animation: 'pulse 2s ease-in-out infinite',
              boxShadow: '0 0 8px rgba(255, 165, 0, 0.4)'
            }}
          ></div>
        </div>
      </div>
    );
  }

  // DEFINE REGIONS FOR LABELING
  const regions = [
    { id: 'casual', name: 'LIGHT ZONE', x: 15, y: 30, width: 30, height: 15, color: 'rgba(255, 84, 121, 0.1)' },
    { id: 'formal', name: 'DARK ZONE', x: 20, y: 7, width: 35, height: 18, color: 'rgba(54, 162, 235, 0.1)' },
    { id: 'pattern', name: 'PATTERN ZONE', x: 2, y: 50, width: 35, height: 25, color: 'rgba(255, 206, 86, 0.1)' },
    { id: 'jean', name: 'DENIM ZONE', x: 42, y: 65, width: 40, height: 25, color: 'rgba(75, 192, 192, 0.1)' },
    { id: 'premium', name: 'DARK DENIM ZONE', x: 50, y: 40, width: 20, height: 20, color: 'rgba(153, 102, 255, 0.1)' }
  ];

  // CHECK IF A CELL IS IN A REGION
  const getRegionForCell = (x, y) => {
    return regions.find(region => 
      x >= region.x && x < region.x + region.width &&
      y >= region.y && y < region.y + region.height
    );
  };

  // FIRST SQUARE ZONE - PANTS DENSITY GRID
  function FirstSquare() {
    if (loading) return (
      <div className="w-full h-full bg-gray-100 rounded-2xl border border-gray-300 flex items-center justify-center">
        <Spinner />
      </div>
    );
    
    // CREATE 100x100 GRID
    const gridSize = 100;
    
    // CREATE DENSITY MAP
    const densityMap = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    
    // MAP PANTS TO GRID CELLS
    pixelData.forEach(pixel => {
      // MAP X,Y TO GRID POSITIONS (0-249) - COORDINATES ARE 0-1
      const gridX = Math.floor(pixel.x * gridSize);
      const gridY = Math.floor(pixel.y * gridSize);
      
      if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
        densityMap[gridY][gridX]++;
      }
    });

    // FIND MAX DENSITY
    const maxDensity = Math.max(...densityMap.flat());
    console.log("MAX DENSITY:", maxDensity);
    console.log("CELLS WITH DATA:", densityMap.flat().filter(d => d > 0).length);

    return (
      <div className="w-full h-full bg-white rounded-2xl border border-gray-300 overflow-hidden relative">
        {/* REGION LABELS */}
        {regions.map((region) => (
          <div
            key={region.id}
            className="absolute pointer-events-none z-10"
            style={{
              left: `${region.x}%`,
              top: `${region.y}%`,
              width: `${region.width}%`,
              height: `${region.height}%`,
              backgroundColor: region.color,
              border: '2px solid rgba(255, 255, 255, 0.8)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              textAlign: 'center',
              padding: '2px'
            }}
          >
            {region.name}
          </div>
        ))}
        
        {/* 100x100 GRID */}
        <div 
          className="grid gap-0 w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {Array.from({ length: gridSize * gridSize }, (_, index) => {
            const x = index % gridSize;
            const y = Math.floor(index / gridSize);
            const density = densityMap[y][x];
            const hasData = density > 0;
            const intensity = hasData ? Math.min(1, density / Math.max(1, maxDensity)) : 0;
            const region = getRegionForCell(x, y);
            
            return (
              <div
                key={index}
                className="relative cursor-pointer"
                onClick={() => findClosestImages(x, y)}
                title={hasData ? `Cell (${x}, ${y}): ${density} pants${region ? ` - ${region.name}` : ''}` : ''}
              >
                {/* BIG CIRCLE WITH BLINKING EFFECT */}
                <div
                  className="rounded-full w-full h-full"
                  style={{
                    backgroundColor: hasData 
                      ? `rgba(255, 193, 7, ${Math.max(0.3, intensity)})`
                      : 'transparent',
                    boxShadow: hasData 
                      ? `0 0 8px rgba(255, 165, 0, ${Math.max(0.4, intensity)})`
                      : 'none',
                    animation: hasData 
                      ? `pulse ${2 + (1 - intensity) * 3}s ease-in-out infinite`
                      : 'none',
                    animationDelay: hasData 
                      ? `${Math.random() * 2}s`
                      : '0s',
                  }}
                />
              </div>
          );
        })}
        </div>
      </div>
    );
  }

  // SECOND SQUARE ZONE - CLOSEST IMAGES
  function SecondSquare() {
    return (
      <div className="w-full h-full bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col" style={{backgroundColor: 'white'}}>
        <div className="flex-1" style={{backgroundColor: 'white'}}>
          {/* 9 CLOSEST IMAGES GRID */}
          <div className="flex items-center justify-center h-full">
            {loadingImages ? (
              // SHOW THEMED LOADING SPINNER
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  {/* MAIN SPINNING RING WITH ORANGE THEME */}
                  <div 
                    className="w-16 h-16 border-4 rounded-full" 
                    style={{ 
                      borderTopColor: '#ffc107', 
                      borderRightColor: '#ffa500', 
                      borderBottomColor: 'rgba(255, 193, 7, 0.3)', 
                      borderLeftColor: 'rgba(255, 165, 0, 0.3)',
                      animation: 'spin 1s linear infinite',
                      boxShadow: '0 0 16px rgba(255, 165, 0, 0.6)'
                    }}
                  ></div>
                  {/* INNER PULSING CIRCLE */}
                  <div 
                    className="absolute inset-3 rounded-full"
                    style={{
                      backgroundColor: 'rgba(255, 193, 7, 0.4)',
                      animation: 'pulse 2s ease-in-out infinite',
                      boxShadow: '0 0 12px rgba(255, 165, 0, 0.4)'
                    }}
                  ></div>
                </div>
              </div>
            ) : selectedImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {selectedImages.map((image, i) => (
                  <div
                    key={i}
                    className="rounded-lg flex items-center justify-center w-20 h-20 bg-gray-50 overflow-hidden"
                  >
                    {image.imageLink ? (
                      <img 
                        src={image.imageLink} 
                        alt={image.filename}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className="text-gray-600 font-medium text-xs text-center px-1 absolute inset-0 flex items-center justify-center bg-white bg-opacity-90" style={{ display: 'none' }}>
                      {image.filename.split('/').pop().split('.')[0].slice(0, 8)}...
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              // LOAD DEFAULT IMAGES FROM CENTER OF GRID
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 9 }, (_, i) => (
                  <div
                    key={i}
                    className="rounded-lg flex items-center justify-center w-20 h-20 bg-gray-100 overflow-hidden"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">THE PANTS PROJECT...</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // MAIN RENDER
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">THE PANTS PROJECT</h1>
        </div>
      </header>
      
      {/* MAIN BIG ZONE */}
      <main className="flex-1 flex items-start justify-center p-12">
        <div className="flex justify-center items-start w-full max-w-7xl" style={{ gap: '5%', background: 'white' }}>
          {/* FIRST SQUARE ZONE WITH LABEL */}
          <div className="flex flex-col items-center">
            <div className="w-[40vw] max-w-[500px] min-w-[300px]" style={{ height: '80vh', backgroundColor: 'white' }}>
              <FirstSquare />
            </div>
            {/* LABEL BELOW FIRST SQUARE */}
            <div className="mt-4 text-center p-4">
              <h3 className="text-lg font-bold text-white mb-2">PANTS DENSITY MAP</h3>
              <p className="text-sm text-white max-w-md">
                VGG-18 LATENT SPACE OF VARIOUS PANTS <br/> BRIGHTER DOTS MEANS HIGHER DENSITY OF PANTS.
              </p>
            </div>
          </div>
          
          {/* SECOND SQUARE ZONE WITH LABEL */}
          <div className="flex flex-col items-center">
            <div className="w-[40vw] max-w-[500px] min-w-[300px]" style={{ height: '80vh' }}>
              <SecondSquare />
            </div>
            {/* LABEL BELOW SECOND SQUARE */}
            <div className="mt-4 text-center p-4">
              <h3 className="text-lg font-bold text-white mb-2">SIMILAR PANTS RESULTS</h3>
              <p className="text-sm text-white max-w-md">
                ..HERE.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="w-full text-center text-gray-400 py-6 text-sm">
        &copy; {new Date().getFullYear()} The Pants Project. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
} 