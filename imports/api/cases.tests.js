/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { Cases } from './cases.js';

if (Meteor.isServer){
    describe('Tasks', () => {
        describe('methods', () => {
            // ensure the database is in the expected state
            const userId = Random.id();
            let taskId;
            
            beforeEach(() => {  // mocha command
                Tasks.remove({});   // clear the database
                taskId = Tasks.insert({
                    text:   'test task',
                    createdAt:  new Date(),
                    owner:      userId,
                    username:   'tmeasday'
                });
            });
            
            it('can delete owned task', () => {
                // find the internal implementation of the task method so we can
                // test it in isolation
                const deleteTask = Meteor.server.method_handlers['tasks.remove'];
                
                // set up a fake account method invocation that looks like what the method expects
                const invocation = { userId };
                
                // Run  the method with 'this' sent to the fake invocation
                deleteTask.apply(invocation, [taskId]);
                
                // verify that the method does what we expected
                assert.equal(Tasks.find().count(), 0);
            });
        });
    });
}