/*========== M O D E L =============*/

var model = [
  {
    name: "EAGLE MOTEL",
		lat: 30.486282,
		lng: 76.603957,
		show: true,
		selected: false,
		venueid: "4ccaf8f197d0224b5c3656b8"
  },
  {
    name: "SAGAR RATNA HAVELI",
		lat: 30.549354,
		lng: 76.487424,
		show: true,
		selected: false,
		venueid: "4da14beb9935a09301e29d6f"
  },
  {
    name: "BURGER KING",
		lat: 30.486126,
		lng: 76.603998,
		show: true,
		selected: false,
		venueid: "567a7b84498ec6b3d4c73b43"
  },
  {
    name: "MY VILLAGE FAMILY RESTURANT",
		lat: 30.475332,
		lng: 76.617407,
		show: true,
		selected: false,
		venueid: "50cd6612e4b09a6d9c5c5464"
  },
  {
    name: "SIMRAN DA VAISHNO DHABA",
		lat: 30.493870,
		lng: 76.589037,
		show: true,
		selected: false,
		venueid: "50853bcbe4b08785ea756a82"
  },
  {
    name: "MAYUR HOTEL",
		lat: 30.486245,
		lng: 76.602579,
		show: true,
		selected: false,
		venueid: "53140c7b498e9667e1ed557a"
  },
  
];

/*====== View Model =========*/

var viewModel = function() {

  var self = this;

  self.errorDisplay = ko.observable('');

  // populate mapList with each Model
  self.mapList = [];
  model.forEach(function(marker){
    self.mapList.push(new google.maps.Marker({
      position: {lat: marker.lat, lng: marker.lng},
      map: map,
      name: marker.name,
      show: ko.observable(marker.show),  // sets observable for checking
      selected: ko.observable(marker.selected),
      venueid: marker.venueid,   // foursquare venue id
      animation: google.maps.Animation.DROP
    }));
  });

  //store mapList length
  self.mapListLength = self.mapList.length;

  //set current map item
  self.currentMapItem = self.mapList[0];

  // function to make marker bounce but stop after 700ms
  self.makeBounce = function(marker){
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){ marker.setAnimation(null);}, 700); 
  };

  // function to add API information to each marker
  self.addApiInfo = function(passedMapMarker){
      $.ajax({
        url: "https://api.foursquare.com/v2/venues/" + passedMapMarker.venueid + '?client_id=CGOJQ1C3N5GARA4Q53TWRBUWARWXRPEXEG1KM1CCVFDWO2VA&client_secret=OQXLE0UEJOKJLGOM0AT5NA5JE10AXSFNS3GT1PKJGCQ3JJM2&v=20160614',
        dataType: "json",
        success: function(data){
          // stores results to display likes and ratings
          var result = data.response.venue;

          // add likes and ratings to marker
          passedMapMarker.likes = result.hasOwnProperty('likes') ? result.likes.summary: "";
          passedMapMarker.rating = result.hasOwnProperty('rating') ? result.rating: "";
        },
        //alert if there is error in recievng json
        error: function(e) {
          self.errorDisplay("Foursquare data is unavailable. Please try again later.");
        }
      });
  };

  // iterate through mapList and add marker event listener and API information
  for (var i=0; i < self.mapListLength; i++){
    (function(passedMapMarker){
			//add API items to each mapMarker
			self.addApiInfo(passedMapMarker);
			//add the click event listener to mapMarker
			passedMapMarker.addListener('click', function(){
				//set this mapMarker to the "selected" state
				self.setSelected(passedMapMarker);
			});
		})(self.mapList[i]);
  }

  // create a filter observable for filter text
  self.filterText = ko.observable('');


  // calls every keydown from input box
  self.applyFilter = function() {

    var currentFilter = self.filterText();
    infowindow.close();

    //filter the list as user seach
    if (currentFilter.length === 0) {
			self.setAllShow(true);
		} else {
			for (var i = 0; i < self.mapListLength; i++) {
				if (self.mapList[i].name.toLowerCase().indexOf(currentFilter.toLowerCase()) > -1) {
					self.mapList[i].show(true);
					self.mapList[i].setVisible(true);
				} else {
					self.mapList[i].show(false);
					self.mapList[i].setVisible(false);
				}
			}
    }
    infowindow.close();
  };

  // to make all marker visible
  self.setAllShow = function(showVar) {
    for (var i = 0; i < self.mapListLength; i++) {
      self.mapList[i].show(showVar);
      self.mapList[i].setVisible(showVar);
    }
  };

  self.setAllUnselected = function() {
		for (var i = 0; i < self.mapListLength; i++) {
			self.mapList[i].selected(false);
		}
	};

  self.setSelected = function(location) {
		self.setAllUnselected();
        location.selected(true);

        self.currentMapItem = location;

        formattedLikes = function() {
        	if (self.currentMapItem.likes === "" || self.currentMapItem.likes === undefined) {
        		return "No likes to display";
        	} else {
        		return "Location has " + self.currentMapItem.likes;
        	}
        };

        formattedRating = function() {
        	if (self.currentMapItem.rating === "" || self.currentMapItem.rating === undefined) {
        		return "No rating to display";
        	} else {
        		return "Location is rated " + self.currentMapItem.rating;
        	}
        };

        var formattedInfoWindow = "<h5>" + self.currentMapItem.name + "</h5>" + "<div>" + formattedLikes() + "</div>" + "<div>" + formattedRating() + "</div>";

		infowindow.setContent(formattedInfoWindow);

        infowindow.open(map, location);
        self.makeBounce(location);
	};
};
