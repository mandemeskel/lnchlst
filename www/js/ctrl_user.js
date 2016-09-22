app.controller('UserCtrl', function($scope, databaseService) {
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

    // updates resource
    update: function() {
    }
  }

  $scope.launchlist = {
    editing: false,
    key: "",
    name: "",
    description: "",
    icon: "",
    tags: [],
    resources: [],
    list: [],
    // the original unchanged entity
    original: undefined,
    list_object: function( order, type, value ) {
      this.index = order;
      this.type = type;
      this.value = value;
    },
    clear: function() {
      this.editing = false;
      this.needs_save = false;
      this.original = undefined;
      this.key = "";
      this.name = "";
      this.description = "";
      this.icon = "";
      this.resources = [];
      this.list = [];
      // clear tags
      $scope.deselectTags( $scope.launchlist_tags );
    },
    // returns object that is ready to be saved to db
    get: function() {
      var select_tags = $scope.getSelectedTags(
        $scope.launchlist_tags
      );
      var tag_dict = {};

      for( tag_val of select_tags )
        tag_dict[ tag_val ] = true;

      if( this.editing )
        user_id = this.original.uid;
      else
        user_id = $scope.user.uid;

      return {
        name: this.name,
        description: this.description,
        icon: this.icon,
        uid: user_id,
        resources: this.resources,
        list: this.list,
        tags: tag_dict
      };
    },
    // set properties to launchlist's properties
    set: function( launchlist ) {
      if( launchlist == undefined ) {
        console.error( "launchlist.set, no launchlist passed" , launchlist );
        return false;
      }

      this.original = launchlist;
      this.editing = true;
      this.needs_save = false;
      this.key = launchlist.key;
      this.name = launchlist.name;
      this.description = launchlist.description;
      this.icon = launchlist.icon;
      this.resources = launchlist.resources;
      this.list = launchlist.list;
      selectTheseTags( launchlist.tags. $scope.launchlist_tags );
    },
    addResource: function( resource_id, order ) {
      if( resource_id == undefined || resource_id == "" )
        console.error( "launchlist.addResource, no resource id provided", resource_id );

      // by default add resources to the start of the list to allow user easier access
      if( order == undefined ) order = 0;

      var list_object = new this.list_object(
        order, "resource", resource_id
      );

      // add resource to list
      this.list.push( list_object );

      // add to resources list, the resources key is the key for easier readers i.e. easier to find a list in launchlist's resources list
      this.resources[ resource_id ] = true;

      // TODO: save now or later?
      // this.save()
      this.needs_save = true;

    },
    // // TODO: reanem this function?
    // addToDb: function() {
    //   // get the data to save to db
    //   var obj = this.get();
    //
    // },
    delete: function() {

    },
    save: function( force_save ) {
      if( DEVELOPING )
        console.log( "saving launchlist" );

      // for now we will just overwrite the entire object in the db
      var launchlist = this.get(),
        tags = $scope.getSelectedTags( $scope.launchlist_tags );

      // TODO: add launchlist editing
      if( this.editing ) {
        if( !this.needs_save && force_save !== true ) {
          console.log( "launchlist.save, this.needs_save is false" );
          return false;
        }

        this.needs_save = false;

      // TODO: save
      } else {

        databaseService.addLaunchlist(
          launchlist,
          tags,
          function() {
            // update my launchlists list
            $scope.user.launchlists.push( new_model );

            // hide add resources
            $scope.toggleAddLaunchlist();

            // remove old data
            $scope.launchlist.clear();

            // tell angular to get off its lazy ass
            $scope.$apply();
          }
        );

      }
    }
  };

  // TODO: check this
  function toggler( toggle ) {
    if( DEVELOPING )
      console.log( "toggler: ", toggle );
    return toggle = !toggle;
  }

  // selects tags that match selected tags
  function selectTheseTags( selected_tags, tags_list ) {
    for( selected_tag in selected_tags ) {
      for( tag of tags_list ) {
        if( tag.val == selected_tag )
          tag.selectTag();
      }
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
  * Edit existing resource
  * @param {resource} Object
  * @return {null}
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

  /**
   * Toggle the add resource form
   * @param  {bool} force_on force the form to appear
   * @return {null}
   */
  $scope.toggleAddResource = function( force_on ) {
    if( force_on )
      $scope.add_resource = true;
    else
      $scope.add_resource = !$scope.add_resource;
  };

  /**
   * Returns $scope.add_resource bool
   * @return {bool} $scope.add_resource
   */
  // $scope.checkAddResource = function() {
  //   return $scope.add_resource;
  // };

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
