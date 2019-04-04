
# export const convDatesToList = function(data) {
#   data.houseValues = [];
#   _.each(data, (v, k) => {
#     if (!_.isNaN(+v) && k !== "GEOID") {
#       data[k] = +v;

#       if (k.split("-").length === 2) {
#         let date = moment(k, "YYYY-MM");
#         data.houseValues.push([date.toDate(), +v]);
#       }

#     }
#   });
#   return data;
# }

# export const convRentData = function (data) {
#   _.each(data, (d, i)  => {
#     data[i] = convDatesToList(data[i]);
#   });

#   return data;
# }
