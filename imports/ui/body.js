// Requires packages:
//    mongo
//    reactive-dict
//    reactive-var

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Cases } from '../api/cases.js';

import './body.html';
import './gMap.js';

Template.body.onCreated(function onBodyCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('cases');
});