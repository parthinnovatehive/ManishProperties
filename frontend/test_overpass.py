import urllib.request, json
lat, lng, radius = 18.5204, 73.8567, 3000
query = f"[out:json];(node['amenity'='school'](around:{radius},{lat},{lng});node['amenity'='hospital'](around:{radius},{lat},{lng});node['shop'='supermarket'](around:{radius},{lat},{lng}););out center;"
req = urllib.request.Request('https://overpass-api.de/api/interpreter', data=query.encode('utf-8'), headers={'Content-Type': 'text/plain'})
resp = urllib.request.urlopen(req).read()
data = json.loads(resp)
elements = data.get('elements', [])
def count(key, field):
    matches = [x for x in elements if x.get('tags', {}).get(field) == key]
    named = len([m for m in matches if m.get('tags', {}).get('name')])
    print(f'{key}: {len(matches)} total, {named} have names')
count('school', 'amenity')
count('hospital', 'amenity')
count('supermarket', 'shop')
