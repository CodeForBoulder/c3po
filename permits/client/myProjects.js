Template.loginButtons.events({
	'click #login-name-link, click #login-sign-in-link': function () {
  		$('#login-buttons-logout').before("<a id='login-buttons-my-projects'>My Projects</a>");
		$('#login-buttons-my-projects').click(function(){
			Accounts._loginButtonsSession.closeDropdown();
			Modal.show('myProjectsModal');
		});
  	}
});

Template.myProjectsModal.helpers({
   projects: function() {
       var Cases = new Mongo.Collection("cases");
       var currentUser = Meteor.user();
       var subCases = [];
       Meteor.subscribe("all-cases", {
            onReady: function() {
                Cases.find({'_id': {$in: currentUser.profile.subscriptions}}).forEach(function(thisCase){
                    subCases.push(thisCase);
                })
            }
       });
       return subCases;

//       return Cases.find({'_id': {$in: currentUser.profile.subscriptions}});
   }
});