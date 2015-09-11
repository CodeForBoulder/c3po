// Collection for all the cases defined in the DevelopmentReview.GeoJSON file
Cases = new Mongo.Collection("cases");
var devCases = {};
var MAP_ZOOM = 15;
var curAppId ;

if (Meteor.isClient) {
    // counter starts at 0
    Session.setDefault('counter', 0);
    
    Meteor.subscribe("all-cases");
    
    Meteor.startup(function() {
        GoogleMaps.load();
        $("#nav").slideUp("fast");

        /* set appId for Facebook integration */
        /* First works with ManUnderhill's localhost, second with cfbc3po.meteor.com */
        /* as registered Facebook Apps */
        
        var curHref = location.href;
        var patt = new RegExp("localhost");
        curAppId = (patt.test(location.href)) ? '109055546115993':'1459289887712466';
        $(".fb-like").attr("data-href",curHref);
    });

    function showDetails(e) {
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
        $("#selDetails").html("<h3>" + caseNum + "</h3>");
        // for each property, add an HTML paragraph
        e.feature.forEachProperty(function (val, name) {
            $("#selDetails").append("<p>",name,":\t",val,"</p>");
        });
        $("#selDetails").append("<button>Docs</button>");
        $("#selDetails").append("<button>Discuss</button>");
        $("#selDetails").append("<button>Subscribe</button>");            
        $("#selDetails").append("<p id='note'>(double click to close and return to the map)</p>");
        $("#selDetails").slideDown("slow",function() {
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
    };
/*
HTTP.get(Meteor.absoluteUrl("/DevelopmentReview.GeoJSON"), function(err,result) {
        console.log(result.data);
        cases = result;
        for (pCase in cases) {
            console.log("About to insert: ",pCase);
            cases.insert(pCase);
            console.log("Inserted!");
        };
    });
*/

    Template.map.helpers({
        geolocationError: function() {
            var error = Geolocation.error();
            return error && error.message;
        },
        mapOptions: function() {
            var latLng = Geolocation.latLng();
            // Initialize the map once we have the latLng.
            if (GoogleMaps.loaded() && latLng) {
                return {
                    center: new google.maps.LatLng(latLng.lat, latLng.lng),
                    zoom: MAP_ZOOM
                };
            }
        },
    });
    
    Template.map.onCreated(function() {
        GoogleMaps.ready('map', function(map) {
            var latLng = Geolocation.latLng();
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(latLng.lat, latLng.lng),
                map: map.instance
            });
            map.instance.data.loadGeoJson('/DevelopmentReview.GeoJSON'); // place json file in /public folder
            map.instance.data.addListener('click', function(event) {
                showDetails(event);
            });

            /*
            // Load the GeoJSON information
            var fs = require ('fs');
                var cases;

            // Read the file and send to the callback
            fs.readFile('DevelopmentReview.GeoJSON', handleGeoJSON)

            // GeoJSON load callback
            function handleGeoJSON(err, data) {
                if (err) throw err;
                cases = JSON.parse(data);

            };
*/            
        });
    });
    
// c3poDev for localhost:3000 operation

        // set up Facebook sdk

    window.fbAsyncInit = function() {
        console.log("About to call FB.init");
        FB.init({
            appId      : curAppId, // set appId based on localhost vs meteor.com host
            status     : true,
            version    : 'v2.4',
            xfbml      : true
        });
        console.log("Finished call to FB.init");
    };

//            appId      : '109055546115993', // localhost
//            appId      : '1459289887712466', // c3poTest
    

    Template.fbbtn.onRendered(function() {
        try {
            FB.XFBML.parse();
        }catch(e) {}   
    });
   
};

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
        // 1. Create a Mongo collection of properties (CASE_NUMBE's) by address from the GeoJSON file.
        // 2. Build a Mongo collection of documents for each property
        //     These are stored in https://www-static-bouldercolorado.gov/docs/PDS/Plans/<CASE_NUMBE>/ folder
        // 3. Build a Mongo collection of features for each CASE_NUMBE
//        devCases = HTTP.get(Meteor.absoluteUrl("/DevelopmentReview.GeoJSON")).data;
        devCases = JSON.parse(Assets.getText("DevelopmentReview.GeoJSON"));        // load the GeoJSON
 //       window.alert("parsed the DevelopmentReview.GeoJSON file");
        for (devCase in devCases) {
            Cases.insert(devCase);
        };
        Meteor.publish("all-cases", function () {
            return Cases.find(); // everything
        });
    });
};

