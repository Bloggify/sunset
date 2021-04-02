$("document").ready(function() {
  $(document).on('keypress', '.editable', function(e){
      return e.which != 13;
  });

  $("button.generate-map").on("click", function() {
    $("div#table-view div.contents").html("");

    var locations = [];
    var url = "https://sunset.bloggify.org/?"
    $("div#results div.location-item").each(function() {
      var location_item = {
        "text": $(this).find("span.place span").text(),
        "lat": $(this).find("span.lat span").text(),
        "lng": $(this).find("span.lng span").text()
      }

      $("div#table-view div.contents").append("<p class='result-item'>" + JSON.stringify(location_item) + "</p>");

      url = url + "l=" + location_item.lat + "," + location_item.lng + "%7C" + location_item.text + "&"
      // https://sunset.bloggify.org/
      // ?l=44.43333333,26.10000000%7CB
      // &l=44.18333333,28.65000000%7CCT
      // &l=47.16666667,27.60000000%7CIS
      // &l=47.63333333,26.25000000%7CSV
      // &l=46.55000000,24.56666667%7CMS
      // &l=47.80000000,22.88333333%7CSM&
      // l=46.18333333,21.31666667%7CAR
      // &quarter=4
      // &year=2018
      // &hl=ro
    });

    var quarter = $("select#quarter").val();
    var year = $("select#year").val();

    url = url + "quarter=" + quarter + "&year=" + year + "&hl=ro";
    console.log(url);
    $("div#table-view div.contents").append("<a href='" + url + "' target='_blank'>View table</a>");
  });

  $("button.add-location").on("click", function() {
    console.log("Added");
    var $new_result = $(this).parent().clone(true);
    $new_result.find("button.add-location").hide();
    $new_result.find("button.remove-location").show();
    $new_result.appendTo("div#results div.contents");
  });

  $("button.remove-location").on("click", function() {
    console.log("Removed");
    $(this).parent().remove();
  });

  var map = L.map('map', {scrollWheelZoom: false}).setView([0, 0], 1);

  map.scrollWheelZoom.disable();

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var search_control = L.esri.Geocoding.geosearch().addTo(map);

  var results = L.layerGroup().addTo(map);

  search_control.on('results', function (data) {
    results.clearLayers();

    $("div#status div.contents").html("");

    for (var i = data.results.length - 1; i >= 0; i--) {
      var location = data.results[i];

      results.addLayer(L.marker(location.latlng));

      $new_location = $("div#templates div.location-item").clone(true);

      $new_location.find("button.remove-location").hide();
      $new_location.find("span.place span").text(location.text);
      $new_location.find("span.lng span").text(location.latlng.lng);
      $new_location.find("span.lat span").text(location.latlng.lat);

      $new_location.appendTo("div#status div.contents");
    }
  });
});
