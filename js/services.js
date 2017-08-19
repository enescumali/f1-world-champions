// Get Champions, Race Winners and Number of Races in a Season
app.service("standingsService", function ($http) {
    
  // Get Champions by selected year range (default: 2005 - 2015)
  this.getChampions = function(start, end) {
      
      // Champions will be stored here
      var championList = [];
       
      // There is no API that responses only champions in a range (or a season),
      // So, we are sending a request for each season and selecting the champion from response
      for ( var year = start; year <= end; year++ ) {

        $http.get(defaults.BASE_URL + year + "/driverStandings.json")
          .success(function(data){
            
            // Parsing response data
            var season = data.MRData.StandingsTable.season;

            // "StandingsLists[0]" means champion driver 
            var driverObj = data.MRData.StandingsTable.StandingsLists[0].DriverStandings[0].Driver;

            var givenName = driverObj.givenName;
            var familyName = driverObj.familyName;
            var driverId = driverObj.driverId;
            
            // Adding champions and seasons datas to the array
            // Didn't use "push", because, the datas are not come ordered (async calls).
            // So, we are adding datas with their orders. So, we are able to sort them by their indexes.  
            championList[ season - start ] = {
              "givenName": givenName,
              "familyName": familyName,
              "season": season,
              "driverId" : driverId
            };

            // Removing spinner, showing table
            document.getElementById("homepageSpinner").classList.add('hidden');
            document.getElementById("homepageTableBody").classList.remove('hidden');
        }); 
      } 
     
      return championList;
  }

  // Get Winners by Selected season
  this.getWinners = function(season, callback) {

    // Again, we don't have an API that responses ONLY winner drivers of a race.
    // So, first, we need to get how many races are there in selected season (can be changed year to year)
    // It's an async call and we have to wait the response before taking an action.
    // After "getNumberOfRaces" method responses us number of races in selected season
    // We use this data and start to sending request
    this.getNumberOfRaces(season).then(function(data) {
       
      var numberOfRaces = data.data.MRData.total;
      var winnerList = [];

      for ( var race = 1; race <= numberOfRaces; race++ ) {

        $http.get(defaults.BASE_URL + season + "/" + race + "/results.json")
          .success(function(data) {
            
            // Parsing datas
            var racesObj = data.MRData.RaceTable.Races[0];

            var round = racesObj.round;
            var date = racesObj.date;
            var raceName = racesObj.raceName;
            var team = racesObj.Results[0].Constructor.name;
            var laps = racesObj.Results[0].laps;
            var time = racesObj.Results[0].Time.time;
            
            var driverObj = racesObj.Results[0].Driver;
            
            var givenName = driverObj.givenName;
            var familyName = driverObj.familyName;
            var driverId = driverObj.driverId;

            // We are adding datas to the array with round order
            winnerList[round-1] = {
              "givenName"  : givenName,
              "familyName" : familyName,
              "round" : round,
              "driverId" : driverId,
              "raceName":raceName,
              "date" : date,
              "team" : team,
              "laps": laps,
              "time" : time
            };

            // Removing spinner, showing table
            document.getElementById("detailSpinner").classList.add('hidden');
            document.getElementById("detailTableBody").classList.remove('hidden');  

        });
      }  

      // Return winner list as a parameter
      callback(winnerList);

    })
  }

  // Get number of races in a season
  this.getNumberOfRaces = function(season) {
  
     return $http.get(defaults.BASE_URL + season + ".json");
  
  }

  this.getNumberOfSeasons = function(){
    
    return $http.get(defaults.BASE_URL + "seasons.json?limit=70&offset=0")
     
  }
});