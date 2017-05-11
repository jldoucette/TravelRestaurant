  $(document).ready(function(){
  // Initialize Firebase
 //Jonathan - changed to use my firebase database, change back to Alan's
  var config = {
    apiKey: "AIzaSyC0AoLNlLPPm7MniMZydMwrzKAjhMcT-QE",
    authDomain: "travelrestaurant-ad1b4.firebaseapp.com",
    databaseURL: "https://travelrestaurant-ad1b4.firebaseio.com",
    projectId: "travelrestaurant-ad1b4",
    storageBucket: "travelrestaurant-ad1b4.appspot.com",
    messagingSenderId: "937616184848"
  };
  firebase.initializeApp(config);

  var database=firebase.database();
  var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");
connectedRef.on("value", function(snap) {
  if (snap.val()) {
    var con = connectionsRef.push(true);
    con.onDisconnect().remove();
  }
});

// Jonathan - initializing variables used in script

var nameInput="Guest";
var emailInput="no email";
var data={};
var searchedLocation={};
var cityInput={};
var searchTime;
var otherInputRegEx=/^[a-zA-Z0-9\s\.,]+$/;
var emailInputRegEx=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var zomatoSearchType="cities";
var zomatoCuisineSearchType="cuisines";
var zomatoSearchCity="?lat=40.711251&lon=-74.010296";
var zomatoCityID;
var zomatoSearchCityIDType="cuisines";
var zomatoCuisineSearch;
var locationLat;
var locationLon;
var zomatoSearchLocation;
var cuisineName;
var cuisineID;
var searchData={};
searchData[nameInput]={
    cityInput
  }

// Jonathan - adding user info to database
$("#submitUser").on("click", function(event) {
      event.preventDefault();
      nameInput= $("#userName").val().trim();
      emailInput= $("#email").val().trim();
      console.log("Name eval "+ otherInputRegEx.test(nameInput) + " Email Eval: " + emailInputRegEx.test(emailInput));
      
      if ((otherInputRegEx.test(nameInput)) && (emailInputRegEx.test(emailInput))) {
          console.log("Submit username value of nameInput: "+nameInput);
          console.log("Submit email value of emailInput: "+emailInput);
          data[nameInput]={
          name:nameInput,
          email:emailInput
      };
      
        //Jonathan - writes 
      //input name and email to DB, will update or add as necessary
      database.ref("/users").update(data); 
        $('#userName').val('');
        $('#email').val('');
        displaySearchHistory();
}
else {
  console.log("Epic Fail");
  $("#invalidUser").prepend("<h2>Invalid Username or email, no special characters allowed</h2>"); 
        setTimeout(function() {
          console.log("continue after timer");
          $("#invalidUser").empty();
          $('#userName').val('');
          $('#email').val('');
        }, 2000);
        nameInput='Guest';
        emailInput='no email';
}

    });

// Jonathan - Database actions on searching for food ingredient
   $("#searchButton").on("click", function(event) {
      event.preventDefault();
   
     searchedLocation= $("#cityInput").val().trim();
     console.log("City that was input "+ searchedLocation);
   //Jonathan - following code checks for only letters
      if (otherInputRegEx.test(searchedLocation)) {
        console.log("Matches RegEx Pattern: True");
        searchTime=moment().format(); 
        database.ref("/citySearches/"+nameInput).push({
        searchedLocation,
        timeStamp:searchTime
      });
        $('#cityInput').val(''); 
      codeAddress();
      }

      else {
        console.log("Does NOT match RegEx: False");

        $("#errorMessage").prepend("<h2>Invalid Search item, try again!</h2>" 
          + "<h3>Hint: Only letters allowed, no special characters</h3>");
        setTimeout(function() {
          console.log("continue after timer");
          $("#errorMessage").empty();
          $('#cityInput').val(''); 
        }, 2000);


      console.log(/^[a-zA-z\s\.]+$/.test(cityInput));
   }
// Jonathan - logs search item, with name as key in separate DB reference /searches
       displaySearchHistory();

});


// Jonathan - gets last 3 searches by registered user
function displaySearchHistory() {
   return firebase.database().ref('/citySearches/' + nameInput).limitToLast(3).once('value').then(function(snapshot) {
  
        $("#userDetails").html("<h3>Welcome "+nameInput+" Email: "+emailInput+"</h3>" +
            "<h4>Here are your last 3 searched locations</h4>");
        $("#searchedItemsList").empty();
            snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val().searchedLocation;
            var childTstamp=childSnapshot.val().timeStamp;
            console.log("Search Key: " + childKey + " Search Data: " + childData + " Timestamp: "+childTstamp);
        $("#searchedItemsList").prepend("<ul>"+childData+"</ul>");
    });  
 
});
  }
function getCuisines() {
  console.log("getCuisines Lat "+locationLat);
  console.log("getCuisines Lon "+locationLon);
      zomatoSearchLocation="?lat="+locationLat+"&lon="+locationLon;
        $.ajax({
          url: 'https://developers.zomato.com/api/v2.1/cuisines'+zomatoSearchLocation,
          method: 'GET',
          beforeSend: function(request) {
            request.setRequestHeader('user-key', '0479a7ed872a00d5eefcde91517a433d');
          }
        }).done(function(response) {
            console.log(response);
            $("#cuisineResultsForCity").empty();
            $("#cuisineResultsForCity").append("<ul>");
            $("#cuisineResultsForCity").append("<li><strong>Select Preferred Cuisine</strong></li>");
            response.cuisines.forEach(function(cuisineInfo,index){
            cuisineName=response.cuisines[index].cuisine.cuisine_name;
            cuisineID=response.cuisines[index].cuisine.cuisine_id;
            console.log("Cuisine Name: "+cuisineName);
            console.log("Cuisine ID: "+cuisineID);
            $("#cuisineResultsForCity").append("<li class='cuisineList'></li><a href'#' data-cuisineID="+cuisineID+" data-cuisineName="+cuisineName+">"+cuisineName+"</a></li>");
            });

            $("#cuisineResultsForCity").append("</ul>");
            $("#cuisineResultsForCity").on("click", function(event) {
              console.log("Waiting for click on cuisineList");
            event.preventDefault();
            // console.log("selected item Name: " + $(this).attr("data-cuisineName"));
            // console.log("this value: " + this);

            // cuisineName=$(this).attr("data-cuisineName");
            // cuisineID=$(this).attr("data-cuisineID");
            searchedLocation= $("#cityInput").val().trim();
            cuisineName=response.cuisines[16].cuisine.cuisine_name;
            cuisineID=response.cuisines[16].cuisine.cuisine_id;
            console.log("Selected Cuisine ID: "+cuisineID +" Selected Cuisine Name: "+cuisineName);
            runZomatoLatLon();
           
          });
          return
      });
      }
    
function runZomatoLatLon() {
  console.log("runZomato Lat "+ locationLat);
  console.log("runZomato Lon "+ locationLon);
$.ajax({
url: 'https:developers.zomato.com/api/v2.1/search?count=5&lat='+locationLat+'&lon='+locationLon+'&cuisines='+cuisineID+'&sort=rating&order=desc',

  // url: 'https://developers.zomato.com/api/v2.1/'+zomatoSearchCityIDType+zomatoSearchCity,
  method: 'GET',
  beforeSend: function(request) {
    request.setRequestHeader('user-key', '0479a7ed872a00d5eefcde91517a433d');
  }
  // data: {
  //   phrase: $('query').val().trim()
  // }
}).done(function(response) {
  console.log(response);
   $("#restaurantList").empty();
   $("#restaurantList").append("<h4>Restaurant Results</h4><br><ol>");
  response.restaurants.forEach(function(restaurantInfo,index){
    var restaurantName=response.restaurants[index].restaurant.name;
    var restaurantAddress=response.restaurants[index].restaurant.location.address;

    var restaurantRating=response.restaurants[index].restaurant.user_rating.aggregate_rating;
    var restaurantCuisines=response.restaurants[index].restaurant.cuisines;

    // var restaurantName=response.restaurants[1].restaurant.name;
    // var restaurantRating=response.restaurants[1].restaurant.user_rating.aggregate_rating;
    // var restaurantCuisines=response.restaurants[1].restaurant.cuisines;

    // var restaurantPriceRange=response.restaurants[2].restraurant.offers.price_range;
    console.log(restaurantName);
    console.log(restaurantAddress);
    console.log(restaurantRating);
    console.log(restaurantCuisines);
   
    $("#restaurantList").append("<li class='restaurantList'><strong>Restaurant: </strong>"+ 
      restaurantName+"<br><strong>Rating: </strong>"+
      restaurantRating + "<br><strong>Address: </strong>" + 
      restaurantAddress + "<br><strong>Restaurant Cuisine(s): </strong>" + 
      restaurantCuisines +"</li><br>");
    // console.log(restaurantPriceRange);
  });
   $("#restaurantList").append("</ol>");
  // var restaurantResult=response.restaurants.;
  // console.log(zomatoCityID);
  // $('#results').empty();
  // response.images.forEach(function(image) {
  //   $('#results').append($('<img>').attr('src', image.display_sizes[0].uri));
  //   });
  });
}
var geocoder;
  function initialize() {
    geocoder = new google.maps.Geocoder();
    // var latlng = new google.maps.LatLng(-34.397, 150.644);
    // var mapOptions = {
    //   zoom: 8,
    //   center: latlng
    // }
}

function codeAddress() {
    console.log("Start codeAddress");
    var address = searchedLocation;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == 'OK') {
      console.log(status);
      console.log(results); 
      locationLat=results[0].geometry.bounds.f.f;
      locationLon=results[0].geometry.bounds.b.b;
      console.log("codeAddress Lat is "+locationLon);
      console.log("codeAddress Lon is " +locationLat);
      getCuisines();
      console.log("Ran getCuisines from codeAddress");
      // runZomatoLatLon();
      // console.log("Ran runZomatoLatLon from codeAddress");
  }
      
      else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
 
    });

  }

  initialize();



});