/*map and markers*/

var map;

// Create an array for all the locations markers
var markers = [];

// Load the map and the markers
function initMap(){
	// Create a styles array to use with the map( Attribution to snazzymaps.com )
    var styles = [{
    "elementType": "geometry",
    "stylers": [{
            "hue": "#ff4400"
        },
        {
            "saturation": -68
        },
        {
            "lightness": -4
        },
        {
            "gamma": 0.72
        }
    ]
    },
    {
    "featureType": "road",
    "elementType": "labels.icon"
    },
    {
    "featureType": "landscape.man_made",
    "elementType": "geometry",
    "stylers": [{
        "hue": "#0077ff"
    }, {
        "gamma": 3.1
    }]
    }, {
    "featureType": "water",
    "stylers": [{
        "hue": "#00ccff"
    }, {
        "gamma": 0.44
    }, {
        "saturation": -33
    }]
    }, {
    "featureType": "poi.park",
    "stylers": [{
        "hue": "#44ff00"
    }, {
        "saturation": -23
    }]
    }, {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{
        "hue": "#007fff"
    }, {
        "gamma": 0.77
    }, {
        "saturation": 65
    }, {
        "lightness": 99
    }]
    }, {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [{
        "gamma": 0.11
    }, {
        "weight": 5.6
    }, {
        "saturation": 99
    }, {
        "hue": "#0091ff"
    }, {
        "lightness": -86
    }]
    }, {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{
        "lightness": -48
    }, {
        "hue": "#ff5e00"
    }, {
        "gamma": 1.2
    }, {
        "saturation": -23
    }]
    }, {
    "featureType": "transit",
    "elementType": "labels.text.stroke",
    "stylers": [{
        "saturation": -64
    }, {
        "hue": "#ff9100"
    }, {
        "lightness": 16
    }, {
        "gamma": 0.47
    }, {
        "weight": 2.7
    }]
    }
    ];

    // Center of the map
    var center = {lat: 30.1147939, lng: -95.2307214};

    // Create a map using Google Maps API.
    map = new google.maps.Map(document.getElementById('map'), {
    	center: center,
        zoom: 14,
        styles: styles
    });

    //Create the markers base on locations
    for (var i = 0; i < locations.length; i++) {
    	var marker = new google.maps.Marker({
    		position: locations[i].location,
    		title: locations[i].title,
    		id: i
    	});
    	markers.push(marker);
    };

}

function showMarkers(markers)
{
	if(!map || !markers){
		//wait for the map to load and markers be created
		setTimeout(function(){showMarkers(markers);},100);
	}
	else{
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(map);
			bounds.extend(markers[i].position);
		}
		map.fitBounds(bounds);
	}
}

/*ko*/

// All the locations displayed on the map
var locations = [
   	{title: 'First Baptist Porter', location: {lat: 30.1024607, lng: -95.2389851}},
   	{title: 'Captain D\'s', location: {lat: 30.1023553,lng: -95.2362218}},
   	{title: 'Academy Sports + Outdoors', location: {lat: 30.1331085,lng: -95.2320966}},
   	{title: 'Texan Drive Stadium', location: {lat: 30.1357423,lng: -95.2329521}},
   	{title: 'Little Caesars Pizza', location: {lat: 30.1025538,lng: -95.2350824}},
   	{title: 'Domino\'s Pizza', location: {lat: 30.1019643,lng: -95.2305003}},
   	{title: 'Oakhurst Golf Club', location: {lat: 30.0862627,lng: -95.2598051}},
   	{title: 'Porter High School', location: {lat: 30.1205102,lng: -95.2704333}},
   	{title: 'New Caney High School', location: {lat: 30.132305,lng: -95.2214674}},
   	{title: 'Burger King', location: {lat: 30.1049038,lng: -95.2383795}},
   	{title: 'Mercadito La Mexicana', location: {lat: 30.1075306,lng: -95.2589777}},
   	{title: 'Emerald Lake Resort', location: {lat: 30.1106145,lng: -95.2272312}},
   	{title: 'El Kiosko Frutas Y Helados', location: {lat: 30.1050485,lng: -95.2450048}}
];

// represent a location item
var place = function(data){
	this.title = ko.observable(data.title);
	this.location = ko.observable(data.location);
	this.shown = ko.observable(true);
}

var ViewModel = function(){
	self = this;
	this.locationsList = ko.observableArray([]);
	locations.forEach(function(locationItem){
		self.locationsList.push(new place(locationItem));
	});

	//store the text used for filter the list of locations
	this.filterText = ko.observable();

	this.filteredLocations = ko.computed(function(){
		return self.locationsList().filter(function(location){
			return location.shown();
		});
	});

	//Handle click event on filter button
	this.filter = function(){
		//ko.utils.arrayForEach(self.locationsList(),function(locationItem){});
		self.locationsList().forEach(function(locationItem){
			if(locationItem.title().toLowerCase().includes(self.filterText().toLowerCase())){
				locationItem.shown(true);
			}
			else{
				locationItem.shown(false);
			}
		});
	}

	// Handles click event on list item
	this.highlightLocation = function(location){

	}

	showMarkers(markers);
}

ko.applyBindings(new ViewModel());