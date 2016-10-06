// Requires packages:
//    twbs:bootstrap 
//    peppelg:bootstrap-3-modal (to display bootstrap modals)
//    dburles:googleMaps
//    mdg:geolocation

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { GoogleMaps } from 'meteor/dburles:google-maps';
import { Geolocation } from 'meteor/mdg:geolocation';

import { Cases } from '../api/cases.js';

import { showDetails } from './showDetails.js';

import './gMap.html';

"use strict";

if (Meteor.isClient) {

    Meteor.startup(function () {
        GoogleMaps.load({
            key: 'AIzaSyD0VdfUjxttcYa33_u8ujwDLLQ2Nz5660M',
            libraries: 'geometry'
        });
        var curHref = location.href;
    });

    Template.mapTmplt.helpers({
        geolocationError: function() {
            var error = Geolocation.error();
            return error && error.message;
        },
        mapOptions: function() {
            var MAP_ZOOM = 15;
            var latLng = {};
            var latLng = Geolocation.latLng();
            // Initialize the map once we have the latLng.
            if (latLng) {
                console.log("latLng = " + latLng.lat + ", " + latLng.lng);
                console.log("latLng = " + latLng.lat + ", " + latLng.lng);
            } else {
                console.log("could not obtain latLng");
                latLng = {
                    lat: 40.0275,
                    lng: -105.251945
                };
            }
            if (GoogleMaps.loaded() && latLng) {
                console.log("map loaded");
                return {
                    center: new google.maps.LatLng(latLng.lat, latLng.lng),
                    zoom: MAP_ZOOM
                };
            } else {
                console.log("either maps not loaded or latLng missing");
                return {
                    center: new google.maps.LatLng(40.0275, -105.251945),
                    zoom:   MAP_ZOOM                
                }
            }
        },
    })

    Template.mapTmplt.onCreated(function() {
        GoogleMaps.ready('map', function(map) {
            console.log("GoogleMaps.ready!");
            var latLng = Geolocation.latLng() || {center: { lat: 40.0275, lng: -105.251945}, zoom: map.options.zoom};
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
            Meteor.subscribe("cases", {
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

        function addToMap(jsonCase, map) {
            console.log("entered addToMap");
            var curFeature = map.instance.data.addGeoJson(jsonCase);
            curFeature[0].setProperty('canSubscribe', true);  
        }
    });
}