//var CasePlats = new Mongo.Collection("plats");
var devCases = {};
var MAP_ZOOM = 15;
var curAppId;

if (Meteor.isClient) {
    // Collection for all the cases defined in the DevelopmentReview.GeoJSON file
    var Cases = new Mongo.Collection("cases");
    var TitleLinkRes = [{}];
    var lastE = {};
    var selCases = [];

    // counter starts at 0
    Session.setDefault('counter', 0);
    // todo: consider adding a listener to detectd when more Cases added
    
    Meteor.startup(function () {
        "use strict";
        console.log("Entered Meteor.startup");
        
        GoogleMaps.load({libraries: 'geometry'});
        console.log("Loaded GoogleMap");
        

        
// c3poDev for localhost:3000 operation

//         set up Facebook sdk

        $("#feed").click(function () {
            serverFeed()
            console.log("in #feed.click()");
        });
        Accounts.ui.config({
            requestPermissions: {
                facebook: ['publish_actions']
            }
        });
        
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
        "use strict";

            //  Build document links array and invoke the docsModal.
            // 
            //  GET https://www-webapps.bouldercolorado.gov/pds/publicnotice/docspics.php?caseNumber=LUR2013-00070
            // This returns an array of titles
            // Convert the string so no spaces, etc.
            // Then display the links by appending the titles to:
            //   "https://www-static.bouldercolorado.gov/docs/PDS/plans/"+caseNum+"/"
            //
        var TitleLinkCol = [],
            xmlhttp,
            docURL = "https://www-webapps.bouldercolorado.gov/pds/publicnotice/docspics.php?caseNumber=";

        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for older browsers
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                var docTitles = xmlhttp.responseText,
                // response text is a JSON string that needs to be parsed...
                    docTitlesObj = EJSON.parse(docTitles),
                    titleUrlBase = "https://www-static.bouldercolorado.gov/docs/PDS/plans/" + curCaseNum + "/";
                if (Array.isArray(docTitlesObj)) {
                    // todo: handle case where 1 document is available and no thumbs.db exists.
                    //      Because of cross-domain restrictions, we cannoc check for existence of the file, 
                    //      so the best we may be able to do is filter by extension (e.g. 'pdf').
                    for (var title in docTitlesObj) {
                        var link = {};
                        link.title = docTitlesObj[title];
                        link.url = titleUrlBase + encodeURI(docTitlesObj[title]);
                        if (link.title !== "Thumbs.db" && link.title.endsWith('.pdf')) {
                            TitleLinkCol.push(link);
                        }
                    }
                    //  Only one modal can display at a time. Must ensure one hides before showing the other.
                    $('#caseModal').on('hidden.bs.modal', function () { // set the listener before hiding
                        Modal.show('docsModalTemplate',
                            {
                                caseNum: curCaseNum,
                                docLinks: TitleLinkCol
                            });
                        $('#docsModal').on('hidden.bs.modal', function () {
                            //  when user dismisses docsModal, show the case details again
                            showDetails();
                        });
                    });
                    $('#caseModal').modal('hide');
                    console.log('showing case ' + curCaseNum + ' document ' + TitleLinkCol[0].title);
                } else {
                    // in this case, we received a single error message, not an array of doc links
                    //  NOTE: this may depend on an Thumbs.db being included in the list of documents
                    if (docTitlesObj.endsWith('.pdf')) {
                        TitleLinkCol.push(docTitlesObj);
                    } else {
                        alert(docTitlesObj);
                    }
                }
            } else {
                if ((xmlhttp.readyState >= 0 && xmlhttp.readyState < 4) || xmlhttp.status === 404) {
                    console.log("processing doc list request");
                } else if (xmlhttp.status !== 200) {
                    console.log("failed to retrieve documents for caseNumber " + curCaseNum +
                                "\nwith readyState = " + xmlhttp.readyState +
                                "\nand response: " + EJSON.parse(xmlhttp.responseText));
                }
                return (null);
            }
        };
        xmlhttp.open("GET", docURL + curCaseNum, true);
        xmlhttp.send();
    }
    
    function showDetails(e) {
        
        function launchModal() {

            Modal.show('caseModal')

            $('#btn-prev').click(function(e) {
                var curCaseInd = Session.get('caseInd');
                if (curCaseInd -1 >= 0) {
                    if (curCaseInd === selCases.length - 1) {
                        $('#btn-next').removeClass('disabled');
                    }
                    curCaseInd--;
                    if (curCaseInd === 0) { // disable only when first item reached
                        $(this).addClass('disabled');
                    } else if ($(this).hasClass('disabled')) {
                        $(this).removeClass('disabled');
                    }
                    Session.set({
                        caseInd: curCaseInd,
                        caseNum: selCases[curCaseInd].caseId,
                        featureProperties: Cases.findOne({id: selCases[curCaseInd].caseId}).properties,
                        canSubscribeToProject: selCases[curCaseInd].canSubscribe
                    })
                }
            });

            $('#btn-next').click(function(e) {
                var curCaseInd = Session.get('caseInd');
                if (curCaseInd +1 < selCases.length) {
                    curCaseInd++;
                    if (curCaseInd >= selCases.length - 1) {   // disable only when last item reached
                        $(this).addClass('disabled');
                    } else if ($(this).hasClass('disabled')) {
                        $(this).removeClass('disabled');
                    }
                    if (selCases.length > 1 && curCaseInd === 1) {
                        $('#btn-prev').removeClass('disabled');
                    }
                    Session.set({
                        caseInd: curCaseInd,
                        caseNum: selCases[curCaseInd].caseId,
                        featureProperties: Cases.findOne({id: selCases[curCaseInd].caseId}).properties,
                        canSubscribeToProject: selCases[curCaseInd].canSubscribe
                    })
                }            
            });

            $('.btn-subscribe-project').click(function(e){
                var subscribeButton = $(e.target);
                var caseNum = Session.get('caseNum');
                var permit = Cases.findOne({id: caseNum});
                var currentUser = Meteor.user();
                var userSubscriptions = currentUser.profile.subscriptions;
                userSubscriptions.push(caseNum);
                Meteor.users.update(Meteor.userId(), {$set: {'profile.subscriptions': userSubscriptions}});
                subcribeButton.hide();
            });

            $('.btn-show-docs').click(function(e) {
                var showDocsButton = $(e.target);
                var caseNum = Session.get('caseNum');
                showDocs(caseNum);
            });

            $('.btn-fb-discussion').click(function() {
                openDisc('geronimo!!');
            });
        }
        "use strict";
        var curCaseInd;
        if ((e === null) || (e === undefined)) {
            // now, don't bother searching the polygons, just pop the modal with the session data
            launchModal();
        } else {
            selCases = [];
            // Cycle through the polygons on the map to see which ones contain the clicked latLng.
            GoogleMaps.maps.map.instance.data.forEach(function(item) {
                "use strict";
                var numPolys = 1;
                var curGeom = item.getGeometry();
                var candidate = {};
                var select = false;

                // For whatever reason, the polygons read in from GeoJSON are not compatible with the
                // containsLocation() function. A maps polygon is not the same as a maps.data polygon.
                // We have to create a simple polygon from the array of latLng's in the current 
                // item, which is a map feature that may or may not be a polygon.
                // The paths param property must be an array of latLng objects or literals

                if (curGeom.getType().indexOf("MultiPolygon") > -1) {
                    numPolys = curGeom.getLength();
                    for (var p = 0; p < numPolys; p++) { // todo: getArray() or getPaths() will work better?
                        for (var pp = 0; pp < curGeom.getAt(p).getLength(); pp++) {
                            candidate = new google.maps.Polygon({paths: curGeom.getAt(p).getArray()[pp].getArray()});
                            select = google.maps.geometry.poly.containsLocation(e.latLng, candidate) || select
                        }
                    }
                } else {
                    for (var p = 0; p < curGeom.getArray().length; p++) {
                        var candidate = new google.maps.Polygon({paths: curGeom.getArray()[p].getArray()});
                        select = google.maps.geometry.poly.containsLocation(e.latLng, candidate) ||
                            select;
                    }
                }
                if (select) {
                    selCases.push({caseId: item.getId(),
                                   canSubscribe: item.getProperty('canSubscribe')});
                }
                var currentUser = Meteor.user();
                if(currentUser == null) {
                    item.setProperty('canSubscribe', false);
                } else {
                    if(currentUser !== null && currentUser.profile.subscriptions === undefined) {
                        Meteor.users.update(Meteor.userId(), {$set: {'profile.subscriptions': new Array()}});
                    }
                    if(currentUser !== null) {
                        item.setProperty('canSubscribe', jQuery.inArray(item.getId(), currentUser.profile.subscriptions) < 0);
                    }
                };
            }); // end map.instance.data.forEach() iteration
            console.log("selected " + selCases ? selCases.length : 0 + " cases at " + e.latLng.lat + " " + e.latLng.lng);
            // Show a modal for all selCases, showing the first one found
            if (selCases && selCases.length > 0) {
                curCaseInd = 0;
                Session.set({                               
                    caseInd: curCaseInd,
                    caseNum: selCases[curCaseInd].caseId,
                    featureProperties: Cases.findOne({id: selCases[curCaseInd].caseId}).properties,
                    canSubscribeToProject: selCases[curCaseInd].canSubscribe
                })
                launchModal();
            };
        }
    };

    Template.registerHelper('arrayify',function(obj){
        result = [];
        for (var key in obj) result.push({name:key,value:obj[key]});
        return result;
    });

    Template.caseModal.helpers({
        humanReadableName: function(name) {
            "use strict";
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
        },
        caseNum: function() {
            return Session.get('caseNum');
        },
        featureProperties: function () {
            return Session.get('featureProperties');
        },
        canSubscribeToProject: function () {
            return Session.get('canSubscribeToProject');
        }
    });

    Template.map.helpers({
        geolocationError: function() {
            "use strict";
            console.log("in geolocationError()");
            var error = Geolocation.error();
            return error && error.message;
        },
        mapOptions: function() {
            "use strict";
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
        
        function addToMap(jsonCase, map) {
            var curFeature = map.instance.data.addGeoJson(jsonCase);
            curFeature[0].setProperty('canSubscribe', true);  
        }

        GoogleMaps.ready('map', function(map) {
            
            var latLng = Geolocation.latLng() || {center: { lat: 40.0275, lng: -105.251945}, zoom: MAP_ZOOM};
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(latLng.lat, latLng.lng),
                map: map.instance
            });
            map.instance.data.setStyle({  // can use dynamic fillColor per case type using anonymous function
                strokeColor: '#999999',
                strokeOpacity: 0.2,
                strokeWeight: 2,
                fillColor: '#333333',
                fillOpacity: 0.2,
                clickable: true
              });

            Meteor.subscribe("all-cases", {
                onReady: function() {
                    Cases.find({}).forEach(function(reviewCase){
                        addToMap(reviewCase, map);
                        })
                }
            });
            map.instance.data.addListener('click', function(event) {
                showDetails(event);
            });
        });
    });

}; // end: Meteor.isClient()

if (Meteor.isServer) {

    // Collection for all the cases defined in the DevelopmentReview.GeoJSON file
    var Cases = new Mongo.Collection("cases");

    Meteor.publish("all-cases", function () {
        return Cases.find({}); // everything
    });

    function serverFeed() {
        "use strict";
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
        "use strict";
        // code to run on server at startup
        // 1. Create a Mongo collection of properties (CASE_NUMBE's) by address from the GeoJSON file.
        // 2. Build a Mongo collection of documents for each property
        //     These are stored in https://www-static.bouldercolorado.gov/docs/PDS/Plans/<CASE_NUMBE>/ folder
        // 3. Build a Mongo collection of features for each CASE_NUMBE

        
        function getAssetPath() {
            var meteor_root = Npm.require('fs').realpathSync(process.cwd() + '/../');
            
            console.log(meteor_root);
            
//            var assets_folder = __meteor_bootstrap__.serverDir + '/assets/app';
            
            // /meteor/containers/b98c25e5-4e38-5531-cc67-85a5a29c68dc/bundle/programs/server/boot.js:229:5

            var application_root = Npm.require('fs').realpathSync(meteor_root + '/../');
            // if running on dev mode
            if (Npm.require('path').basename(Npm.require('fs').realpathSync(meteor_root + '/../../../')) == '.meteor') {
                application_root = Npm.require('fs').realpathSync(meteor_root + '/../../../../');
                var assets_folder = meteor_root + '/server/assets/' + Npm.require('path').basename( application_root );
            }

            var assets_folder = meteor_root + '/server/assets/app';
            //var assets_folder = meteor_root + '/server/assets/' + Npm.require('path').basename( application_root );
            console.log(assets_folder);
            return assets_folder;
        }   
        
        var Fiber = Npm.require( "fibers" );
        
        // read and process line-by-line
        
        var assetPath = getAssetPath();
        
        Assets.getBinary('DevelopmentReview.GeoJSON');
        
//            input: Npm.require('fs').createReadStream('/assets/app/DevelopmentReview.GeoJSON'),
        var lineReader = Npm.require('readline').createInterface({
            input: Npm.require('fs').createReadStream(assetPath + '/DevelopmentReview.GeoJSON'),
            terminal: false
        });
        
        console.error("declared lineReader");
        
        lineReader.on('line', function(line) {
//            console.log("about to open a Fiber");
            Fiber( function() {
                var caseNum = "";
                var devCase = {};
//                console.error("about to try a line parse");
                try {
                    if (line[line.length-1] == ',') { // chop off any trailing comma after the object
                        line = line.substr(0,line.length -1);
                    };
                    devCase = (EJSON.parse(line));
                    caseNum = devCase.properties['CASE_NUMBE'];
                    if(Cases.findOne({'_id': caseNum}) == null) {
                        devCase['_id'] = caseNum;
                        devCase['id'] = caseNum;
//                        console.log(devCase['id']);
                        Cases.insert(devCase);
                    };
                }
                catch(err) {
                    if ((err.message.indexOf("SyntaxError")) < 0) {
                        console.error(caseNum + " Error on parsing JSON for " + line.slice(52,65) + ": " + err.message);
                    };
                };
                Fiber.yield();
            }).run();
        });
        
//        console.log("after lineReader.on callback");
        
        lineReader.on('close', function(line) {
            try {
                console.log("read last line\n" + line);
            }
            catch(err) {
                console.error("error reading last line or opened with end of file\n" + err);
                };
            // process last line
            console.error(' Read last line: ...');            
        });
//        console.log("after lineReader on close");
    });
};
