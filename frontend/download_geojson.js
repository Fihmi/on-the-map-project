const https = require('https');
const fs = require('fs');

const url = "https://raw.githubusercontent.com/youssef-of-web/state-municipality-tunisia/master/tunisia_administrative_province_state_boundary.geojson";

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('src/data/tunisia.json', data);
    console.log("GeoJSON downloaded successfully.");
  });
}).on('error', (err) => {
  console.error("Error downloading GeoJSON:", err.message);
});
