import { Session } from 'meteor/session';
import { GoogleMaps } from 'meteor/dburles:google-maps';

import 'meteor/peppelg:bootstrap-3-modal';

import { Cases } from '../api/cases.js';
import { showDocs } from './showDocs.js';

import './caseModal.html';

Template.caseModal.helpers({
    arrayify: function(obj) {
    result = [];
    for (var key in obj) result.push({name:key,value:obj[key]});
    return result;
    },
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
        },
        caseNum: function() {
            return Session.get('caseNum');
        },
        featureProperties: function () {
            return Session.get('featureProperties');
        },
        cannotSubscribeToProject: function () {
            return !Session.get('canSubscribeToProject');
        },
        noNext: function () {
            return !(Session.get('numCases') > Session.get('caseInd')+1);
        },
        noPrev: function () {
            return (Session.get('caseInd') < 1);
        }
    
});

export function showDetails(e) {
        // requires:
        //      selCases
        //      Cases
        //      Meteor session package (meteor add session)
    var selCases = [];
        
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
                var subs = Cases.findOne({'_id': selCases[curCaseInd].caseId}).properties.subscriptions;
                var canSub = !subs.includes(Meteor.userId()) && 
                                             !!Meteor.userId()
                Session.set({
                    caseInd: curCaseInd,
                    caseNum: selCases[curCaseInd].caseId.trim(),
                    featureProperties: Cases.findOne({id: selCases[curCaseInd].caseId}).properties,
                    canSubscribeToProject: canSub
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
                var subs = Cases.findOne({'_id': selCases[curCaseInd].caseId}).properties.subscriptions;
                var canSub = !subs.includes(Meteor.userId()) && 
                                             !!Meteor.userId()
                Session.set({
                    caseInd: curCaseInd,
                    caseNum: selCases[curCaseInd].caseId.trim(),
                    featureProperties: Cases.findOne({id: selCases[curCaseInd].caseId}).properties,
                    canSubscribeToProject: canSub
                })
            }            
        });

        $('#btn-subscribe-project').click(function(e){
            var subscribeButton = $(e.target);
            var caseNum = Session.get('caseNum');
            var permit = Cases.findOne({id: caseNum});
            var currentUser = Meteor.user();
            // todo: switch from profile to another data store, perhaps
            // todo: ... each permit has a list of usernames
            if (typeof currentUser === 'undefined') {
                alert('Cannot subscribe (user is not logged in)');
            } else {
//                var userSubscriptions = permit.properties.subscriptions;
//                userSubscriptions.push(Meteor.userId());
                Cases.update({_id: permit._id}, {$push: {'properties.subscriptions': Meteor.userId()}});
                var curCaseInd = Session.get('caseInd');
                Session.set({
                    canSubscribeToProject: false
                })

            }
            subscribeButton.disable();
        });

        $('.btn-show-docs').click(function(e) {
            var showDocsButton = $(e.target);
            var caseNum = Session.get('caseNum');
            showDocs(caseNum);
        });

        $('.btn-fb-discussion').click(function() {
            openDisc('geronimo!!');
        });
    }   // end: launchModal()
        
    // start of showDetails() body

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
            // todo: set canSubscribe based on whether userId is already in item's subscriptions list
            // todo: set canSubscribe based on Cases collection, not googleMaps item
            if (select) {
                var subs = Cases.findOne({'_id': item.getId()}).properties.subscriptions;
                var canSub = !subs.includes(Meteor.userId()) && 
                                             !!Meteor.userId()
                selCases.push({caseId: item.getId(),
                               canSubscribe: canSub});
                item.setProperty('canSubscribeToProject', canSub)

            }
            var currentUser = Meteor.user();
            if(currentUser == null) {
                item.setProperty('canSubscribeToProject', false);
            } else {
                // todo: make a new entry for the permit if none exist
                if (currentUser !== null && 
                    typeof item.getProperty('subscriptions') === "undefined") {
                    item.setProperty('subscriptions', new Array());
                    Cases.update({_id: item.getId()}, {$set: {'properties.subscriptions': new Array()}});
                }
            };
        }); // end map.instance.data.forEach() iteration
        console.log("selected " + selCases ? selCases.length : 0 + " cases at " + e.latLng.lat + " " + e.latLng.lng);
        // Show a modal for all selCases, showing the first one found
        if (selCases && selCases.length > 0) {
            curCaseInd = 0;
            if (selCases.length == 1) {
                $('#btn-next').addClass('disabled');
            }
            var curProps = Cases.findOne({id: selCases[curCaseInd].caseId}).properties
//            selCases[curCaseInd].canSubscribe = !(curProps.subscriptions.length > 0)
            Session.set({
                numCases: selCases.length,
                caseInd: curCaseInd,
                caseNum: selCases[curCaseInd].caseId.trim(),
                featureProperties: curProps,
                canSubscribeToProject: !curProps.subscriptions.includes(Meteor.userId()) &&
                                            !!Meteor.userId()
            })
            launchModal();
        };
    }
};