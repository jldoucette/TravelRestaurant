  $(document).ready(function(){
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

      var nameInput="Guest";
      var emailInput="not available or entered.";
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
      var $cuisineList;
      var selectedCuisine;
      var restaurantName;
      var restaurantAddress;
      var restaurantRating;
      var restaurantCuisines;
      var distanceFromLocation=3219;
      var mapZoomRate=10;
      var cuisineListAppend;
      var resultsDesired=10; 
      var zoomSetting=14;
      var listRestaurantName;
      var listRestaurantAddress;
      var listRestaurantCity;
      var listRestaurantCuisines;
      var listRestaurantMenuURL;
      var listRestaurantRating;
      var storedRestaurantName;
      var storedRestaurantAddress;
      var storedRestaurantCity;
      var storedRestaurantCuisines;
      var storedRestaurantMenuURL;
      var storedRestaurantRating;
      var storedTimeStamp;

      searchData[nameInput]={
          cityInput
          }

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

          database.ref("/users").update(data); 
            $('#userName').val('');
            $('#email').val('');
            $("#searchedItemsHeader").show();
            displaySearchHistory();
            $("#userDetails").html("<h2>Welcome "+nameInput+"! <small>Your registered email is "+emailInput+"</small></h2>");
            
    }

      else {
      console.log("Epic Fail");

      console.log("Does NOT match RegEx: False");
            $('#badUserPassMdl').empty();
            $('#badUserPassModal').modal('show');
            $('#badUserPassMdl').append("<h3>An invalid username or email was entered, no special characters are allowed, try again!</h3>" + 
              "<h4>Hint: email format is typically name@domain.com (or .net, .edu, etc). Username should just be letters or numbers.</h4>");
            $('#userName').val('');
            $('#email').val('');
            nameInput='Guest';
            emailInput='no email provided';

      }

    });

    function getRadioValue () {
        if( $('input[name=distance]:radio:checked').length > 0 ) {
            return $('input[name=distance]:radio:checked').val();
        }
        else {
            return 0;
        }
    }


        $('input[name=distance]:radio').click( function() {
            distanceFromLocation = getRadioValue();
            console.log("new input distance is "+distanceFromLocation);
            if(distanceFromLocation==1609) {
              zoomSetting=15;
            }
            else if(distanceFromLocation==3219) {
              zoomSetting=14;
            }
            else if(distanceFromLocation==8047) {
              zoomSetting=13;
            }
             else if(distanceFromLocation==32187) {
              zoomSetting=12;
            }
            else {
              zoomSetting=14;
            }
        });

       $("#searchButton").on("click", function(event) {
          event.preventDefault();
        initializePreResults();
         searchedLocation= $("#cityInput").val().trim();
         console.log("City that was input "+ searchedLocation);
       
          if (otherInputRegEx.test(searchedLocation)) {
            console.log("Matches RegEx Pattern: True");


            $('#cityInput').val(''); 
          codeAddress();
          }

          else {
            console.log("Does NOT match RegEx: False");
            $('#badSearchMdl').empty();
            $('#badSearchModal').modal('show');
            $('#badSearchMdl').append("<h3>Invalid Search address, try again!</h3>" + 
              "<h4>Hint: Only letters, commas and periods allowed, no special characters</h4>");
            $('#cityInput').val(''); 
      


          console.log(/^[a-zA-z\s\.]+$/.test(cityInput));
          }

          console.log("Display Search History being run.");
          displaySearchHistory();
      });

    function displaySearchHistory() {
       return firebase.database().ref('/citySearches/' + nameInput).once('value').then(function(snapshot) {
            
            $("#searchedItemsList").empty();
            $("#searchedItemsHeader").empty();
            $("#searchedItemsHeader").append("<h4>List of Saved Restaurants</h4>");
                snapshot.forEach(function(childSnapshot) {
                storedRestaurantID=childSnapshot.val().restaurantID,
                storedRestaurantName=childSnapshot.val().restaurantName,
                storedRestaurantAddress=childSnapshot.val().restaurantAddress,
                storedRestaurantCity=childSnapshot.val().restaurantCity,
                storedRestaurantCuisines=childSnapshot.val().restaurantCuisines,
                storedRestaurantMenuURL=childSnapshot.val().restaurantMenuURL,
                storedRestaurantRating=childSnapshot.val().restaurantRating,
                storedTimeStamp=childSnapshot.val().timeStamp;
                console.log("Name: " + storedRestaurantName + " Address: " + storedRestaurantAddress
                 + " City: "+ storedRestaurantCity + " Cuisines: "+storedRestaurantCuisines+" Menu URL: "
                 +storedRestaurantMenuURL+" Rating: "+storedRestaurantRating+" Time: "+storedTimeStamp);
            $("#searchedItemsList").prepend("<ul><a class='listRestID' href'#' data-restid='"+storedRestaurantID+"'>"+storedRestaurantCity+": "+storedRestaurantName+"</a></ul>");
            });  
    
      });

    }

    function getCuisines() {
      $("#cuisineResultHeader").show();
      $("#cuisineResultsForCity").show();
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
                cuisineListAppend="<div class='dropdown'>"+
                "<button class='btn btn-default dropdown-toggle cuisines' type='button' data-toggle='dropdown'>" +
                  "Choose One<span class='caret'></span></button>"+
                "<ul class='dropdown-menu'>";
                console.log("First cuisineListAppend is: "+cuisineListAppend);
                  response.cuisines.forEach(function(cuisineInfo,index){
                  cuisineName=response.cuisines[index].cuisine.cuisine_name;
                  cuisineID=response.cuisines[index].cuisine.cuisine_id;
                  console.log("Cuisine Name: "+cuisineName);
                  console.log("Cuisine ID: "+cuisineID);
              
                cuisineListAppend+="<li class='cuisineResult'><a class='cuisineList' href'#' data-cuisineID="+cuisineID+" data-cuisineName="+cuisineName+">"+cuisineName+"</a></li>";
                });
                   console.log("Second cuisineListAppend is: "+cuisineListAppend);

                cuisineListAppend+="</ul>"+"</div>";
                console.log("Last cuisineListAppend is "+cuisineListAppend);
                $("#cuisineResultsForCity").append(cuisineListAppend);
                $('html, body').animate({
                scrollTop: $("#cuisineResultsForCity").offset().top
                }, 1000);

                  });
               
                $('#cuisineResultsForCity').on('click', '.cuisineList',function(event) {  
                  event.preventDefault();
                  selectedCuisine=this;
                
                  console.log("Waiting for click on cuisineList");
                  console.log("selectedCuisine is: " + selectedCuisine);   
                  cuisineName=$(this).attr('data-cuisinename');
                  cuisineID=$(this).attr('data-cuisineid');
                  searchedLocation= $("#cityInput").val().trim();
                  console.log("Selected Cuisine ID: "+cuisineID +" Selected Cuisine Name: "+cuisineName);
                  $("#processingMessage").empty().show();

                  $("#processingMessage").append("<h3><em>Processing Results for "+cuisineName+"...</em></h3>");
                  runZomatoLatLon();
                });
            return
    }
        
    function runZomatoLatLon() {
      console.log("runZomato Lat "+ locationLat);
      console.log("runZomato Lon "+ locationLon);

      $.ajax({
        url: 'https:developers.zomato.com/api/v2.1/search?count='+resultsDesired+'&lat='+locationLat+'&lon='+locationLon+'&cuisines='+cuisineID+'&sort=rating&order=desc&radius='+distanceFromLocation,
        method: 'GET',
        beforeSend: function(request) {
        request.setRequestHeader('user-key', '0479a7ed872a00d5eefcde91517a433d');
        }

    }).done(function(response) {
          console.log(response);
          if (response.results_found==0) {
                console.log("NO RESULTS FOR THAT CUISINE");
            $('#noResultsMdl').empty();
            $('#noResultsModal').modal('show');
            $('#noResultsMdl').append("<h3>No Restaurants Found With Your Search Parameters with that Cuisine</h3>" + 
              "<h4>Unfortuantely we did not find any restaurants serving "+cuisineName+" cuisine within the search radius or city.</h4>" +
              "<p>Select a different cuisine from the left drop-down menu or start your search over." + 
              " The cuisine selections cover the entire city, there may not be a restaurant nearby serving that specific cuisine.</p>");
            }


           $("#resultsArea").show();
           $("#restaurantList").show();
           $("#restaurantListHeader").show();
           $("#mapOfRestaurantsHeader").show();
           $("#mapOfRestaurants").show();
           $("#restaurantList").empty();
           $("#restaurantListHeader").empty();   
           $("#processingMessage").empty().hide();
           $("#restaurantList").focus();
           $("#restaurantListHeader").append("<h4>Top "+resultsDesired+" "+ cuisineName+" Restaurant Results (If necessary, please scroll down for full list!)</h4><ol>");
            console.log("initMap started locationLat "+ locationLat + " locationLon "+ locationLon);
            var cityLocation = {lat: locationLat, lng: locationLon};
            var map = new google.maps.Map(document.getElementById('mapOfRestaurants'), {
              zoom: zoomSetting,
              center: cityLocation
            });
            var marker = new google.maps.Marker({
              position: cityLocation,
              map: map,
              label: 'X'
            });

                var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                var labelIndex = 0;      
                response.restaurants.forEach(function(restaurantInfo,index){
                restaurantName=response.restaurants[index].restaurant.name;
                restaurantAddress=response.restaurants[index].restaurant.location.address;
                restaurantCity=response.restaurants[index].restaurant.location.city;
                restaurantRating=response.restaurants[index].restaurant.user_rating.aggregate_rating;
                restaurantCuisines=response.restaurants[index].restaurant.cuisines;
                restaurantMenuURL=response.restaurants[index].restaurant.menu_url;
                restaurantID=response.restaurants[index].restaurant.id;
                var labelMarkerLetter=labels[labelIndex++ % labels.length];
                var restaurantLat=response.restaurants[index].restaurant.location.latitude;
                var restaurantLon=response.restaurants[index].restaurant.location.longitude;
                var latLng = new google.maps.LatLng(restaurantLat,restaurantLon);
                var contentString = '<div id="content">'+
                        '<div id="siteNotice">'+
                        '</div>'+
                        '<h1 id="firstHeading" class="firstHeading">'+restaurantName+'</h1>'+
                        '<div id="bodyContent">'+
                        '<p><br><strong>Rating: </strong>'+
                restaurantRating + '<br><strong>Address: </strong>' + 
                restaurantAddress + '<br><strong>Restaurant Cuisine(s): </strong>' + 
                restaurantCuisines +'</li><br></p>'+
                        '<p>Menu (opens in new tab): <a href='+restaurantMenuURL+' target="_blank">'+
                        restaurantName+
                        '</a><br>'+
                        '</div>'+
                        '</div>';
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                    });
                var marker = new google.maps.Marker({
                        position: latLng,
                        map: map,
                        label: labelMarkerLetter,
                        title: restaurantName
                      });
                marker.addListener('click', function() {
                      infowindow.open(map, marker);
                    });
                    
                    console.log(restaurantName);
                    console.log(restaurantAddress);
                    console.log(restaurantRating);
                    console.log(restaurantCuisines);


        $("#restaurantList").append("<li class='restaurantList'><strong>"+labelMarkerLetter+". Restaurant: </strong>"+ 
          restaurantName+"<br><strong>Rating: </strong>"+
          restaurantRating + "<br><strong>Address: </strong>" + 
          restaurantAddress + "<br><strong>Restaurant Cuisine(s): </strong>" + 
          restaurantCuisines + "<br><strong>Restaurant Menu Link (opens in new tab): </strong><a href='"+restaurantMenuURL+
          "' target='_blank'>"+restaurantName+"</a><br>"+
          "<button class='btn btn-default btn-xs addButton'" +  
          " data-restaurantid="+restaurantID+  
          ">Add to List</button>" + 
          "</li><br>");
        console.log("Rest ID "+ restaurantID);

        $("#restaurantList").append("</ol>");
          });
      });
    }



     



    var geocoder;
      function initialize() {
        geocoder = new google.maps.Geocoder();
        $("#restaurantList").hide();
        $("#mapOfRestaurants").hide();
        $("#resultsArea").hide();
        $("#cuisineResultsForCity").hide();
        $("#cuisineResultHeader").hide();
        $("#restaurantListHeader").hide();
        $("#mapOfRestaurantsHeader").hide();
        $("#searchedItemsHeader").hide();

    }

      function initializePreResults() {

        $("#restaurantList").empty();
        $("#mapOfRestaurants").empty();
        $("#resultsArea").empty();
        $("#cuisineResultsForCity").empty();
        $("#restaurantListHeader").empty();
        $("#restaurantList").hide();
        $("#mapOfRestaurants").hide();
        $("#resultsArea").hide();
        $("#cuisineResultsForCity").hide();
        $("#restaurantListHeader").hide();
        $("#mapOfRestaurantsHeader").hide();
    }

    function codeAddress() {
        console.log("Start codeAddress");
        var address = searchedLocation;
        geocoder.geocode( { 'address': address,

      }, function(results, status) {
          console.log("Status "+status);
          console.log("results "+results);
          if ((status == 'OK') && (results[0].geometry.location_type!='APPROXIMATE')) {
            console.log(status);
            console.log(results); 
            locationLat=results[0].geometry.location.lat();
            locationLon=results[0].geometry.location.lng();
            console.log("codeAddress Lat is "+locationLon);
            console.log("codeAddress Lon is " +locationLat);
            getCuisines();
            console.log("Ran getCuisines from codeAddress");
          }
           else {
            console.log("No address found in codeAddress");
            $('#noAddMdl').empty();
            $('#noAddressModal').modal('show');
            $('#noAddMdl').append("<h3>No results found using that address, try again!</h3>" 
              + "<p>The address you entered is: "+address+ ".</p>" + 
              "<h4>Hint: Try a more specific, valid address</h4>");

          }
        });

      }

      $("#restaurantList").on("click", ".addButton", function(event) {
          event.preventDefault();

          if(nameInput=="Guest") {
            $("#noLoginModal").modal('show');
            console.log("Must be logged in to add restaurants.");
          }
          else {

        selectedRestaurant=this;
        console.log("Clicked Button");
        var dataRestID=$(this).attr("data-restaurantid"); 
        console.log("dataRestID "+ dataRestID);   


      $.ajax({
                url: 'https://developers.zomato.com/api/v2.1/restaurant?res_id='+dataRestID,
                method: 'GET',
                beforeSend: function(request) {
                  request.setRequestHeader('user-key', '0479a7ed872a00d5eefcde91517a433d');
                }
              }).done(function(response) {
                  console.log(response);
                  listRestaurantName=response.name;
                  listRestaurantAddress=response.location.address;
                  listRestaurantCity=response.location.city;
                  listRestaurantCuisines=response.cuisines;
                  listRestaurantMenuURL=response.menu_url;
                  listRestaurantRating=response.user_rating.aggregate_rating;

                  console.log(listRestaurantName);
                  console.log(listRestaurantAddress);
                  console.log(listRestaurantCity);
                  console.log(listRestaurantCuisines);
                  console.log(listRestaurantMenuURL);
                  console.log(listRestaurantRating);



                  addTime=moment().format(); 
                      searchData[dataRestID]={
                      restaurantID:dataRestID,
                      restaurantName:listRestaurantName,
                      restaurantAddress:listRestaurantAddress,
                      restaurantCity:listRestaurantCity,
                      restaurantCuisines:listRestaurantCuisines,
                      restaurantMenuURL:listRestaurantMenuURL,
                      restaurantRating:listRestaurantRating,
                      timeStamp:addTime
          };
     
                  database.ref("/citySearches/"+nameInput).update(searchData);

                  displaySearchHistory();

              });
    }
            });



      $("#searchedItemsList").on("click", ".listRestID", function(event) {
          event.preventDefault();
        selectedRestaurant=this;
        console.log("Clicked Button");
        var dataRestID=$(this).attr("data-restid"); 
        console.log("dataRestID "+ dataRestID);  
       fbRestID=dataRestID

    return firebase.database().ref('/citySearches/' + nameInput).once('value').then(function(snapshot) {
            console.log("Firebase result" + snapshot);
            
                snapshot.forEach(function(childSnapshot) {
                storedRestaurantID=childSnapshot.val().restaurantID,
                storedRestaurantName=childSnapshot.val().restaurantName,
                storedRestaurantAddress=childSnapshot.val().restaurantAddress,
                storedRestaurantCity=childSnapshot.val().restaurantCity,
                storedRestaurantCuisines=childSnapshot.val().restaurantCuisines,
                storedRestaurantMenuURL=childSnapshot.val().restaurantMenuURL,
                storedRestaurantRating=childSnapshot.val().restaurantRating,
                storedTimeStamp=childSnapshot.val().timeStamp;

     
                if (storedRestaurantID==dataRestID) {
                console.log("Name: " + storedRestaurantName + " Address: " + storedRestaurantAddress
                 + " City: "+ storedRestaurantCity + " Cuisines: "+storedRestaurantCuisines+" Menu URL: "
                 +storedRestaurantMenuURL+" Rating: "+storedRestaurantRating+" Time: "+storedTimeStamp);
                $('#savedRestaurantModal').modal('show');

                var contentString = '<div id="content">'+
                                    '<div id="siteNotice">'+
                                    '</div>'+
                                    '<h1 id="firstHeading" class="firstHeading">'+storedRestaurantName+'</h1>'+
                                    '<div id="bodyContent">'+
                                    '<p><br><strong>Rating: </strong>'+
                                    storedRestaurantRating + '<br><strong>Address: </strong>' + 
                                    storedRestaurantAddress + '<br><strong>Restaurant Cuisine(s): </strong>' + 
                                    storedRestaurantCuisines +'</li><br></p>'+
                                    '<p>Menu (opens in new tab): <a href='+storedRestaurantMenuURL+' target="_blank">'+
                                    storedRestaurantName+
                                    '</a><br>'+
                                    '</div>'+
                                    '</div>';



            $('#savedRestaurantMdl').empty();        
            $('#savedRestaurantMdl').append(contentString);
              }

        }); 
    });
    });

      initialize();

    });

