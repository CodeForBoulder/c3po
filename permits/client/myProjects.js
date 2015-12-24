Template.loginButtons.events({                                                                                         // 6
	'click #login-name-link, click #login-sign-in-link': function () {
  		$('#login-buttons-logout').before("<a id='login-buttons-my-projects'>My Projects</a>");
		$('#login-buttons-my-projects').click(function(){
			Accounts._loginButtonsSession.closeDropdown();
			var currentUser = Meteor.user();
			projects = currentUser.profile.subscriptions;
			Modal.show('myProjectsModal', {projects: projects});
		});                                                                                    // 10
  	}	                                                                                                                   // 14
});