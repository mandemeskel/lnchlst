app.controller('UserCtrl', function($scope, databaseService, tagService) {
  var DEVELOPING = true;
  // Item types, this $scope variable is so that we have acces to
  // ITEM_TYPES in dom
  $scope.ITEM_TYPES = ITEM_TYPES;
  
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
    // where the resource is from
    source: "",
    tags: [],
    // the orginal unchanged resource
    original: {},
    clear: function() {
      this.editing_resource = false;
      this.original = {};
      this.key = "";
      this.name = "";
      this.description = "";
      this.source = "";
      this.link = "";
      // this.tags = [];
      // TODO: also clear tags
      tagService.deselectTags( tagService.resource_tags );
      tagService.deselectTags( tagService.content_types );
    },

    // returns a pure resource ready to be saved to db
    get: function() {
      var selected_tags = tagService.getSelectedTags( tagService.resource_tags ),
        tag_dict = {};

      tagService.getSelectedTags( tagService.content_types )
      .forEach(
        function( tag ) {
          selected_tags.push( tag );
        }
      );

      if( DEVELOPING )
        console.log( selected_tags );

      for( var tag_val of selected_tags )
        tag_dict[ tag_val ] = true;

      if( DEVELOPING )
        console.log( tag_dict );

      return {
        name: this.name,
        description: this.description,
        link: this.link,
        source: this.source,
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
      this.source = resource.source;

      // TODO: add a way to edit tags
      for( var resource_tag in resource.tags ) {
        
        console.log( resource_tag );
        
        // TODO: create tag dictionary to avoid this loadTopic...tags_dict[ resource.tag ].selectTag()
        for( var tag of $scope.resource_tags ) {
          if( tag.val == resource_tag ) {
            tag.selectTag();
            // this.tags.push( tag );
          }
        }
        
        for( var tag of tagService.content_types ) {
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
  };

  /**
   * The class for the list item objects in launchlists
   */
  function Item( name, creator) {
    this.name = name;
    this.creator = creator;
    this.description;
    this.link;
    this.source;
    this.tags = [];
    this.content_types;
    
    this.key;
    this.type;
    this.date_created;
    this.date_updated;
    
    // clears item of all data
    this.clear = function() {
      this.name = undefined;
      this.creator = undefined;
      this.description = undefined;
      this.link = undefined;
      this.tags = undefined;
      this.content_types = undefined;
      
      this.key = undefined;
      this.type = undefined;
      this.date_created = undefined;
      this.date_updated = undefined;
    };
    
    // create new item
    this.create = function( name, creator ) {
      return new Item( name, creator );
    };
    
    // delete item
    this.delete = function() {
      this.clear();
    };
      
    // edit item
    this.edit = function( new_values ) {
      // TODO
    };
    
    // get item info
    this.get = function() {
      // TODO
    };
      
    // set item info
    this.set = function( item ) {
      this.name = item.name;
      this.description = item.description;
      // TODO: add item type specific code
    };
  
    // get item as dict
    this.toDict = function() {
      // TODO
    };
    
  };
  

  $scope.launchlist = {
    // are we edditng a launchlist
    editing: false,
    // whether or not the editor is editing this launchlist or something else
    editing_self: false,
    // display the intructions on how to edit launchlists
    show_help: true,
    // dispaly editor for editing lanunchlist/creating new items
    show_editor: true,
    //prompt to show to users when using editor
    editor_msg: "",
    // firebase unqiue for this launchlist
    key: "",
    name: "",
    description: "",
    icon: "",
    // user is
    uid: "",
    tags: [],
    topics: [],
    resources: [],
    headings: [],
    launchlists: [],
    list: [],
    new_items: [],
    // the original unchanged entity
    original: undefined,
    // new item to add to launchlist
    new_item: new Item(),
    
    // the object that gets saved into the launchlist's list
    list_object: function( name, order, type, key ) {
      this.value = name;
      this.description;
      this.order = order;
      this.type = type;
      this.key = key;
    },
    
    // clear launchlist of all data
    clear: function() {
      this.editing = false;
      this.editing_self = false;
      this.needs_save = false;
      this.original = undefined;
      this.key = "";
      this.name = "";
      this.description = "";
      this.icon = "";
      this.uid = "";
      this.resources = [];
      this.headings = [];
      this.launchlists = [];
      this.tags = [];
      this.topics = [];
      this.list = [];
      this.new_items = [];
      // clear tags
      tagService.deselectTags( tagService.launchlist_tags );
      tagService.deselectTags( tagService.topic_tags );
    },
    
    // clear editor item
    clearEditor: function() {
      this.editing_self = false;
      this.new_item = new Item();
    },
    
    // returns object that is ready to be saved to db
    get: function() {
      var selected_tags = tagService.getSelectedTags(
        tagService.launchlist_tags
      );
      var selected_topics = tagService.getSelectedTags(
        tagService.topic_tags
      );
      var tag_dict = {}, topics_dict = {}, user_id;

      for( var tag_val of selected_tags )
        tag_dict[ tag_val ] = true;
    
      for( var topic of selected_topics )
        topics_dict[ topic ] = true;
      
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
        tags: tag_dict,
        topics: topics_dict
      };
    },
    
    // transfers info from launchlist edito to launchlist
    getUserInput: function() {
      this.name = this.new_item.name;
      this.description = this.new_item.description;
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
      this.uid = $scope.user.uid;
      
      if( launchlist.headings !== undefined )
        this.headings = launchlist.headings;
        
      if( launchlist.launchlists !== undefined )
        this.launchlists = launchlist.launchlists;
      
      if( launchlist.resources !== undefined )
        this.resources = launchlist.resources;
        
      if( launchlist.list !== undefined )
        this.list = launchlist.list;
      
      if( launchlist.topics !== undefined )
        this.topics = launchlist.topics;
      
      this.new_item = new Item();
      
      this.new_item.set( this );
        
      // TODO: launchlist specific tags?
      selectTheseTags( launchlist.tags, tagService.launchlist_tags );
    },
    
    // TODO
    addResource: function( resource_id, order ) {
      if( resource_id === undefined || resource_id === "" )
        console.error( "launchlist.addResource, no resource id provided", resource_id );

      // by default add resources to the start of the list to allow user easier access
      if( order === undefined ) order = 0;

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
    
    // adds item to launchlist's list at the top of the list for easier
    // editing
    addItem: function( item, type ) {
      
      var list_obj = new this.list_object();
      
      if( type === undefined )
        type = item.type;
      
      if( type == ITEM_TYPES.resource ) {
        
        // item = $scope.user.resources[ item ];
        
        if( item.key )
          list_obj.key = item.key;
      
        list_obj.link = item.link;
        
        if( item.source )
          list_obj.source = item.source;
        else
          list_obj.source = "";
          
        // TODO: add tags
        // list_obj.tags = tagService.getSelectedTags( tagService.resource_tags );
        // list_obj.tags = tagService.getSelectedTags( tagService.content_types );
      
      }
      
      // TODO: get all info from editor
      // the item type i.e. resource, launchlist, et al.
      list_obj.type = type;
      list_obj.value = item.name;
      
      if( item.description )
        list_obj.description = item.description;
      
      // TODO: should be zero
      list_obj.order = this.list.length;
      
      // keep track of what items have been added
      this.new_items.push( list_obj ); 
      
      // add list_obj to front of array ( index, delete_count, item )
      this.list.splice( 0, 0, list_obj );
      
      this.editor_msg = "item added";
      
    },
    
    // TODO: this does not work when using orderBY: 'order' filter in ngRepeat
    // TODO: save new order list items
    // move item to a new place in the list
    moveItem: function( usurper, from, to ) {
      if( DEVELOPING )
        console.log( "launchlist.moveItem", usurper, from, to );
      
      // the list is ordered by the order property so that when we move
      // list objects we have to change their order property to persist
      // the move
      var len = this.list.length;
      for( var n=0; n < len; n++ ) {
        if( this.list[ n ].order == to ) {
          
          this.list[ n ].order = from;
          this.list[ n ].needs_update = true;
        }
      }
                                                                     
      usurper.order = to;
      // make sure this list item is updated to database
      usurper.needs_update = true;
      
      // var victim = this.list[ to ];
      // console.log( "launchlist.moveItem before", this.list );
      
      // this.list.splice( to, 1, usurper );
      // console.log( "launchlist.moveItem move 1", this.list );
      
      // this.list.splice( from, 1, victim );
      // console.log( "launchlist.moveItem move 2", this.list );
    },

    // TODO
    delete: function() {

    },
    
    // TODO
    save: function( force_save ) {
      if( DEVELOPING )
        console.log( "saving launchlist" );

      // for now we will just overwrite the entire object in the db
      // var launchlist = this.get();
      // launchlist.tags = tagService.getSelectedTags( tagService.launchlist_tags );

      // TODO: add launchlist editing
      if( this.editing ) {

        // TODO: why???        
        // if( !this.needs_save && force_save !== true ) {
        //   console.log( "launchlist.save, this.needs_save is false" );
        //   return false;
        // }

        // i dont even know why???
        this.needs_save = true;
        // get databaseServicer input from launchlist editor form
        if( this.editing_self ) {
          
          this.getUserInput();
          // update the launchlist itself
          databaseService.updateLaunchlist( this );
          
        }
        
        // databaseService.saveItem( launchlist, ITEM_TYPES.launchlist );
        databaseService.saveTheLaunchlist( this );
        
        // this.editing = false;
        this.clear();
        
      // TODO: save
      } else {
        
        var launchlist = this.get();
        
        databaseService.addLaunchlist(
          launchlist,
          function() {
            // update my launchlists list
            $scope.user.launchlists.push( $scope.launchlist.get() );

            // hide add resources
            $scope.toggleAddLaunchlist();

            // remove old data
            $scope.launchlist.clear();

            // tell angular to get off its lazy ass
            $scope.$apply();
          }
        );

      }
    },
  
    // controls if launchlist edit section
    // returns launchlist.editing, because fucking angular
    isEditing: function() {
      return this.editing;
    },
    
    // returns what bool or what this.new_item is
    newItemIs: function( type ) {
      if( type )
        return type == this.new_item.type;
      
      return this.new_item.type;
    },
    
    // controls the launchlist edit editor form
    // returns launchlist.show_editor
    showEditor: function() {
      return this.show_editor;
    },
    
    // FIXED: can't reorder list due to this listner hogging mouse events
    // shows menu to edit/delete/share launchlist item
    edit_item_menu: false,
    showEditItemMenu: function( item_type, index ) {
      this.edit_item_menu = !this.edit_item_menu;
                                  
      if( this.edit_item_menu ) {
          
        jQuery( ".item." + item_type + index ).addClass( "show-options" );
          
      } else {
        
        jQuery( ".item." + item_type + index ).removeClass( "show-options" );
        
      }
      
      // console.log( jQuery( ".item." + item_type + index ).attr( "class" ) );
      
      return this.edit_item_menu;
    },
    
    // submit handler for editor
    onEditorSubmit: function() {
      
      // add item to launchlist
      if( !this.editing_self ) {
      
        this.addItem( this.new_item, this.new_item.type );
        this.editor_msg = "Saved!";
        this.new_item.clear();
        
      // update launchlist info: name and description
      } else {
        
        this.getUserInput();
        // update the launchlist itself
        databaseService.updateLaunchlist( this );
        
      }
      
      // TODO: remove this? save on editor close???
      // this.save()
      
    },
    
    // changes the type of item the editor is creating/editing
    toggleAddItem: function( type ) {
      
      switch( type ) {
        
        case ITEM_TYPES.heading:
        case ITEM_TYPES.launchlist:
        case ITEM_TYPES.resource:
          var item = new Item();
          item.type = type;
        break;
        
        default:
          this.show_editor = false;
        return false;
      }
      
      this.new_item = item;
      if( !this.show_editor ) this.show_editor = true;
      if( this.editing_self ) this.editing_self = false;
    }
  
    
  };

  // TODO: check this
  function toggler( toggle ) {
    if( DEVELOPING )
      console.log( "toggler: ", toggle );
    
    toggle = !toggle;
    return toggle;
  }

  // selects tags that match selected tags
  function selectTheseTags( selected_tags, tags_list ) {
    for( var selected_tag in selected_tags ) {
      for( var tag of tags_list ) {
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

      console.log( "new resource", new_resource );

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

  /**
   * Display LaunchList edit UI
   */
  $scope.editLaunchlist = function( launchlist ) {
    if( DEVELOPING )
      console.log( "editLaunchlist: ", launchlist  );
    
    // get the launchlist ready for editng, transform this from
    // a dictionary to an array
    var temp_list = [];
    for( var key in launchlist.list ) {
      var item = launchlist.list[ key ];
      item.key = key;
      temp_list.push( item );
    }
    launchlist.list = temp_list;
    
    $scope.launchlist.clear();
    $scope.launchlist.set( launchlist );
    $scope.launchlist.editing = true;
    $scope.launchlist.editing_self = true;

  };
  
  /**
  * Drag drop hangler
  */
  $scope.dragResource = function( resource_index ) {
    if( DEVELOPING )
      console.log( "dragResource: ", resource_index );
  };
  
  /**
   * Drag drop hangler
   */
  $scope.releaseResource = function( resource_index ) {
    if( DEVELOPING )
      console.log( "releaseResource: ", resource_index );
  };

  // TODO: item does not have type property 
  /**
   * Remove it from database
   */
  $scope.deleteItem = function( item, index ) {
    if( DEVELOPING )
      console.log( "$scope.deleteItem:", item, index );
    
    // remove item from database
    // databaseService.deleteLaunchlist( item );
    
    // remove item from user object
    // if( item.type == ITEM_TYPES.heading )
    
  }

});
