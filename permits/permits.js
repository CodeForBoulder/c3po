// Collection for all the cases defined in the DevelopmentReview.GeoJSON file
Cases = new Mongo.Collection("cases");
var devCases = {};
var MAP_ZOOM = 15;
var curAppId ;

if (Meteor.isClient) {
    // counter starts at 0
    Session.setDefault('counter', 0);
    
//    Meteor.subscribe("all-cases");
    
    Meteor.startup(function() {
        console.log("Entered Meteor.startup");
        
        GoogleMaps.load();
        console.log("Loaded GoogleMaps");

        
// c3poDev for localhost:3000 operation

        // set up Facebook sdk

//        $("#feed").click(function () {
//            serverFeed()
//            console.log("in #feed.click()");
//        });
//        Accounts.ui.config({
//            requestPermissions: {
//                facebook: ['publish_actions']
//            }
//        });
        
//    window.fbAsyncInit = function() {
//        console.log("About to call FB.init");

//        FB.init({
////            appId      : curAppId, // set appId based on localhost vs meteor.com host
//            appId      : '109055546115993',
//            status     : true,
//            version    : 'v2.4',
//            xfbml      : true
//        });

//        console.log("Finished call to FB.init");
//    };

//            appId      : '109055546115993', // localhost
//            appId      : '1459289887712466', // c3poTest
    
        $("#nav").slideUp("fast");

        /* set appId for Facebook integration */
        /* First works with ManUnderhill's localhost, second with cfbc3po.meteor.com */
        /* as registered Facebook Apps */
        

        var curHref = location.href;
        console.log("Obtained curHref = " + curHref);
//        var patt = new RegExp("localhost");
//        curAppId = (patt.test(location.href)) ? '109055546115993':'1459289887712466';
//
//        curAppId = '109055546115993';
//        $(".fb-like").attr("data-href",curHref);
        console.log("Leaving Meteor.startup");
    });
    
//    function showFeed() {
//        // Todo:
//        //    1. Get admin's account info, use page key to post to the feed
//        //    2. Get this into the js file!
//        //
//        console.log("Entering showFeed() - disabled");
//
//var feedHtml = FB.api('/914491901967402/feed','post',
//                                  {message: 'Autoposted from app'},
//                                  function(response) {
//                if (!response || response.error) {
//                    alert('Error occured: ' + response.error);
//                    feedHtml = "Error occurred: " + response.error.message;
//                    console.log("fbFeed error: " + feedHtml);
//                } else {
//                    alert('Post ID: ' + response.id);
//                }
//                });
//        $("#fbFeed").html("new value");
//
//        //        console.log("fbFeed = " + feedHtml.toString());
//    };

    function showDetails(e) {
        Modal.show('caseModal')
        // redo to allow for multiple cases
        // find all the cases matching the address of the selected case
        // probably best as a backend search and a Mongo query
        caseNum =  e.feature.getProperty('CASE_NUMBE');
        addr = e.feature.getProperty('CASE_ADDRE');
        selCases = Cases.find({CASE_ADDRE: addr},{fields: {CASE_NUMBE: 1, _id: 0}});
        console.log("selCases:\n" + selCases + "\n");
        selCases.forEach(function (Cases) {
            console.log("Case # " + Cases.CASE_NUMBE);
        });
        $("#modalHead").html("<h3>" + caseNum + "</h3>");
        // for each property, add an HTML paragraph
        e.feature.forEachProperty(function (val, name) {
            str = "<tr><td class='case-property'>"+humanReadableName(name)+":</td><td> "+val+"</td></tr>"
            $("#modalTableData").append(str);
        });
        $("#modalBody").append("<button type='button' class='btn btn-primary modal-btn'>Docs</button>");
        $("#modalBody").append("<button type='button' class='btn btn-primary modal-btn'>Discuss</button>");
        $("#modalBody").append("<button type='button' class='btn btn-primary modal-btn'>Subscribe</button>");            
        $("#modalBody").slideDown("slow",function() {
            $("#nav").show();
            $(this).dblclick(function() {
                $(this).slideUp("slow");
                $("#nav").hide();
            });
            $("#close").click(function() {
                $("#selDetails").slideUp("slow");
                $("#nav").hide();
            });
        }); 
        $("#docsBtn").click(showDocs(caseNum));
    };
    
    function showDocs(caseNum) {
        // insert the document links below the buttons in the selDocs div
        // div starts empty, so no need to hide it on initialization
        // remember to clear it when done
        // first, get the doc names, i.e.:
        console.log("entered showDocs");
        var xmlhttp;
        var docURL = "https://www-webapps.bouldercolorado.gov/pds/publicnotice/docspics.php?caseNumber=";
        
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for older browsers
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
//                var docTitles = xmlhttp.responseText;
                document.getElementById("selDocs").innerHTML =
                    xmlhttp.responseText;
            } else {
                console.log("failed to retrieve documents for caseNumber " + caseNum);
            }
        }
        xmlhttp.open("GET", docURL + caseNum, true);
        xmlhttp.send();

        console.log("leaving showDocs");
        //   GET https://www-webapps.bouldercolorado.gov/pds/publicnotice/docspics.php?caseNumber=LUR2013-00070
        // This returns an array of titles
        // Convert the string so no spaces, etc.
        // Then display the links by appending the titles to:
        //   "https://www-static.bouldercolorado.gov/docs/PDS/plans/"+caseNum+"/"
        // When ready, slideDown this div
        // Provide a close button and double click to slideUp this div.
    };

    function humanReadableName(name) {
      switch(name) {
        case "CASE_NUMBE":
          return "Case Number";
        case "CASE_TYPE":
          return "Type";
        case "APPLICANT_":
          return "Applicant";
        case "CASE_ADDRE":
          return "Address";
        case "CASE_DESCR":
          return "Description";
        case "STAFF_EMAI":
          return "Email";
        case "STAFF_PHON":
          return "Phone";
        case "STAFF_CONT":
          return "Contact";
      }
    }

HTTP.get(Meteor.absoluteUrl("/DevelopmentReview.GeoJSON"), function(err,result) {
        console.log(result.data);
        cases = result;
        for (pCase in cases) {
            console.log("About to insert: ",pCase);
            cases.insert(pCase);
            console.log("Inserted!");
        };
    });


    Template.map.helpers({
        geolocationError: function() {
            console.log("in geolocationError()");
            var error = Geolocation.error();
            return error && error.message;
        },
        mapOptions: function() {
            
            var latLng = Geolocation.latLng();
            // Initialize the map once we have the latLng.
            console.log("in mapOptions -- DISABLED");
            if (GoogleMaps.loaded() && latLng) {
                return {
                    center: new google.maps.LatLng(latLng.lat, latLng.lng),
                    zoom: MAP_ZOOM
                };
            } else {
                console.log("either maps not loaded or latLng missing");
                return {
                    center:
                        {
                            lat: 40.0275, 
                            lng: -105.251945
                        },
                    zoom: MAP_ZOOM
                }
            }
        },
    });

    Template.map.onCreated(function() {
        GoogleMaps.ready('map', function(map) {
            console.log("onCreated - latlng = " + JSON.stringify(latLng) + " DISABLED");
            var latLng = Geolocation.latLng() || {center: { lat: 40.0275, lng: -105.251945}, zoom: MAP_ZOOM};
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(latLng.lat, latLng.lng),
                map: map.instance
            });
            map.instance.data.loadGeoJson('/DevelopmentReview.GeoJSON'); // place json file in /public folder
            map.instance.data.addListener('click', function(event) {
                showDetails(event);
            });
            // Load the GeoJSON information
            var fs = require ('fs');
                var cases;

            // Read the file and send to the callback
            fs.readFile('DevelopmentReview.GeoJSON', handleGeoJSON);

            // GeoJSON load callback
            function handleGeoJSON(err, data) {
                if (err) throw err;
                cases = JSON.parse(data);

            };
        });
    });
    

//    Template.fbbtn.onRendered(function() {
//        console.log("Entered fbbtn.onRendered()");
//
//        try {
//            FB.XFBML.parse();
//        }catch(e) {};
//
//
//        console.log("Leaving fbbtn.onRendered()");
//    });
//   
//    
//   
//    Template.facebookPost.onRendered(function() {
//        console.log("facebookPost.onRendered()");
//        try {
//            FB.XFBML.parse();
//        }catch(e) {}   
//    });

};

if (Meteor.isServer) {
    
    function serverFeed() {
        // Todo:
        //    1. Get admin's account info, use page key to post to the feed
        //    2. Get this into the js file!
        //
        console.log("Entering serverFeed()");

        var pageAccessToken = "1459289887712466|4gmChmzJ2gEpYNJR38jK6g0Leuw";
        FB.api('/109055546115993/accounts','get',function(response) {
            if (!response || response.error) {
                alert('Error on getting app accounts info for app');
            } else {
                alert('Page access for app (accounts object):\n' + response);
            };
        });

        

        var feedHtml = FB.api('/914491901967402/feed','post',
                              {message: 'Autoposted from server on startup',
                               access_token: pageAccessToken
                              },
                              function(response) {
            if (!response || response.error) {
                alert('Error occured: ' + response.error);
                feedHtml = "Error occurred: " + response.error.message;
                console.log("fbFeed error: " + feedHtml);
            } else {
                alert('Post ID: ' + response.id);
            }
            });

            console.log("fbFeed = " + feedHtml.toString());
    };

    Meteor.startup(function () {
        // code to run on server at startup
        // 1. Create a Mongo collection of properties (CASE_NUMBE's) by address from the GeoJSON file.
        // 2. Build a Mongo collection of documents for each property
        //     These are stored in https://www-static-bouldercolorado.gov/docs/PDS/Plans/<CASE_NUMBE>/ folder
        // 3. Build a Mongo collection of features for each CASE_NUMBE
//        devCases = HTTP.get(Meteor.absoluteUrl("/DevelopmentReview.GeoJSON")).data;
        devCases = JSON.parse(Assets.getText("DevelopmentReview.GeoJSON"));        // load the GeoJSON
//        window.alert("parsed the DevelopmentReview.GeoJSON file"); // no window object on the server!
        for (devCase in devCases) {
           Cases.insert(devCase);
        };
        Meteor.publish("all-cases", function () {
            return Cases.find(); // everything
        });
    });
};