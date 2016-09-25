// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var ITEM_TYPES = {
  community: "communities",
  heading: "heading",
  launchlist: "launchlist",
  resource: "resource",
};

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
        templateUrl: 'templates/launchlist.html',
        controller: 'LaunchlistCtrl'
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
