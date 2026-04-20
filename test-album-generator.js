import { OllamaPipeline } from './src/index.js';

async function test() {
  console.log('Testing Multi-Step Album Generator...');
  
  try {
    const result = await OllamaPipeline.run('creative/album-generator', {
      answers: {
        albumTitle: 'Neon Nights',
        genre: 'Synthwave',
        songCount: 2 // Keep it small for testing
      },
      onLog: (type, msg) => console.log(`[${type.toUpperCase()}] ${msg}`)
    });

    console.log('--- TEST COMPLETED ---');
    console.log('Final State Keys:', Object.keys(result.state));
    
    if (result.state.trackList && Array.isArray(result.state.trackList)) {
      console.log('Tracklist generated successfully:', result.state.trackList.length, 'songs');
    } else {
      console.error('Tracklist failed to generate correctly!');
    }
  } catch (err) {
    console.error('PIPELINE FAILED:', err);
  }
}

test();
