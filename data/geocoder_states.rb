require 'geocoder'
require 'json'

json = JSON.parse(File.read('./constants/rent_states.json'), symbolize_names: true)

json.each do |state|
  state[:location] = Geocoder.search(state[:StateName]).first.coordinates
end


File.open("rent_states.sjon", 'w') { |file| file.write(json.to_json) }