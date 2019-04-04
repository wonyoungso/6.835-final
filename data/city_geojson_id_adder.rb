require 'json'
require 'httparty'
require 'uri'
require 'byebug'
json = JSON.parse(File.read('./public/data/rent_cities.json'), symbolize_names: false)
geojson = JSON.parse(File.read('./cities_geo.json'), symbolize_names: true)
results = []

geojson[:features].each_with_index do |f, i|
  results << {
    RegionID: json[i]["RegionID"],
    RegionName: json[i]["RegionName"],
    houseValues: json[i]["houseValues"]
  }
  f[:properties][:RegionID] = json[i]["RegionID"]
  # byebug
  json[i].each do |k, v|
    if k.split("-").length >= 2
      f[:properties][k] = v
    end
  end

end

File.open("cities_geo_final.json", 'w') { |file| file.write(JSON.pretty_generate(geojson)) }
puts "cities geo final created"


File.open("./src/constants/rent_cities.json", 'w') { |file| file.write(JSON.pretty_generate(results)) }
puts "cities for constants updated"