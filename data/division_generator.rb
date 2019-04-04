require 'json'

json = JSON.parse(File.read('./src/constants/rent_states.json'), symbolize_names: false)

region_result = []
# "RegionName":"West","DivisionName":"Pacific"

json.each do |state|
  idx = region_result.find_index { |r| r["RegionName"] == state["RegionName"] and r["DivisionName"] == state["DivisionName"] }

  if idx == nil
    region = {}
    region["RegionName"] = state["RegionName"]
    region["DivisionName"] = state["DivisionName"]
    
    region_result << region 
  else
    region = region_result[idx]
  end
  state.each do |k, v|
    if k.split("-").length > 1
      
      if region[k] == nil 
        region[k] = []
      end

      if v != nil and v != ""
        region[k] << v
      end
    end
  end

end

region_result.each do |r|
  r.each do |k, v|
    if !(k.is_a? Symbol) and k.split("-").length > 1
      r[k] = (r[k].sum / r[k].length).to_i
    end
  end
end

File.open("rent_division.json", 'w') { |file| file.write(region_result.to_json) }