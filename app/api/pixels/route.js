import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// READ CSV DATA AND RETURN PIXEL DATA
function getPixelData() {
  try {
    // READ THE CSV FILE
    const csvPath = path.join(process.cwd(), 'data.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    
    // PARSE CSV DATA
    const lines = csvData.split('\n').slice(1); // SKIP HEADER
    const pixelData = lines
      .filter(line => line.trim())
      .map(line => {
        const [filename, x, y] = line.split(',');
        return {
          filename,
          x: parseFloat(x),
          y: parseFloat(y)
        };
      });

    return pixelData;
  } catch (error) {
    console.error('ERROR READING PIXEL DATA:', error);
    throw error;
  }
}

// GET PIXEL DATA
export async function GET() {
  try {
    const pixelData = getPixelData();
    return NextResponse.json(pixelData);
  } catch (error) {
    console.error('ERROR IN PIXELS API:', error);
    return NextResponse.json(
      { error: 'Failed to load pixel data' },
      { status: 500 }
    );
  }
} 