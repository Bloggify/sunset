const jQuery = window.$ = window.jQuery = require("jquery")
    , i18nMonths = require("./lib/i18n-months")
    , nicepage = require("./nicepage")
    , { getSunsetTimesOnFridays } = require("./lib/util")
//    , Clipboard = require("clipboard")

//result.innerHTML = init()
//const clip = new Clipboard(document.querySelector("[data-clipboard-target]"))
//clip.on("success", e => {
//    e.trigger.innerHTML = "Copied"
//})


// TODO
// On click Next: scroll page to next section
// table view - locations to be selected by default
// locations decimals: 2, 3?
// Implement Generate View
// Map style
// Map position after search

$("button.generate-map").on("click", () => {
    $("div#table-view div.contents").html("");

    const locations = [];
    let url = "https://sunset.bloggify.org/?";
    $("table .location-item").each(function() {
        const locationItem = {
            "text": $(this).find("span.place span").text(),
            "lat": $(this).find("span.lat span").text(),
            "lng": $(this).find("span.lng span").text()
        };
        locations.push(locationItem)

        $("div#table-view div.contents").append(`<p class='result-item'>${JSON.stringify(locationItem)}</p>`);

        url = `${url}l=${locationItem.lat},${locationItem.lng}%7C${locationItem.text}&`
    });

    const quarter = $("select[name='months']").val();
    const year = $("select[name='year']").val();

    url = `${url}quarter=${quarter}&year=${year}&hl=ro`;
    console.log(url);
    $("div#table-view div.contents").append(`<a href='${url}' target='_blank'>View table</a>`);

    const sunsetRequestData = {
        quarter,
        year,
        locations,
        hl: "en"
    }


    const result = getSunsetTimesOnFridays(sunsetRequestData)

    debugger

});

$(document).on('keypress', '.editable', ({which}) => which != 13);
$("button.remove-location").on("click", function () {
    $(this).closest("tr").remove();
});


const initSearch = () => {
    const map = L.map('map', {scrollWheelZoom: false}).setView([0, 0], 1);

    map.invalidateSize()
    map.scrollWheelZoom.disable();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const search_control = L.esri.Geocoding.geosearch().addTo(map);

    const results = L.layerGroup().addTo(map);

    search_control.on('results', data => {
        results.clearLayers();

        $("div#status div.contents").html("");

        for (let i = data.results.length - 1; i >= 0; i--) {
            const location = data.results[i];

            results.addLayer(L.marker(location.latlng));

            const $new_location = $("div#templates .location-item").clone(true);

            $new_location.find("span.place span").text(location.text);
            $new_location.find("span.lng span").text(location.latlng.lng.toFixed(3));
            $new_location.find("span.lat span").text(location.latlng.lat.toFixed(3));

            $new_location.appendTo("table#locations tbody:last-child");
        }
    });
}

initSearch()
