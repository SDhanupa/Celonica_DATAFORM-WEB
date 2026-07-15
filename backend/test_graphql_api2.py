import urllib.request
import json

url = 'http://localhost:8000/graphql'
query = """
query GetGnByCoordinates($lat: Float!, $lng: Float!) {
  gnByCoordinates(lat: $lat, lng: $lng) {
    id
    code
    nameEn
    pDistrict {
      admin2NameEn
    }
  }
}
"""
variables = {"lat": 8.1986, "lng": 80.2826}

data = json.dumps({"query": query, "variables": variables}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
except urllib.error.URLError as e:
    print("Error:", e.read().decode('utf-8') if hasattr(e, 'read') else str(e))
