// Home Controller
app.controller("homeController", function($scope, standingsService, $modal) {
    
    $scope.titleStartYear = defaults.STARTYEAR;
    $scope.titleEndYear = defaults.ENDYEAR;

    // Call to get champions
    $scope.champions = standingsService.getChampions(defaults.STARTYEAR, defaults.ENDYEAR);
    
    // Call to get number of seasons for season filter
    standingsService.getNumberOfSeasons().then(function(data) {
      $scope.seasonList = data.data.MRData.SeasonTable.Seasons;
    });

    var filterObj = {}

    // Preparing filter datas every time season options change
    $scope.changeSelect = function(type, item) {

      if( type == "start" ) filterObj.startYear = item;
      if( type == "end" )   filterObj.endYear = item;

      // If seasons is selected correctly we can make filter button active
      if( filterObj.endYear && filterObj.startYear && filterObj.endYear >= filterObj.startYear ) {
        document.getElementById('filterButton').classList.remove('disabled');  
      }else {
        document.getElementById('filterButton').classList.add('disabled');
      }
    }

    $scope.filterSeason = function(type) {

      // Showing spinner
      document.getElementById("homepageSpinner").classList.remove('hidden');
      document.getElementById("homepageTableBody").classList.add('hidden');

      // Setting title 
      $scope.titleStartYear = filterObj.startYear;
      $scope.titleEndYear = filterObj.endYear;

      // Getting filtered results
      $scope.champions = standingsService.getChampions(filterObj.startYear, filterObj.endYear);    
    } 

    // Modal open method. Season and Champion Driver ID are sent modal (via resolve property)
    // to getting selected season datas and painting the races that won by 
    // the champion driver
    $scope.open = function(season, driverId) {

      var $modalInstance = $modal.open({
        templateUrl: "popup.html",
        controller: "popupController",
        size: "lg",
        resolve: {
          season: function () {
            return season;
          },
          driverId: function () {
            return driverId;
          }
        }
      });

    }
});

// Popup Controller
app.controller("popupController", function($scope, $modalInstance, standingsService, season, driverId) {
  
  // Binding clicked season and champion driver datas to popup view
  $scope.season = season;
  $scope.championDriverId = driverId;
  
  // Sending selected season to get related data
  standingsService.getWinners(season, function( winners ) {
    $scope.winners = winners;
  });

  // Modal close 
  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  };
})