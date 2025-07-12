import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Dropbox } from 'dropbox';

// GET DROPBOX CREDENTIALS FROM ENVIRONMENT VARIABLES
const DROPBOX_APP_KEY = process.env.DROPBOX_APP_KEY;
const DROPBOX_APP_SECRET = process.env.DROPBOX_APP_SECRET;
const DROPBOX_REFRESH_TOKEN = process.env.DROPBOX_REFRESH_TOKEN;

// FIND MOST SIMILAR PANTS BASED ON COORDINATES
function getMostSimilar(xInput, yInput, category = 'mens_pants', N = 6) {
  try {
    // READ THE CSV FILE
    const csvPath = path.join(process.cwd(), 'data.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    // PARSE CSV DATA
    const lines = csvData.split('\n').slice(1); // SKIP HEADER
    const data = lines
      .filter(line => line.trim())
      .map(line => {
        const [filename, x, y] = line.split(',');
        return { filename, x: parseFloat(x), y: parseFloat(y) };
      });
    // CALCULATE DISTANCES AND SORT BY SIMILARITY
    const distances = data.map(item => ({
      filename: item.filename,
      distance: Math.pow(item.x - xInput, 2) + Math.pow(item.y - yInput, 2)
    }));
    // SORT BY DISTANCE (CLOSEST FIRST) AND GET TOP N
    const topN = distances
      .sort((a, b) => a.distance - b.distance)
      .slice(0, N)
      .map(item => item.filename);
    return topN;
  } catch (error) {
    console.error('ERROR FINDING SIMILAR PANTS:', error);
    throw error;
  }
}

// GET DROPBOX TEMPORARY LINKS FOR IMAGES
async function getDropboxLinks(filenames) {
  // INITIALIZE DROPBOX SDK WITH REFRESH TOKEN
  const dbx = new Dropbox({
    clientId: DROPBOX_APP_KEY,
    clientSecret: DROPBOX_APP_SECRET,
    refreshToken: DROPBOX_REFRESH_TOKEN,
    accessToken: undefined,
    fetch,
  });
  const imageLinks = [];
  for (const filename of filenames) {
    try {
      // GET TEMPORARY LINK FOR EACH FILE
      const res = await dbx.filesGetTemporaryLink({ path: filename });
      imageLinks.push(res.result.link);
    } catch (err) {
      console.error('ERROR GETTING DROPBOX LINK FOR', filename, err);
      imageLinks.push(null);
    }
  }
  return imageLinks;
}

// HANDLE CLICK REQUEST
export async function POST(request) {
  try {
    const body = await request.json();
    const { x, y, category = 'mens_pants', count = 6, specificIndex = null, specificFilename = null, filenames = null } = body;
    // VALIDATE INPUT
    if (typeof x !== 'number' || typeof y !== 'number') {
      return NextResponse.json(
        { status: 'error', message: 'Invalid coordinates' },
        { status: 400 }
      );
    }
    
    // IF SPECIFIC FILENAME IS REQUESTED, RETURN ONLY THAT IMAGE
    if (specificFilename) {
      const imageLinks = await getDropboxLinks([specificFilename]);
      return NextResponse.json({
        status: 'success',
        image_links: imageLinks
      });
    }
    
    // IF FILENAMES ARE PROVIDED, USE THEM DIRECTLY
    if (filenames && Array.isArray(filenames)) {
      const imageLinks = await getDropboxLinks(filenames);
      return NextResponse.json({
        status: 'success',
        image_links: imageLinks
      });
    }
    
    // FIND SIMILAR PANTS
    const topNFilenames = getMostSimilar(x, y, category, count);
    
    // IF SPECIFIC INDEX IS REQUESTED, RETURN ONLY THAT IMAGE
    if (specificIndex !== null && specificIndex < topNFilenames.length) {
      const specificFilename = topNFilenames[specificIndex];
      const imageLinks = await getDropboxLinks([specificFilename]);
      return NextResponse.json({
        status: 'success',
        image_links: imageLinks
      });
    }
    
    // GET DROPBOX LINKS FOR ALL REQUESTED IMAGES
    const imageLinks = await getDropboxLinks(topNFilenames);
    return NextResponse.json({
      status: 'success',
      image_links: imageLinks
    });
  } catch (error) {
    console.error('ERROR IN CLICK API:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
} 