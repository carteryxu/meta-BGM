const express = require('express');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from the 'web' directory
app.use(express.static('web'));

// WebSocket connection to inference server
const ws = new WebSocket('ws://localhost:8765');

ws.on('open', function open() {
  console.log('Connected to inference server');
});

let audioCounter = 0;
const recentAudios = [];
const MAX_RECENT_AUDIOS = 5;

app.get('/generate-music', (req, res) => {
  ws.send('generate');
  ws.once('message', (data) => {
    const fileName = `audio_${audioCounter++}.mp3`;
    const filePath = path.join(__dirname, 'web', 'audio', fileName);
    
    fs.writeFile(filePath, data, (err) => {
      if (err) {
        console.error('Error saving audio file:', err);
        res.status(500).send('Error generating audio');
      } else {
        recentAudios.push(fileName);
        if (recentAudios.length > MAX_RECENT_AUDIOS) {
          const oldestFile = recentAudios.shift();
          fs.unlink(path.join(__dirname, 'web', 'audio', oldestFile), (err) => {
            if (err) console.error('Error deleting old audio file:', err);
          });
        }
        res.json({ audioUrl: `/audio/${fileName}`, previousAudio: recentAudios[recentAudios.length - 2] });
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Web server listening at http://localhost:${port}`);
});