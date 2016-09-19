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

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicLoading, $state, databaseService) {

  // create dummy topics
  var music = new Topic( "music" ),
      design = new Topic( "design" ),
      random = new Topic( "random" );

  // console.log( music, design, random );

  // the current tab i.e. page
  $scope.tab = "home";

  // dummy topics to display on the home page
  $scope.topics = {
      // music, design, random
  };

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

  $scope.resource_tags = [
    new Tag( "sound design" ),
    new Tag( "music theory" ),
    new Tag( "mixing" ),
    new Tag( "mastery" ),
    new Tag( "software/DAWs" ),
    new Tag( "hardware" ),
    new Tag( "genre" ),
    new Tag( "communities" ),
    new Tag( "games/tools" )
  ];

  $scope.launchlist_tags = [
    new Tag( "sound design" ),
    new Tag( "music theory" ),
    new Tag( "mixing" ),
    new Tag( "mastery" ),
    new Tag( "software/DAWs" ),
    new Tag( "hardware" ),
    new Tag( "genre" ),
    new Tag( "communities" ),
    new Tag( "games/tools" )
  ];

  $scope.content_types = [
    new Tag( "audio", "content_type" ),
    new Tag( "ebook", "content_type" ),
    new Tag( "image", "content_type" ),
    new Tag( "text", "content_type" ),
    new Tag( "video", "content_type" )
  ];

  $scope.tagClicked = function( tag ) {
    if( tag.selected )
      tag.css_class = tag.css_class.replace( " selected", "" );
    else
      tag.css_class = tag.css_class + " selected";
    tag.selected = !tag.selected;
  };

  $scope.getSelectedTags = function( tags, get_display_name ) {
    var selected = [];

    for( tag of tags ) {
      if( !tag.selected ) continue;
      if( get_display_name )
        selected.push( tag.display_name );
      else
        selected.push( tag.val );
    }
    return selected;
  };

  $scope.deselectTags = function( tags ) {
    if( tags == undefined ) tags = $scope.resource_tags;
    for( tag of tags )
      tag.deselectTag();
  };

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
              order: item.index,
              id: item.value
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
  $scope.user = {};
  $scope.showMyAccountBtn = function() {
    return ( $scope.tab == 'user' || !$scope.user.logged_in );
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


.controller('LaunchlistsCtrl', function($scope, $stateParams, databaseService) {
  // $scope.tab = "launchlists";
  if( DEVELOPING )
    console.log( $stateParams );

  // get the launchlist from the database
  databaseService.getLaunchlistById(
    $stateParams.launchlist_id,
    // load the launchlist into the user itnerface
    function( snapshot ) {
      $scope.loadLaunchlistList( snapshot.val() );
    }
  );


})


.controller('UserCtrl', function($scope, databaseService) {
  $scope.tab = "user";
  $scope.resources_show_delete = false;
  $scope.add_resource = false;
  $scope.launchlist_show_delete = false;
  $scope.add_launchlist = false;
  $scope.resource = {
    editing_resource: false,
    key: "",
    name: "",
    description: "",
    link: "",
    tags: [],
    // the orginal unchanged resource
    original: {},
    clear: function() {
      this.editing_resource = false;
      this.original = {};
      this.key = "";
      this.name = "";
      this.description = "";
      this.link = "";
      // this.tags = [];
      // TODO: also clear tags
      $scope.deselectTags( $scope.resource_tags );
      $scope.deselectTags( $scope.content_types );
    },
    // returns a pure resource ready to be saved to db
    get: function() {
      var selected_tags = $scope.getSelectedTags( $scope.resource_tags ),
        tag_dict = {};

      $scope.getSelectedTags( $scope.content_types )
      .forEach(
        function( tag ) {
          selected_tags.push( tag );
        }
      );

      if( DEVELOPING )
        console.log( selected_tags );

      for( tag_val of selected_tags )
        tag_dict[ tag_val ] = true;

      if( DEVELOPING )
        console.log( tag_dict );

      return {
        name: this.name,
        description: this.description,
        link: this.link,
        uid: this.original.uid,
        tags: tag_dict
      }
    },
    // sets this object with resource's values
    set: function( resource ) {
      if( resource == undefined ) {
        console.error( "resource.set, no resource passed" , resource );
        return false;
      }

      this.original = resource;
      this.editing_resource = true;
      this.key = resource.key;
      this.name = resource.name;
      this.description = resource.description;
      this.link = resource.link;

      // TODO: add a way to edit tags
      for( resource_tag in resource.tags ) {
        console.log( resource_tag );
        // TODO: create tag dictionary to avoid this loadTopic...tags_dict[ resource.tag ].selectTag()
        for( tag of $scope.resource_tags ) {
          if( tag.val == resource_tag ) {
            tag.selectTag();
            // this.tags.push( tag );
          }
        }
        for( tag of $scope.content_types ) {
          if( tag.val == resource_tag ) {
            tag.selectTag();
            // this.tags.push( tag );
          }
        }
      }
    },
    // call one of the tag functions in mian controller
    setTags: function( resource_tags ) {
    },
    update: function() {
    }
  }

  // add new resource to database
  $scope.addResource = function() {
    if( $scope.resource.editing_resource ) {
      console.log( "editing resource" );

      var new_resource = $scope.resource.get(),
        old_resource = $scope.resource.original;

      console.log( "new resource", new_rource );

      // TODO: update resource in resources list
      // TODO: clear edit resource ui, remove it, and notify user
      databaseService.updateEntity(
        "/resources/" + $scope.resource.key,
        new_resource,
        old_resource
      );

    } else {

      // TODO: update this to use $scope.resource
      // var new_resource = {
      //   name: jQuery( ".add_resource .resource-name" ).val(),
      //   description: jQuery( ".add_resource .resource-description" ).val(),
      //   link: jQuery( ".add_resource .resource-link" ).val(),
      //   uid: $scope.user.uid
      // },
      // tags = $scope.getSelectedTags( $scope.resource_tags );
      var resource = $scope.resource.get();
      resource.uid = $scope.user.uid;

      databaseService.addResource(
        resource,
        function() {
          // update my resources list
          $scope.user.resources.push( resource );
          // hide add resources
          $scope.toggleAddResource();
          // remove old data
          $scope.resource.clear();
          // tell angular to get off its lazy ass
          $scope.$apply();
        }
      );
    }

  };

  /**
    Edit existing resource
    @param resource Object
    @return null
  **/
  $scope.editResource = function( resource ) {
    if( DEVELOPING )
      console.log( resource );

    // clear old resources
    $scope.resource.clear();

    // load resource data on to form
    $scope.resource.set( resource );

    //display form
    $scope.toggleAddResource( true );
  };

  $scope.toggleAddResource = function( force_on ) {
    if( force_on )
      $scope.add_resource = true;
    else
      $scope.add_resource = !$scope.add_resource;
  };

  $scope.checkAddResource = function() {
    return $scope.add_resource;
  };

  $scope.toggleShowDelete = function() {
    $scope.resources_show_delete = !$scope.resources_show_delete;
  };

  $scope.checkShowDelete = function() {
    return $scope.resources_show_delete;
  };

  $scope.toggleAddLaunchlist = function() {
    $scope.add_launchlist = !$scope.add_launchlist;
  };

  $scope.checkAddLaunchlist = function() {
    return $scope.add_launchlist;
  };

  $scope.toggleShowLaunchlistDelete = function() {
    $scope.launchlist_show_delete = !$scope.launchlist_show_delete;
  };

  $scope.checkShowLaunchlistDelete = function() {
    return $scope.launchlist_show_delete;
  };

  $scope.addLaunchlist = function() {
    var new_launchlist = {
      name: jQuery( ".add_launchlist .launchlist-name" ).val(),
      description: jQuery( ".add_launchlist .launchlist-description" ).val(),
      icon: jQuery( ".add_launchlist .launchlist-icon" ).val(),
      uid: $scope.user.uid
    };

    databaseService.addLaunchlist(
      $scope.user.uid,
      new_launchlist,
      function() {
        // update my launchlists list
        $scope.user.launchlists.push( new_launchlist );
        // hide add resources
        $scope.toggleAddLaunchlist();
        // remove old data
        jQuery( ".add_launchlist .launchlist-name" ).val( "" );
        jQuery( ".add_launchlist .launchlist-description" ).val( "" );
        jQuery( ".add_launchlist .launchlist-icon" ).val( "" );
        // tell angular to get off its lazy ass
        $scope.$apply();
      }
    );

  };

  $scope.editLaunchlist = function() {
  };

});
