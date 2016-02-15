// Collection for all the cases defined in the DevelopmentReview.GeoJSON file
Cases = new Mongo.Collection("cases");
var devCases = {};
var MAP_ZOOM = 15;
var curAppId ;

if (Meteor.isClient) {
    var TitleLinkRes = [{}];
    var lastE = {};

    // counter starts at 0
    Session.setDefault('counter', 0);
    
//    Meteor.subscribe("all-cases");
    
    Meteor.startup(function() {
        console.log("Entered Meteor.startup");
        
        GoogleMaps.load();
        console.log("Loaded GoogleMap");
        

        
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
    
        $("#selDocs").slideUp("fast");
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
//        $("#fbFeed").html("new value");
//
//        //         console.log("fbFeed = " + feedHtml.toString());
//    };
//
    function openDisc(test){
        console.log(test);
    };

    function showDocs(curCaseNum) {
            //  Build document links array and invoke the docsModal.
            // 
            //  GET https://www-webapps.bouldercolorado.gov/pds/publicnotice/docspics.php?caseNumber=LUR2013-00070
            // This returns an array of titles
            // Convert the string so no spaces, etc.
            // Then display the links by appending the titles to:
            //   "https://www-static.bouldercolorado.gov/docs/PDS/plans/"+caseNum+"/"
            //
            var TitleLinkCol = [];

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
                    var docTitles = xmlhttp.responseText;
                    // response text is a JSON string that needs to be parsed...
                    var docTitlesObj = JSON.parse(docTitles);
                    var titleUrlBase = "https://www-static.bouldercolorado.gov/docs/PDS/plans/"+curCaseNum+"/";
                    if (docTitlesObj.length > 1 && docTitlesObj[0].length > 1) {
                        for (title in docTitlesObj) {
                            var link = {};
                            link.title = docTitlesObj[title];
                            link.url = titleUrlBase + encodeURI(docTitlesObj[title]);
                            if (link.title != "Thumbs.db") {
                                TitleLinkCol.push(link);                            
                            }
                        }
                        //  Only one modal can display at a time. Must ensure one hides before showing the other.
                        $('#caseModal').on('hidden.bs.modal', function () { // set the listener before hiding
                            Modal.show('docsModalTemplate',
                                {                               
                                    caseNum: caseNum,
                                    docLinks: TitleLinkCol
                                });
                            $('#docsModal').on('hidden.bs.modal', function () { //  when user dismisses docsModal, show the case details again
                                    showDetails();
                            })
                        });
                        $('#caseModal').modal('hide');

                        console.log('showing case ' + curCaseNum + ' document ' + TitleLinkCol[0].title);
                        
                    } else {    // in this case, we received a single error message, not an array of doc links
                                //  NOTE: this may depend on an Thumbs.db being included in the list of documents
                        alert(docTitlesObj);
                    }
                } else {
                    if ((xmlhttp.readyState >= 0 && xmlhttp.readyState < 4) || xmlhttp.status == 404) {
                        console.log("processing doc list request");
                    }
                    else if (xmlhttp.status != 200) {
                        console.log("failed to retrieve documents for caseNumber " + curCaseNum +
                                   "\nwith readyState = " + xmlhttp.readyState +
                                   "\nand response: " + JSON.parse(xmlhttp.responseText));
                    }
                    return (null);
                }
            }
            xmlhttp.open("GET", docURL + caseNum, true);
            xmlhttp.send();
        };
    
    function showDetails(e) {
        if ((e == null) || (e == undefined)) {
            e = lastE;  // restore the event - called programmatically to restore to last button pressed state
        };
        lastE = e;
        caseNum =  e.feature.getProperty('CASE_NUMBE');
        addr = e.feature.getProperty('CASE_ADDRE');
        featureProperties = new Array();
        e.feature.forEachProperty(function (val, name) {
            featureProperties.push({val: val, name: name});
        });
        var permit = Cases.findOne({"properties.CASE_NUMBE": caseNum});
        var canSubscribe = true;
        var currentUser = Meteor.user();
        if(currentUser == null) {
            canSubscribe = false;
        } else {
            if(currentUser !== null && currentUser.profile.subscriptions === undefined) {
                Meteor.users.update(Meteor.userId(), {$set: {'profile.subscriptions': new Array()}});
            }
            if(currentUser !== null) {
                canSubscribe = jQuery.inArray(caseNum, currentUser.profile.subscriptions) < 0;
            }
        }
        Modal.show('caseModal', 
            {                               
                caseNum: caseNum,
                featureProperties: featureProperties,
                canSubscribeToProject: canSubscribe
            }
        );
    
        $('.btn-subscribe-project').click(function(e){
            var subscribeButton = $(e.target);
            var caseNum = subscribeButton.data('casenumber');
            var permit = Cases.findOne({"properties.CASE_NUMBE": caseNum});
            var currentUser = Meteor.user();
            var userSubscriptions = currentUser.profile.subscriptions;
            userSubscriptions.push(caseNum);
            Meteor.users.update(Meteor.userId(), {$set: {'profile.subscriptions': userSubscriptions}});
            subscribeButton.hide();
        });

        // redo to allow for multiple cases
        // find all the cases matching the address of the selected case
        // probably best as a backend search and a Mongo query
        //$("#modalHead").html("<h3>" + caseNum + "</h3>");
        // for each property, add an HTML paragraph
    
//        $("#modalBody").slideDown("slow",function() {
//            $("#nav").show();
//            $(this).dblclick(function() {
//                $(this).slideUp("slow");
//                $("#nav").hide();
//            });
//            $("#close").click(function() {
//                $("#selDetails").slideUp("slow");
//                $("#nav").hide();
//            });
//        }); 

        $('.btn-show-docs').click(function() {
            showDocs(caseNum);
        });

        $('.btn-fb-discussion').click(function() {
            openDisc('geronimo!!');
        });
    };

    Template.caseModal.helpers({
        humanReadableName: function(name) {
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
            /*var reviewCases = {
"type": "FeatureCollection",
"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
            };*/
            //reviewCases.features = Cases.find().fetch();
//            Cases.find().map(function(reviewCase){    // reviewCase has no polygon (GIS) information at all...
//                map.instance.data.addGeoJson(reviewCase);
//            });
            //map.instance.data.addGeoJson(reviewCases); // place json file in /public folder
            map.instance.data.loadGeoJson('/DevelopmentReview.GeoJSON'); // place json file in /public folder
            map.instance.data.addListener('click', function(event) {
                showDetails(event);
            });
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
        //     These are stored in https://www-static.bouldercolorado.gov/docs/PDS/Plans/<CASE_NUMBE>/ folder
        // 3. Build a Mongo collection of features for each CASE_NUMBE
//        devCases = HTTP.get(Meteor.absoluteUrl("/DevelopmentReview.GeoJSON")).data;
        devCases = JSON.parse(Assets.getText("DevelopmentReview.GeoJSON"));        // load the GeoJSON
        for (devCaseIndex in devCases.features) {
           var properties = devCases.features[devCaseIndex].properties;
           if(Cases.find({'properties.CASE_NUMBE': properties['CASE_NUMBE']}, {limit:1}).count() < 1)
              devCases.features[devCaseIndex]._id = properties['CASE_NUMBE'];
              Cases.insert(devCases.features[devCaseIndex]);
        }
        Meteor.publish("all-cases", function () {
            return Cases.find(); // everything
        });
    });
};
