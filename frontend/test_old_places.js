const key = 'AIzaSyAh_vmq7PAbpfUmFKL-O5u2BwV2baNDYFQ';
fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=18.5204,73.8567&rankby=distance&type=hospital&key=${key}`)
.then(r => r.json())
.then(d => console.log(JSON.stringify(d).slice(0, 500)))
.catch(console.error);
