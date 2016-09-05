// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var app = angular.module('main', ['ionic', 'main.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
    // views: {
    //   'menuContent': {
    //     templateUrl: 'templates/search.html'
    //   }
    // }
  })

  .state('app.home', {
    url: '/',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      }
    }
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html'
        }
      }
    })

  .state('app.topics', {
    url: '/topics',
    views: {
      'menuContent': {
        templateUrl: 'templates/topics.html',
        controller: 'TopicsCtrl'
      }
    }
  })

  .state('app.topic', {
    url: '/topics/:topic_name',
    views: {
      'menuContent': {
        templateUrl: 'templates/topic.html',
        controller: 'TopicCtrl'
      }
    }
  })

  .state('app.launchlists', {
    url: '/launchlists/:launchlist_id',
    views: {
      'menuContent': {
        templateUrl: 'templates/launchlists.html',
        controller: 'LaunchlistsCtrl'
      }
    }
  })

  .state('app.user', {
    url: '/user',
    views: {
      'menuContent': {
        templateUrl: 'templates/user.html',
        controller: 'UserCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise( '/' );

});


var DEVELOPING = true,
    BASE_URL = "http://localhost:8100", //"http://192.168.42.64:8080", //"http://localhost:8080",
    BASE_API_URL = "https://lnchlist.firebaseio.com";

    if( !DEVELOPING )
    BASE_URL = "https://lnchlist.appspot.com";


/**
 * Start the app
 */
app.run( function() {
    // TODO: add loading screen
} );


/**
 * Handles all firebase database logic
 * @param  {None}
 * @return {Object} object with methods to access db
 */
app.service( "databaseService", function() {
  function pushSuccess() {
    console.log( "databaseService.pushSuccess",  true );
  }

  function dbError( error ) {
    console.error( "databaseService.dbError", error );
  }

  return ( {

    addNewItemToList: function( list_url, item, onSuccess, onError ) {
      if( list_url == "" || item == undefined ) return false;
      if( onSuccess == undefined ) onSuccess = pushSuccess;
      if( onError == undefined ) onError = dbError;

      var the_list = firebase.database().ref( list_url );
      var new_item = the_list.push();

      new_item.set( item ).then( onSuccess, onError );
      return true;
    },

    addToList: function( list_url, onSuccess, onError ) {
      if( onSuccess == undefined ) onSuccess = pushSuccess;
      if( onError == undefined ) onError = dbError;

      var the_list = firebase.database().ref( list_url );
      the_list.set( true ).then( onSuccess, onError );
      return true;
    },

    addLaunchlist: function( launchlist, tags, onSuccess, onError ) {

      var launchlist_key = this.addModel( launchlist.uid, launchlist, "launchlist", onSuccess, onError );

      console.log( "databaseService.addLaunchlist, launchlist key:", launchlist_key );

      if( tags != undefined )
        this.addTag( launchlist_key, "launchlist", tags );

    },

    addModel: function( user_id, model, model_type, onSuccess, onError ) {
      // get model url
      var models_url = "/" + model_type + "s/";
      var models = firebase.database().ref( models_url );
      var new_model = models.push();

      if( onSuccess == undefined ) {
        onSuccess = function() {
          console.log( "databaseService.addModel", true );
        }
      }

      if( onError == undefined ) {
        onError = function( error ) {
          console.error( "databaseService.addModel", error );
        }
      }

      // save the model
      new_model.set( model ).then( function() {
          console.log( "databaseService.addModel", true );
        },
        onError
      );

      // add model to user's model list
      var model_url = models_url + new_model.key;
      var user_models = firebase.database().ref(
        "users/" + user_id + model_url );
      user_models.set( true  ).then( onSuccess, onError );

      return new_model.key;
    },

    addResource: function( uid, resource, tags, success, error ) {
      // add resource to database
      var resources = firebase.database().ref( "/resources/" );
      var new_resource = resources.push();

      // if( DEVELOPING )
      //   console.log( "databaseService.addResource", new_resource.key );

      if( success == undefined ) {
        success = function() {
          console.log( "databaseService.addResource", true );
        }
      }

      if( error == undefined ) {
        error = function( error ) {
          console.error( "databaseService.addResource", error );
        }
      }

      new_resource.set( resource ).then( function() {
          console.log( "databaseService.addResource", true );
        }, error );

      // add resource id to user resources list
      var resource_url = "/resources/" + new_resource.key;
      var user_resources = firebase.database().ref(
        "users/" + uid + resource_url );
      user_resources.set( true  ).then( success, error );

      this.addTag( new_resource.key, "resource", tags );

    },

    // TODO: add tags to resources/launchlists
    addTag: function( obj_id, obj_type, tags, onSuccess, onError ) {
      if( onSuccess == undefined ) {
        onSuccess = function() {
          console.log( "Added tag" );
        }
      }

      var obj_url = "/" + obj_type + "s";
      var ref_url = obj_url + "/" + obj_id + "/tags/";
      var obj_id_url =  obj_url + "/" + obj_id;
      for( tag of tags ) {
        // add tag to entity
        this.addToList( ref_url + tag, onSuccess );

        // update tag with id of entity
        this.addToList( "/tags/" + tag + obj_id_url );
      }
    },

    init: function( $scope ) {
      // whenever the firebase value is updated call this
      // function
      var topicsListner = function( snapshot ) {
        if( DEVELOPING )
          console.log( snapshot.val() );

        // TODO: use Topic object
        $scope.topics = snapshot.val();

        // for( let key in $scope.topics ) {
        //   let topic = $scope.topics[ key ];

        //   if( topic.launchlists == [] ) continue;
        //   topic.launchlists_objects = [];

        //   for( let launchlist_id in topic.launchlists )
        //     topic.launchlists_objects.push(
        //       this.getLaunchlistById( launchlist_id )
        //     );
        // }

      }

      // set a listner for any value updates for "topic"
      this.setTopicsListner( topicsListner, "value" );

    },

    get: function( ref_url, apromise, on_error ) {
      if( DEVELOPING )
        console.log( "databaseService.get", ref_url );

      if( ref_url == "" || apromise == undefined ) return [];

      var response = firebase.database().ref( ref_url );

      if( on_error == undefined ) {
        on_error = function( error ) {
          console.error( error );
        }
      }

      if( response == undefined ) {
        if( DEVELOPING )
          console.log( "databaseService.getValueAtRef", "nothing found at " + ref_url );
        return [];
      }

      response.once( "value" ).then( apromise, on_error );

    },

    getLaunchlistById: function( launchlist_id, apromise ) {
      if( DEVELOPING )
        console.log( "databaseService.getLaunchlistById", launchlist_id );

      if( apromise == undefined ) {
        var launchlists = this.getValueAtRef( "/launchlists/" + launchlist_id )

        if( launchlists == [] ) return undefined;

        // getValueAtRef returns an array by default
        return launchlists[0];
      }

      this.getValueAtRef( "/launchlists/" + launchlist_id, apromise );

    },

    getLaunchlistsById: function( launchlist_ids ) {
      if( DEVELOPING )
        console.log( "databaseService.getLaunchlistsById", launchlist_ids );

      launchlists = [];
      for( var id in launchlist_ids ) {

        launchlist = this.getLaunchlistById( id );
        if( launchlist == undefined )
          continue;

        launchlists.push( launchlist );

      }

      console.log( "databaseService.getLaunchlistsById", launchlists );
      return launchlists;

    },

    getUserList: function( user_id, model_ids, model_type, onSuccess, onError ) {

      if( onSuccess == undefined ) {
        onSuccess = function() {
          console.log( "databaseService.getUserList", true );
        }
      }

      if( onError == undefined ) {
        onError = function( error ) {
          console.error( "databaseService.getUserList", error );
        }
      }

      var model_url = "/" + model_type + "s/"

      for( let model_id in model_ids ) {
        this.get(
          model_url + model_id,
          onSuccess,
          onError
        );
      }
    },

    getUserLaunchlists: function( user_id, launchlist_ids, onSuccess, onError ) {

      if( onSuccess == undefined ) {
        onSuccess = function( snapshot ) {
          if( DEVELOPING )
            console.log( "databaseService.getUserLaunchlists", true, snapshot.key );
        }
      }

      if( onError == undefined ) {
        onError = function( error ) {
          console.error( "databaseService.getUserLaunchlists", error );
        }
      }

      // we get the actual launchlist object in onSuccess
      this.getUserList( user_id, launchlist_ids, "launchlist", onSuccess, onError );

    },

    // TODO: make this function private
    getValueAtRef: function( ref_url, apromise ) {
      if( DEVELOPING )
        console.log( "databaseService.getValueAtRef", ref_url );

      if( ref_url == "" ) return [];

      var response = firebase.database().ref( ref_url );

      if( response == undefined ) {
        if( DEVELOPING )
          console.log( "databaseService.getValueAtRef", "nothing found at " + ref_url );
        return [];
      }

      if( apromise == undefined ) {

        var models = []
        response.once( "value", function( snapshot ) {
          if( DEVELOPING )
            console.log( "databaseService.getValueAtRef", snapshot.val() );
          models.push( snapshot.val() );
        } );

        return models;
      }

      response.once( "value" ).then( apromise );

    },

    getTopics: function() {
      var topics,
          listner = function( snapshot ) {
            if( DEVELOPING )
              console.log( snapshot.val() );
            topics = snapshot.val();
          }

      // get ALL topics from firebase db
      var topics = firebase.database().ref( "/topics" );

      // read the data once, don't bind this listener to topics
      topics.once( "value", listner );

      return topics;
    },

    getTopicByName: function( $scope, topic_name ) {
      if( DEVELOPING )
        console.log( "getTopicByName", topic_name );

      if( $scope.topics == undefined )
        $scope.topics = this.getTopics();

      return $scope.topics[ topic_name ];

    },

    put: function( ref_url, data, apromise, on_error ) {
      if( ref_url == "" ) {
        if( DEVELOPING )
          console.log( "databaseService.put", "ref_url is empty" );
        return "";
      }

      if( apromise == undefined ) {
        apromise = function( snapshot ) {
          if( snapshot != undefined )
            console.log( "databaseService.put", snapshot.val() );
          else
            console.log( "databaseService.put, success" );
        }
      }

      if( on_error == undefined ) {
        on_error = function( error ) {
          console.error( "databaseService.put", error );
        }
      }

      firebase.database().ref( ref_url ).set( data ).then( apromise, on_error );

    },

    setTopicsListner: function( listner, db_event ) {
      // var topics;

      if( listner == undefined )
        listner = function( snapshot ) {
          // if( DEVELOPING )
          //   console.log( snapshot.val() );
          topics = snapshot.val();
        }

      if( db_event == undefined )
        db_event = "value"

      // get topics from firebase db
      var topics = firebase.database().ref( "/topics" );

      // whenever the firebase value is updated call this
      // function
      topics.on( db_event, listner );
    },

    // TODO: make function that only replaces certain properties of entity
    // NOTE: THIS REPLACES THE ENTIRE ENTITY
    updateEntity: function( ref_url, new_entity, old_entity, apromise, onError ) {
      if( ref_url == undefined || new_entity == undefined ) {
        console.error( "databaseService.updateEntity, undefined arguments passed", ref_url, new_entity );
        return false;
      }

      // remove any key within the entity, we don't want self refrence to duplicate data
      if( new_entity.key != undefined )
        delete new_entity.key;

      // TODO: compare entities, old vs new, before sending, full update or partial depending on this comparison
      this.put( ref_url, new_entity, apromise, onError );
      return true;
    }

  } );

} );


app.service( "loading", function($ionicLoading) {

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

    return {
        show: function( template, startLoading ) {
            if( template == undefined )
                template = "Loading...";
            if( startLoading == undefined )
                startLoading = function() {
                    if( DEVELOPING )
                        console.log( "Started loading.." );
                };

            $ionicLoading.show( {
                template: template
            } ).then( function() {
                startLoading();
            } )
        },
        hide: function( stopLoading ) {

            if( stopLoading == undefined )
                stopLoading = function() {
                    if( DEVELOPING )
                        console.log( "Stoped loading." );
                };

            $ionicLoading.hide().then( stopLoading );

        }
    }


} );


/**
 * Capitalizes first letter of word passed by angular expression
 * @param  {None}
 * @return {String}   the capitalized string
 */
app.filter( "capitalize", function() {
  return function( input ) {
    if( input == undefined ) return "";
    return input.charAt(0).toUpperCase() + input.substr(1).toLowerCase();
  }

} );


/**
 * The ajaxService handles all the server calls.
 * @param  {Object} $http   namesapce that allows access to Angular's ajax api
 * @return {Object}         a collection of functions that make unique calls to the server
 */
app.service( "ajaxService", function( $http, $location ) {

    return ({

        request : function( method, url, data, onSuccess, onFail ) {

            if( onSuccess == null )
                onSuccess = handleAJAXSuccess;

            if( onFail == null )
                onFail = handleAJAXFail;

            var request = $http({
                method: method,
                url: url,
                data: data,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });

            return request.then( onSuccess, onFail );

        },

        // TODO: add arg to change number topics requested, default is 9
        getTopics : function( onSuccess, onFail ) {

            return this.request(
                "GET",
                BASE_API_URL + "/topics",
                "",
                onSuccess,
                onFail
            )

        },

        getTopic: function( topic_key, onSuccess, onFail ) {

            var action = BASE_API_URL + "/topic/" + topic_key;

            // update browser url to topic
            $location.path( action );

            return this.request(
                "GET",
                action,
                "",
                onSuccess,
                onFail
            );

        }

    })

});
