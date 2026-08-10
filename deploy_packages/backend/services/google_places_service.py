import requests
from config import Config

def search_place(query, location=None, radius=5000):
    """
    Search for places using Google Places API
    
    Args:
        query: Search query (e.g., "restaurants in Pune")
        location: Tuple of (lat, lng)
        radius: Search radius in meters
    
    Returns:
        list: List of places
    """
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    
    params = {
        'query': query,
        'key': Config.GOOGLE_PLACES_API_KEY,
        'radius': radius
    }
    
    if location:
        params['location'] = f"{location[0]},{location[1]}"
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data.get('status') == 'OK':
        return data.get('results', [])
    return []

def get_place_details(place_id):
    """Get detailed information about a place"""
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    
    params = {
        'place_id': place_id,
        'key': Config.GOOGLE_PLACES_API_KEY,
        'fields': 'name,formatted_address,geometry,photos,rating,user_ratings_total,types,formatted_phone_number,website,opening_hours'
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data.get('status') == 'OK':
        return data.get('result')
    return None

def get_nearby_amenities(lat, lng, radius=2000):
    """
    Get nearby amenities for a property location
    
    Returns:
        dict: Categorized amenities
    """
    amenities = {
        'hospital': [],
        'school': [],
        'supermarket': [],
        'petrol': [],
        'station': [],
        'bank': [],
        'restaurant': [],
        'atm': [],
        'pharmacy': [],
        'busStation': [],
        'college': [],
        'park': [],
        'airport': [],
        'mall': [],
        'gym': []
    }
    
    # Map amenity types to Google Places types
    amenity_mapping = {
        'hospital': 'hospital',
        'school': 'school',
        'supermarket': 'supermarket',
        'petrol': 'gas_station',
        'station': 'train_station',
        'bank': 'bank',
        'restaurant': 'restaurant',
        'atm': 'atm',
        'pharmacy': 'pharmacy',
        'busStation': 'bus_station',
        'college': 'university',
        'park': 'park',
        'airport': 'airport',
        'mall': 'shopping_mall',
        'gym': 'gym'
    }
    
    for category, place_type in amenity_mapping.items():
        try:
            results = search_place(place_type, location=(lat, lng), radius=radius)
            
            # Get details for top 3 results
            for place in results[:3]:
                place_id = place.get('place_id')
                if place_id:
                    details = get_place_details(place_id)
                    if details:
                        amenities[category].append({
                            'name': details.get('name'),
                            'address': details.get('formatted_address'),
                            'distance': calculate_distance(lat, lng, 
                                                         details.get('geometry', {}).get('location', {}).get('lat'),
                                                         details.get('geometry', {}).get('location', {}).get('lng')),
                            'rating': details.get('rating'),
                            'total_ratings': details.get('user_ratings_total'),
                            'types': details.get('types', [])
                        })
        except Exception as e:
            print(f"Error fetching {category}: {e}")
            continue
    
    return amenities

def calculate_distance(lat1, lng1, lat2, lng2):
    """Calculate distance between two coordinates in kilometers"""
    from math import radians, sin, cos, sqrt, atan2
    
    R = 6371  # Earth's radius in kilometers
    
    lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    return round(R * c, 2)

def get_address_from_coordinates(lat, lng):
    """Get formatted address from coordinates using Geocoding API"""
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    
    params = {
        'latlng': f"{lat},{lng}",
        'key': Config.GOOGLE_PLACES_API_KEY
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data.get('status') == 'OK':
        results = data.get('results', [])
        if results:
            return results[0].get('formatted_address')
    
    return None