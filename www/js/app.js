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

  return ( {

    init: function( $scope ) {
      // whenever the firebase value is updated call this
      // function
      var topicsListner = function( snapshot ) {
        if( DEVELOPING )
          console.log( snapshot.val() );
        $scope.topics = snapshot.val();
      }

      // set a listner for any value updates for "topic"
      this.setTopicsListner( topicsListner, "value" );

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
    }

  } );

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
