var app = angular.module('IndiaFood', ['ngRoute']);

app.config(function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'templates/home.html',
            controller: 'loginCtrl'
        })

        .when('/access_token=:token', {
            template: '',
            controller: function($location, $rootScope) {
                var url = $location.path();

                var access = url.indexOf("=");
                var tokenB = url.indexOf("&");
                var access_token = url.substr(access+1,tokenB);
                $rootScope.accessToken = access_token;
                $location.path('/FoodMap')
            }
        })

        .when('/FoodMap', {
            templateUrl: 'templates/food.html',
            controller: 'YelpCtrl'
        })
});

app.controller('loginCtrl', function($scope) {
    $scope.login = function() {
        var client_id = "310152269336-5tksrd4imft0h5kasirj2i37v5m937n5.apps.googleusercontent.com";
        var scope = "profile";
        var redirect_uri = "http://localhost:63342/YelpMap";
        var response_type = "token";
        var url = "https://accounts.google.com/o/oauth2/auth?scope="+scope+"&client_id="+client_id+"&redirect_uri="+redirect_uri+"&response_type="+response_type;
        window.location.replace(url);
    }
});

app.controller('YelpCtrl', function($scope, $rootScope, $http) {
    var map;
    var mapOptions;
    var infowindow = new google.maps.InfoWindow;
    $scope.foodLocations = [
        []
    ];
    $scope.access = $rootScope;

    $scope.initialize = function () {

        $http.get("https://www.googleapis.com/plus/v1/people/me?access_token="+$scope.access.accessToken)
            .success(function(response){
                console.log(response.displayName)
                angular.element(document.querySelector('#username')).html(response.displayName);
            });

        navigator.geolocation.getCurrentPosition(function (position) {

            $scope.lat = position.coords.latitude;
            $scope.lng = position.coords.longitude;
            $scope.pos = new google.maps.LatLng(
             position.coords.latitude,
             position.coords.longitude);

            $scope.pos = new google.maps.LatLng($scope.lat, $scope.lng);
            var mapOptions = {
                zoom: 10    ,
                center: $scope.pos
            };

            map = new google.maps.Map(document.getElementById('map-canvas'),
                mapOptions);

            var marker = new google.maps.Marker({
                position: $scope.pos,
                map: map
            });

            $scope.findFood();

        });

        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    };

    $scope.findFood = function() {

      $scope.latlng = $scope.lat+","+$scope.lng;
      $http.get("https://api.foursquare.com/v2/venues/search?client_id=RCYPBFPK31FDKLE2SNBUOU0UOYE4XJC1EE5SS2CTV34BDSNF&client_secret=JUKB2QYOK5PDQDFMPUPZ3VIPFPP2T0RB5DGLFQO34CF4TPYP&v=20130815&ll="+$scope.latlng+"&query=indian&categoryId=4d4b7105d754a06374d81259")
          .success(function(data){

            for(var i=0;i<data.response.venues.length;i++) {

                var row = [];

                row.push(data.response.venues[i].name);
                row.push(data.response.venues[i].location.address);
                row.push(data.response.venues[i].location.lat);
                row.push(data.response.venues[i].location.lng);
                row.push(data.response.venues[i].location.distance * 0.00062137);
                row.push(data.response.venues[i].contact.phone);

                $scope.foodLocations.push(row);
            }

              for (i = 0; i < $scope.foodLocations.length; i++) {
                  marker = new google.maps.Marker({
                      position: new google.maps.LatLng($scope.foodLocations[i][2], $scope.foodLocations[i][3]),
                      map: map
                  });

                  google.maps.event.addListener(marker, 'click', (function (marker, i) {
                      return function () {
                          infowindow.setContent($scope.foodLocations[i][0]+"<br>"+$scope.foodLocations[i][1]+"<br>Distance: "+$scope.foodLocations[i][4]+" miles");
                          infowindow.open(map, marker);
                      }
                  })(marker, i));
              }
          })

    };
})