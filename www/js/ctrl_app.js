app.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicLoading, $state, databaseService, tagService) {
  var DEVELOPING = true;
  
  // since angular does not want to do dirty checking and calling
  // $scope.$apply is not safe, we use a function to update ui
  $scope.toggleOn = function( abool ) {
    return abool;
  }

  // create dummy topics
  var music = new Topic( "music" ),
      design = new Topic( "design" ),
      random = new Topic( "random" );

  // console.log( music, design, random );

  // the current tab i.e. page
  $scope.tab = "home";

  // dummy topics to display on the home page
  $scope.topics = {};

  // the current topic being dispalyed in topic page
  $scope.topic = {};

  // list of tags for resources
  /**
   * Tag class for modeling resource/launchlist tags
   * @param {String} name display name of tag
   */
  function Tag( name, tag_type ) {
    this.display_name = name;
    if( tag_type == undefined )
      this.tag_type = "tag";
    this.val = name.replace( " ", "-" ).replace( "/", "-" );
    this.css_class = "button tag tag-" + this.val;
    this.selected = false;
    this.deselectTag = function() {
      this.selected = false;
      this.css_class = this.css_class.replace( " selected" );
    };
    this.selectTag = function() {
      this.selected = true;
      this.css_class = this.css_class + " selected";
    };
  };

  $scope.resource_tags = tagService.resource_tags;

  $scope.launchlist_tags = tagService.launchlist_tags;

  $scope.content_types = tagService.content_types;
  
  // TODO: make this dynamic
  // list of topics that a launchlist can be saved under
  $scope.topic_tags = tagService.topic_tags;

  $scope.tagClicked = tagService.tagClicked;
  
  $scope.getSelectedTags = tagService.getSelectedTags;
  
  $scope.deselectTags = tagService.deselectTags;

  $scope.isHomePage = function() {
    // return $scope.tab == "home";
    return $state.current.name == "app.home";
  };

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

      // DONE: switch to item.order when all the dummy launchlists are gone
      // the order of the item in the launchlist
      // var order;
      // if( item.index === undefined ) 
      //   order = item.order;
      // else
      //   order = item.index;
      
      // headings don't need to be retrieved from db
      // they come with the launchlist.list
      if( item.type == ITEM_TYPES.heading ) {
          
        $scope.launchlist.list_objects.push(
          { type: item.type, item: item, order: item.order }
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
              order: item.order,
              id: item.value
            };

            if( DEVELOPING ) console.log( obj );

            $scope.launchlist.list_objects.push( obj );
          };

      // make the urls to fetch entities from database
      if( item.type == ITEM_TYPES.launchlist ) {

        ref_url = "/launchlists/" + n;

      } else if( item.type == ITEM_TYPES.resource ) {

        ref_url = "/resources/" + n;

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

  var show = function() {
    $ionicLoading.show({
      template: 'Loading...'
    }).then(function(){
       console.log("The loading indicator is now displayed");
    });
  };

  var hide = function(){
    $ionicLoading.hide().then(function(){
       console.log("The loading indicator is now hidden");
    });
  };

  show();

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
            launchlist = snapshot.val();
            launchlist.id = launchlist_id;
            topic.launchlists_objects.push( launchlist );
          }
        )

    }

    hide();

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
  $scope.user = {
    logged_in: false
  };
  // TODO: show my account page to non-logged in users?
  $scope.showMyAccountBtn = function() {
    console.log( ( $scope.tab != 'user' && $scope.user.logged_in ) );
    return ( $scope.tab != 'user' && $scope.user.logged_in );
  }
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
          $scope.user.resources = [];
          $scope.user.launchlists = [];
          $scope.user.logged_in = false;
          
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
                    // firebase db does not support Date object cause it ues json
                    date_created: new Date().toString()
                  },
                  loadUser
                );

              } else {

                $scope.user.user = snapshot.val();

                // get user's resources
                $scope.user.resources = [];
                let resources = $scope.user.user.resources;
                for( let resource_id in resources ) {
                  databaseService.get(
                    "/resources/" + resource_id,
                    function( snapshot ) {
                      let resource = snapshot.val();
                      // add resource key to resource object
                      resource.key = resource_id;
                      $scope.user.resources.push( resource );
                    }
                  );
                }

                // get user's launchlists
                databaseService.getUserLaunchlists(
                  $scope.user.uid,
                  $scope.user.user.launchlists,
                  function( snapshot ) {
                    if( DEVELOPING )
                      console.log( "databaseService.getUserLaunchlists", true, snapshot.key );

                    // get the launchlist
                    let launchlist = snapshot.val();
                    if( launchlist == null ) {
                      console.log( "databaseService.getUserLaunchlists",
                      " launchlist key found but no launchlist exists", snapshot.key )
                      launchlist = {
                        name: "bad launchlist",
                        description: "bad launchlist",
                        icon: "",
                        tags: []
                      }
                    }
                    // add launchlist's database key for later use
                    launchlist.key = snapshot.key;
                    $scope.user.launchlists.push( launchlist );
                  }
                )

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

  // feedback modal
  $scope.feedback_modal = {
    name: "",
    email: "",
    feedback: "",
    subscribe: "",
    // we want to encourage multiple feedbacks
    // so don't clear name, email, just feedback msg
    clear: function() {
     this.feedback = "";
    },
    submit: function() {
     if( DEVELOPING )
       console.log( "feedback_modal.submit", " feedback submited" );

     this.clear();
    }
  };

  // create feedback modal
  $ionicModal.fromTemplateUrl('templates/feedback.html', {
   scope: $scope
  }).then(function(modal) {
   $scope.feedback_modal.modal = modal;

   $scope.feedback_modal.open = function() {
     this.modal.show();
   };

   $scope.feedback_modal.close = function() {
     this.modal.hide();
   };

   // DONE: remove after testing
   // $scope.feedback_modal.open();

  });


  // feedback modal
  $scope.signup_modal = {
   username: "",
   email: "",
   pass1: "",
   pass2: "",
   // we want to encourage multiple feedbacks
   // so don't clear name, email, just feedback msg
   clear: function() {
     this.feedback = "";
   },
   submit: function() {
     if( DEVELOPING )
       console.log( "signup_modal.submit", " feedback submited" );

     this.clear();
   }
  };

  // create feedback modal
  $ionicModal.fromTemplateUrl('templates/signup.html', {
   scope: $scope
  }).then(function(modal) {
   $scope.signup_modal.modal = modal;

   $scope.signup_modal.open = function() {
     this.modal.show();
   };

   $scope.signup_modal.close = function() {
     this.modal.hide();
   };

   // DONE: remove after testing
   // $scope.signup_modal.open();

  });

  $scope.search = function() {
   if( DEVELOPING )
     console.log( "searching..." );
  }

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
