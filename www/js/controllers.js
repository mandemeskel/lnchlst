function Topic( name, description, icon ) {
  this.name = name;

  if( description == undefined )
      description = "no description";
  this.description = description;

  if( icon == undefined )
      icon = "../img/ionic.png";
  this.icon = icon;

  //holds ids of launchlists
  this.launchlists = [];

  //holds actual launchlist objects
  this.launchlist_objects = [];

}




angular.module('main.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicLoading, databaseService) {

  var music = new Topic( "music" ),
      design = new Topic( "design" ),
      random = new Topic( "random" );

  // console.log( music, design, random );

  // the current tab i.e. page
  $scope.tab = "";

  // dct of topics being displayed on the home page
  $scope.topics = {
      // music, design, random
  };

  // the current topic being dispalyed to the user
  $scope.topic = {};

  // loads a topic into $scope.topic
  $scope.loadTopic = function( topic_name ) {
    if( DEVELOPING )
      console.log( "loadTopic", topic_name );

    $scope.topic = databaseService.getTopicByName( $scope,topic_name );

  };

  // load the actual list of steps in the launchlist
  $scope.loadLaunchlistList = function( launchlist ) {
    if( DEVELOPING )
      console.log( "loadLaunchlistList", launchlist );

    $scope.launchlist = launchlist;
    $scope.launchlist.list_objects = [] 
    for( let n in $scope.launchlist.list ) {
      let item = $scope.launchlist.list[ n ];
      // console.log( item );

      // headings don't need to be retrieved from db
      // they come with the launchlist.list
      if( item.type == "heading" ) {

        $scope.launchlist.list_objects.push( 
          { type: item.type, item: item, order: item.index } 
        );
        continue;

      }

      let ref_url, 
      // the function that will be excuted when the databse
      // returns a succesfull result
          apromise = function( snapshot ) {
            var obj = { 
              type: item.type, 
              item: snapshot.val(), 
              order: item.index 
            };

            if( DEVELOPING ) console.log( obj );
            
            $scope.launchlist.list_objects.push( obj );
          };

      // make the urls to fetch entities from database
      if( item.type == "launchlist" ) {

        ref_url = "/launchlists/" + item.value;

      } else if( item.type == "resource" ) {

        ref_url = "/resources/" + item.value;

      } else {

        continue;

      }

      // request the data from the database and processe it with apromise
      databaseService.get( ref_url, apromise );

      // order++;
    }

    // databaseService.loadList( launchlist, loadList );

  };

  $scope.getLaunchlistsById = function( launchlists ) {
    if( DEVELOPING )
      console.log( "getLaunchlistsById", launchlists );

    return databaseService.getLaunchlistsById( launchlists )

  };


  // init listners to firebase database
  // databaseService.init( $scope )
  var topicsListner = function( snapshot ) {
    if( DEVELOPING )
      console.log( snapshot.val() );

    // TODO: use Topic object
    $scope.topics = snapshot.val();

    for( let key in $scope.topics ) {
      let topic = $scope.topics[ key ];
      
      if( topic.launchlists == [] ) continue;
      topic.launchlists_objects = [];

      for( let launchlist_id in topic.launchlists )
        databaseService.getLaunchlistById( 
          launchlist_id, function( snapshot ) {
            topic.launchlists_objects.push( snapshot.val() );
          }
        )
  
    }

  }

  // set a listner for any value updates for "topic"
  databaseService.setTopicsListner( topicsListner, "value" );


  $scope.changeTab = function( tab_name ) {
    $scope.tab = tab_name;
  }

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();

    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    
    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);
    
  };

  // logout
  $scope.logout = function() {
    $scope.user.logged_in = false;
    firebase.auth().signOut();
  }

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  // check if user is logged in
  $scope.user = {};
  $scope.isLogedIn = function() {
    firebase.auth().onAuthStateChanged(
      function( user ) {

        if( user ) {

          $scope.user.displayName = user.displayName;
          $scope.user.email = user.email;
          // $scope.user.emailVerified = user.emailVerified;
          $scope.user.photoURL = user.photoURL;
          $scope.user.uid = user.uid;
          // $scope.user.providerData = user.providerData;

          // user is verfied and has loged in, update ui
          user.getToken().then( function(accessToken) {
            $scope.user.logged_in = true;

          // check if user is in db
          function loadUser( snapshot ) {
            if( DEVELOPING ) console.log( snapshot.val() );

            if( snapshot.val() == null ) {

              databaseService.put( 
                "/users/" + $scope.user.uid,
                {
                  name: $scope.user.displayName,
                  email: $scope.user.email,
                  icon: $scope.user.photoURL,
                  // firebase does not support Date object cause json
                  date_created: new Date().toString()
                },
                loadUser
              );

            } else {

              $scope.user.user = snapshot.val();

              $scope.user.resources = [];
              let resources = $scope.user.user.resources;
              for( let resource_id in resources ) {
                databaseService.get( 
                  "/resources/" + resource_id,
                  function( snapshot ) {
                    $scope.user.resources.push( snapshot.val() );
                  }
                );
              }

            }

          }
          databaseService.get(
            "/users/" + $scope.user.uid,
            // load the accounts resources, launchlist, and topics
            loadUser,
            // NOTE: if no account found success handler is still called but with nal snapshat.val()
            // no account found, create the account
            function( error ) {
              if( DEVELOPING )
                console.log( "no user account", error );
            }
          );
            
          } )

        } else if( $scope.user.logged_in ) {

          $scope.user.logged_in = false;

        }

      },
      function( error ) {
        console.error( error );
      }
    );
  }

  // config firebaseUI
  var uiConfig = {
  'signInSuccessUrl': '/home',
  'signInOptions': [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    // firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  // Terms of service url.
  'tosUrl': '/tos',
  'callbacks': {
    'signInSuccess': function(currentUser, credential, redirectUrl) {
      console.log( $scope.isLogedIn(), currentUser );
      $scope.isLogedIn();
    }
  }
  };

  // // Initialize the FirebaseUI Widget using Firebase.
  // var ui = new firebaseui.auth.AuthUI(firebase.auth());
  // // The start method will wait until the DOM is loaded.
  // ui.start('#firebaseui-auth-container', uiConfig);


  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  $scope.$on('$ionicView.enter', function(e) {
    if( DEVELOPING )
      console.log( e );
    $scope.isLogedIn();
  });


})


.controller('TopicsCtrl', function($scope, databaseService) {
  $scope.tab = "topics";

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  $scope.$on('$ionicView.enter', function(e) {
    console.log( e );
    $scope.tab = 'topics';
    console.log( $scope.tab );
  });

})


.controller('TopicCtrl', function($scope, $stateParams, databaseService) {
  if( DEVELOPING )
    console.log( $stateParams );
  $scope.tab = "topic";


})


.controller('HomeCtrl', function($scope, databaseService) { 
  $scope.tab = "home";


})


.controller('LaunchlistsCtrl', function($scope, databaseService) {
  $scope.tab = "launchlists"; 



})


.controller('UserCtrl', function($scope, databaseService) {
  $scope.tab = "user"; 
  $scope.resourcesShowDelete = false;
  $scope.add_resource = false;
  $scope.addResource = function() {
    databaseService.addResource( 
      $scope.user.uid,
      {
        name: jQuery( ".add_resource .resource-name" ).val(),
        description: jQuery( ".add_resource .resource-description" ).val(),
        link: jQuery( ".add_resource .resource-link" ).val(),
      }
    );
  }

});
