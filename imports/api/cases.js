import { Meteor} from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { EJSON } from 'meteor/ejson';
import { JSONStream } from 'JSONStream';
//import { extPoly } from '../ui/gMap.js';
export const Cases = new Mongo.Collection('cases');

if (Meteor.isServer) {
    // This code only runs on the server
    // Only publish tasks that are public or belong to the current user
//    console.error("Entered isServer function");
    Meteor.publish('cases', function casesPublication(extPoly) {
//        return Cases.find({}); // find everything
        // todo: See if we can return only the visible polygons
        if (typeof extPoly !== 'undefined' && extPoly !== null) {
            console.error("Finding polygons within " + extPoly.toString());
            var result = Cases.find({
                        geometry: {
                            $geoWithin: {
                                $geometry: {
                                    type: "Polygon",
                                    coordinates: extPoly
                                }
                            }
                        }
                    });
            console.error("Found polygons:\n" + result.map(function(u) {return u._id + "\n\t"}) + "\n");
        } else {
            console.error("extPoly is null, return nothing");
            return this.ready();
//            result = Cases.find({});
//            console.error("Looked up all polygons - extPoly is null");
        }
        return result;
    });

    Meteor.startup(function () {
        "use strict";
        // code to run on server at startup
        // 1. Create a Mongo collection of properties (CASE_NUMBE's) by address from the GeoJSON file.
        // 2. Build a Mongo collection of documents for each property
        //     These are stored in https://www-static.bouldercolorado.gov/docs/PDS/Plans/<CASE_NUMBE>/ folder
        // 3. Build a Mongo collection of features for each CASE_NUMBE


        function getAssetPath() {
            var meteor_root = require('fs').realpathSync(process.cwd() + '/../');

//            console.error(meteor_root);

//            var assets_folder = __meteor_bootstrap__.serverDir + '/assets/app';

            // /meteor/containers/b98c25e5-4e38-5531-cc67-85a5a29c68dc/bundle/programs/server/boot.js:229:5

            var application_root = require('fs').realpathSync(meteor_root + '/../');
            // if running on dev mode
            if (require('path').basename(require('fs').realpathSync(meteor_root + '/../../../')) == '.meteor') {
                application_root = require('fs').realpathSync(meteor_root + '/../../../../');
                var assets_folder = meteor_root + '/server/assets/' + require('path').basename( application_root );
            }

            var assets_folder = meteor_root + '/server/assets/app';
            //var assets_folder = meteor_root + '/server/assets/' + require('path').basename( application_root );
//            console.error(assets_folder);
            return assets_folder;
        }

        // read and process

        var assetPath = getAssetPath();

        var fs = require('fs');
        var jsonFilePath = './assets/app/DevelopmentReview.GeoJSON.json';
        var geoJsonFile = fs.readFileSync(jsonFilePath, 'utf-8');
        var geoJson = JSON.parse(geoJsonFile)

        // require will read in and parse only if extension is ".json"

        //geoJson = Assets.getText('DevelopmentReview.GeoJSON.json');

        // geoJson = Assets.getText('public/DevelopmentReview.GeoJSON.json');
        // geoJson = require(assetPath + '/DevelopmentReview.GeoJSON.json');

            var caseNum = "";
            console.log("oooooo", geoJson);
            console.error(geoJson.features.length);
            for (var caseInd in geoJson.features) {
                var devCase = geoJson.features[caseInd];
                caseNum = devCase.properties['CASE_NUMBE'];
                    if(Cases.findOne({'_id': caseNum}) == null) {
                        devCase['_id'] = caseNum;
                        devCase['id'] = caseNum;
                        Cases.insert(devCase);
                    };
            }
        Cases._ensureIndex({'loc.coordinates':'2dsphere'});
    });
}
