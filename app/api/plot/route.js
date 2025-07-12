import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// READ CSV DATA AND CREATE PLOT
function createPlot(category = 'mens_pants') {
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

    // EXTRACT X AND Y COORDINATES
    const x = data.map(d => d.x);
    const y = data.map(d => d.y);

    // CREATE PLOTLY HEATMAP DATA
    const heatmapData = {
      x: x,
      y: y,
      type: 'histogram2d',
      colorscale: [[0, "rgba(0,0,0,0)"], [1, "#89764a"]],
      zsmooth: false,
      nbinsy: 200,
      nbinsx: 200,
      hovertemplate: "<b>X:</b> %{x}<br><b>Y:</b> %{y}<br><b>Density:</b> %{z}<extra></extra>",
      showscale: false,
    };

    // CREATE LAYOUT
    const layout = {
      title: "VGG Latent Space of ~2K Pants",
      xaxis: {
        showgrid: false,
        zeroline: false,
        showticklabels: false,
        showline: false,
      },
      yaxis: {
        showgrid: false,
        zeroline: false,
        showticklabels: false,
        showline: false,
      },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      modebar: {
        orientation: 'v',
        bgcolor: 'rgba(0,0,0,0)',
        activecolor: 'rgba(0,0,0,0)',
      },
    };

    return { data: [heatmapData], layout };
  } catch (error) {
    console.error('ERROR CREATING PLOT:', error);
    throw error;
  }
}

// GET PLOT DATA
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'mens_pants';
    
    const plotData = createPlot(category);
    return NextResponse.json(plotData);
  } catch (error) {
    console.error('ERROR IN PLOT API:', error);
    return NextResponse.json(
      { error: 'Failed to generate plot data' },
      { status: 500 }
    );
  }
} 