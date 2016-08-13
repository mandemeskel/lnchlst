function Topic( name, description, icon ) {
    this.name = name;

    if( description == undefined )
        description = "no description";
    this.description = description;

    if( icon == undefined )
        icon = "../img/ionic.png";
    this.icon = icon;

    this.launchlists = [];
}




angular.module('main.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, databaseService) {

  var music = new Topic( "music" ),
      design = new Topic( "design" ),
      random = new Topic( "random" );

  // console.log( music, design, random );

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

  // init listners to firebase database
  databaseService.init( $scope )

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

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
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})


.controller('TopicsCtrl', function($scope, databaseService) {



})


.controller('TopicCtrl', function($scope, $stateParams, databaseService) {
  if( DEVELOPING )
    console.log( $stateParams );

})


.controller('HomeCtrl', function($scope, databaseService) { 



});
