/* "StAuth10244: I Allan Le, 000804364 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else." */
/* VARIABLES */

/* 
** GET COORDINATES AND STORE IN LOCAL STORAGE FOR PERSISTANT DATA
*/
navigator.geolocation.getCurrentPosition(function (p) {
    localStorage.setItem("latitude", p.coords.latitude);
    localStorage.setItem("longitude", p.coords.longitude)
}, function (e) { console.log(e) })

let currentLat = parseFloat(localStorage.latitude);

let currentLng = parseFloat(localStorage.longitude);

let currentLoc = { lat: currentLat, lng: currentLng }



//Call json create a list of markers
const json = "json/Oakville_Facilities.json";

const iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';

let markers = [];

let icon;

let info_window;

let position;

let currentLocationDisplay = document.querySelector('#current-location');

let currentDestinationDisplay = document.querySelector('#current-destination');

let travelMethodDisplay = document.querySelector('#travel-method');

travelMethodDisplay.innerHTML = "Driving";

let routeTimeDisplay = document.querySelector('#route-time');


let travelMethod = "DRIVING";
//*****************************EVENT LISTENERS FOR FILTER BUTTONS *************************** */
document.querySelector('#all').addEventListener("click", () => setPoints(""));

document.querySelector('#outdoor-pool').addEventListener("click", () => setPoints("Outdoor Pool"));

document.querySelector('#indoor-pool').addEventListener("click", () => setPoints("Indoor Pool"));

document.querySelector('#splash-pad').addEventListener("click", () => setPoints("Splash Pad"));

const dropDown = document.querySelector('.dropdown-menu');

const mapPoints = {
    mohawk: {
        lat: 43.2387, lng: -79.8881
    },
    mohawkAviation: {
        lat: 43.1632, lng: -79.9226
    },
    oakvilleCoordinates: {
        lat: 43.4675, lng: -79.6877
    }
}





/* FUNCTIONS */

function initMap() {
    icon = {
        url: iconBase + 'swimming.png', 
        scaledSize: new google.maps.Size(25, 25), 
    };
    const geocoder = new google.maps.Geocoder();
    const infowindow = new google.maps.InfoWindow();
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();

    window.addEventListener("load", function () {
        geocodeLatLng(geocoder, map, infowindow);
    });

    map = new google.maps.Map(document.getElementById("map"),
        {
            center: mapPoints.oakvilleCoordinates,
            zoom: 11,
        });
}

function geocodeLatLng(geocoder, map, infowindow) {

    geocoder
        .geocode({ location: currentLoc })
        .then((response) => {
            if (response.results[0]) {
                map.setZoom(11);

                const marker = new google.maps.Marker({
                    position: currentLoc,
                    map: map,
                });
                const userAddress = response.results[0].formatted_address
                infowindow.setContent(userAddress);
                currentLocationDisplay.innerHTML = userAddress;
                infowindow.open(map, marker);
            } else {
                window.alert("No results found");
            }
        })
        .catch((e) => window.alert("Geocoder failed due to: " + e));
}



function calcRoute(start, destination, travelMethod) {
    let request = {
        origin: start,
        destination: destination,
        travelMode: travelMethod
    }
    directionsService.route(request, function (result, status) {
        if (status == 'OK') {
            // Get various metadata of the result object, in this case we will get route time
            console.log(result.routes[0].legs[0].duration.text)
            let routeTime = result.routes[0].legs[0].duration.text
            routeTimeDisplay.innerHTML = routeTime
            directionsRenderer.setDirections(result);
        }
    });
}

const setPoints = (filterType) => {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    getPoints(filterType);
}



for (let i = 0; i < 3; i++) {
    dropDown.children[i].addEventListener("click", () => {
        travelMethod = dropDown.children[i].getAttribute('value');
        travelMethodDisplay.innerHTML = dropDown.children[i].innerHTML;
        calcRoute(currentLoc, position, travelMethod)
        console.log(travelMethod)
    });
}




function createMarker(pos, t) {
    var marker = new google.maps.Marker({
        position: pos,
        title: t,
        icon: icon,

    });

    info_window = new google.maps.InfoWindow({
        content: t,
        maxWidth: 200
    });

    google.maps.event.addListener(marker, 'mouseover', function () {
        info_window.setContent(`<h6>${t}</h6>`)
        info_window.open(map, marker);
    })

    google.maps.event.addListener(marker, 'click', function () {
     

        position = pos;
        directionsRenderer.setMap(map);
        calcRoute(currentLoc, pos, travelMethod)
        currentDestinationDisplay.innerHTML = t;

    });
    return marker;
}

function updateContent() {
    infowindow.setContent("Yo");
}

/* 
  Reads the json filters the json for pools only 
  Will also get the type to filterby
*/
async function getPoints(type) {
    const response = await axios.get(json);
    const facilities = response.data.features;
    const features = ["Outdoor Pool", "Pool", "Indoor Pool", "Splash Pad"]

    const checkType = (facility, type) => {
        if (type === '') {
            return -1
        } else {
            return facility.properties.DESCRIPTIO === type;
        }

    }
    
    const waterFeatures = facilities.filter(facility => features.includes(facility.properties.DESCRIPTIO))
    const filteredFeatures = waterFeatures.filter(facility => checkType(facility, type))

    filteredFeatures.forEach(facility => {

        let coordinates = {
            lat: facility.geometry.coordinates[1], lng: facility.geometry.coordinates[0]
        }

        const title = facility.properties.NAME
       
        var marker = createMarker(coordinates, title)
        marker.setMap(map);
        markers.push(marker);
    })
}

getPoints('')



