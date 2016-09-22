app.controller('LaunchlistCtrl', function($scope, $stateParams, databaseService) {
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


});
