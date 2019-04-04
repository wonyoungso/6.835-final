require 'json'

json = JSON.parse(File.read('./src/constants/rent_counties.json'), symbolize_names: false)


json.each do |d|
  d["GEOID"] = "#{d["StateCodeFIPS"]}#{d["MunicipalCodeFIPS"]}"
end


File.open("rent_counties.json", 'w') { |file| file.write(json.to_json) }