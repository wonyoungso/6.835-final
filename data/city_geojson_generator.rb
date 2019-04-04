require 'json'
require 'httparty'
require 'uri'
require 'byebug'
json = JSON.parse(File.read('./public/data/rent_cities.json'), symbolize_names: false)

results = {
  "type": "FeatureCollection",
  "features": []
}

json.each do |city|
  
  cityName = "#{city["RegionName"]}, #{city["State"]}"

  response = HTTParty.get("https://api.mapbox.com/geocoding/v5/mapbox.places/#{URI.escape(cityName)}.json?access_token=pk.eyJ1Ijoic2Vuc2VhYmxlIiwiYSI6ImxSNC1wc28ifQ.hst-boAjFCngpjzrbXrShw")

  # response.
  # byebug

  geocoder_results = JSON.parse(response)

  if geocoder_results["features"].length > 0
    coordinates = geocoder_results["features"].first["geometry"]["coordinates"]
  else
    coordinates = [0, 0]
  end

  feature = {
    "type": "Feature",
    "properties": {
      name: city["RegionName"],
      state: city["State"],
      fullName: cityName,
      
    },
      "geometry": {
        "type": "Point",
        "coordinates": coordinates
      }
  }

  puts "#{cityName}: #{coordinates}"
  results[:features].push(feature)
end

File.open("rent_cities_geo.json", 'w') { |file| file.write(results.to_json) }
