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
