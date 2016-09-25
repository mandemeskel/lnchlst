/**
 * Handles all firebase database logic
 * @param  {None}
 * @return {Object} object with methods to access db
 */
var databaseService = function() {
  function pushSuccess() {
    console.log( "databaseService.pushSuccess",  true );
  }

  function dbSuccess() {
    console.log( "databaseService.dbSuccess", true );
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
    
    // TODO: DRY
    addItemToList: function( list_url, value, onSuccess, onError ) {
      if( onSuccess == undefined ) onSuccess = pushSuccess;
      if( onError == undefined ) onError = dbError;
      if( value == undefined ) value = true;
    
      var the_list = firebase.database().ref( list_url );
      the_list.set( value ).then( onSuccess, onError );
      return true;
    },
    
    // TODO: DRY
    addToList: function( list_url, onSuccess, onError ) {
      return this.addItemToList( list_url, true, onSuccess, onError );
    },

    addLaunchlist: function( launchlist, onSuccess, onError ) {

      var launchlist_key = this.addModel( launchlist.uid, launchlist, "launchlist", onSuccess, onError );

      console.log( "databaseService.addLaunchlist, launchlist key:", launchlist_key );

      if( launchlist.tags != undefined )
        this.addTag( launchlist_key, "launchlist", launchlist.tags );

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

    addResource: function( resource, success, error ) {
      // add resource to database
      var resources = firebase.database().ref( "/resources/" ),
        uid = resource.uid;
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
      user_resources.set( true ).then( success, error );

      this.addTag( new_resource.key, "resource", resource.tags );
      
      return new_resource.key;

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
      // TODO: this is not being called
      for( atag of tags ) {
        console.log( atag );

        // add tag to entity
        this.addToList( ref_url + atag, true, onSuccess );

        // update tag with id of entity
        this.addToList( "/tags/" + atag + obj_id_url );
      }
      // for( var n=0; n < tags.length; n++) {
      //   var atag = tags[n];
      //
      //   // add tag to entity
      //   this.addToList( ref_url + atag, onSuccess );
      //
      //   // update tag with id of entity
      //   this.addToList( "/tags/" + atag + obj_id_url );
      // }

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
    },

    // add item to databse
    saveItem: function( item, type ) {
      if( DEVELOPING )
        console.log( "databaseService.saveItem: ", item, type );

      switch( type ) {
        case ITEM_TYPES.heading:
          server_resource = this.saveHeading( item );
        break;

        case ITEM_TYPES.launchlist:
          server_resource = this.getItem( item );
        break;

        case ITEM_TYPES.resource:
          server_resource = this.getItem( item );
        break;

        default:
        return false;
      }

      pushToDb()

    },

    // add item to launchlist
    addToLaunchlist: function( launchlist_key, item ) {
      if( DEVELOPING  )
        console.log( "databaseService.addToLaunchlist: saving", item );
      
      var item_list_url = "/launchlists/" + launchlist_key + "";
      var list_url = item_list_url + "/list/" + item.key;
      
      // add item to launchlist url
      if( type == ITEM_TYPES.launchlist ) {
        
        item_list_url += "/child_launchlists";
        
      } else if( type == ITEM_TYPES.resource ) {
        
        item_list_url += "/resources";
        
      } else {
        
        console.error( "databaseService.addToLaunchlist: bad item type=", type );
        return false;
        
      }
      
      var model = {
        type: item.type,
        order: item.order,
        value: item.name
      };
      
      // add to launchlist list
      this.addItemToList( list_url, model, item.key );
      // add to item specfic list
      this.addItemToList( item_list_url, item.key );
      
    },

    // load launchlist from server
    loadLaunchlit: function( launchlist_id, onYes, onNo ) {
      // TODO: load and return launchlist
    },

    // save heading under launchlist
    saveHeading: function( item, launchlist_key ) {
      var heading = {
        index: item.order,
        value: item.name,
        description: item.description,
        type: "heading"
      };

      var url = "launchlists/" + launchlist_key + "/headings"
      this.firebasePush( url, heading, dbSuccess, dbError );
    },
    
    // adds a launchlist to the database
    saveLaunchlist: function( item, uid ) {
      
      item.uid = uid;
      return this.addResource( item );
      
    },
    
    // adds a resource to the database
    saveResource: function( item, uid ) {
      
      item.uid = uid;
      return this.addLaunchlist( item );
      
    },
    
    // save the launchlist in its entirety
    // TODO: should be a $scope.launchlist function
    saveTheLaunchlist: function( launchlist ) {
      if( DEVELOPING )
        console.log("databaseService.saveTheLaunchlist: ", launchlist  );
      
      // save new items added to alunchlist
      if( launchlist.new_items !== undefined ) {
        for( var n=0; n < launchlist.new_items.length; n++ ) {
          
          var new_item = launchlist.new_items[ n ];
          
          if( new_item.type == ITEM_TYPES.heading ) {
          
            // headings get saved under their respective launchlist
            // not as independent database items
            this.saveHeading( new_item, launchlist.key );
            continue;
          
          } else if( new_item.type == ITEM_TYPES.resource && new_item.key === undefined ) {
          
            var key = this.saveResource( new_item, launchlist.uid );
            if( key === false ) continue;
            new_item.key = key;  
          
          } else if( new_item.type == ITEM_TYPES.launchlist ) {
          
            var key = this.saveLaunchlist( new_item, launchlist.uid );
            if( key === false ) continue;
            new_item.key = key;
            
          } else
            continue;
          
          // add item the database's lists
          this.addToLaunchlist( launchlist.key, new_item );
          
        }
      }
       
     // update the launchlist itself
     this.updateLaunchlist( launchlist );
      
      
    },
    
    // updates launchlist name and description only, for now
    updateLaunchlist: function( launchlist ) {
      if( DEVELOPING )
        console.log( "databaseService.updateLaunchlist: ", launchlist );
        
      var launchlist_url = "/launchlists/" + launchlist.key + "/";
      var updates= {};
      
      updates[ launchlist_url + "name" ] = launchlist.name;
      updates[ launchlist_url + "description" ] = launchlist.description;
      
      // NOTE: firebase.ref().update is not persisting changes
      this.firebaseUpdate( updates ).then( dbSuccess, dbError );
      // this.firebaseSet( launchlist_url + "name", launchlist.name );
      // this.firebaseSet( launchlist_url + "description", launchlist.description );
    },

    // save item at firebase url, overwrites existing item at url
    firebaseSet: function( url, item, onYes, onNo ) {
      if( DEVELOPING )
        console.log( "databaseService.firebaseSet: ", url, item );
            
      if( onYes === undefined ) onYes = dbSuccess;
      
      if( onNo === undefined ) onNo = dbError;
      
      firebase.database().ref( url ).set( item ).then( onYes, onNo );
    },

    // add item to list at the passed url
    // returns a key of item saved at that list list url
    firebasePush: function( list_url, item, onYes, onNo ) {
      if( DEVELOPING )
        console.log( "databaseService.firebasePush: ", list_url, item );
      
      if( onYes === undefined ) onYes = dbSuccess;
      
      if( onNo === undefined ) onNo = dbError;
      
      var new_item = firebase.database().ref( list_url ).push();
      
      try {
        new_item.set( item ).then( onYes, onNo );
      } catch( error ) {
        console.error( "databaseService.firebasePush: ", error, item );
        return false;
      }
      
      return new_item.key;
    },
    
    // TODO: add promise handling 
    // update exisitng entity, specific fields
    firebaseUpdate: function( updates ) {
      if( DEVELOPING )
        console.log( "databaseService.firebaseUpdate: ", updates );
      
      // if( onYes === undefined ) onYes = dbSuccess;
      
      // if( onNo === undefined ) onNo = dbError;
      
      // update returns a promise
      return firebase.database().ref().update( updates );
    }

  } );

};
app.service( "databaseService", databaseService );


/**
* Handles tags for different Item types
* @type {Service}
*/
app.service( "tagService", function() {

  // Tag types
  var TAG_TYPES = {
    content: "content",
    tag: "tag",
    topic: "topic"
  };

  function Tag( name, tag_type ) {
    this.display_name = name;

    if( tag_type == undefined )
      this.tag_type = TAG_TYPES.tag;

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

  var resource_tags = [
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

  var launchlist_tags = [
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

  var content_types = [
    new Tag( "audio", "content_type" ),
    new Tag( "ebook", "content_type" ),
    new Tag( "image", "content_type" ),
    new Tag( "text", "content_type" ),
    new Tag( "video", "content_type" )
  ];


  return {
    // content types for resources
    content_types: content_types,

    // launchlist specfic tags
    launchlist_tags: launchlist_tags,

    // resource specfic tags
    resource_tags: resource_tags,

    // tag on click on handler
    tagClicked: function( tag ) {
      if( tag.selected )
        tag.css_class = tag.css_class.replace( " selected", "" );
      else
        tag.css_class = tag.css_class + " selected";
      tag.selected = !tag.selected;
    },

    // return list of selected tags
    getSelectedTags: function( tags, get_display_name ) {
      var selected = [];

      for( var tag of tags ) {
        if( !tag.selected ) continue;
        if( get_display_name )
          selected.push( tag.display_name );
        else
          selected.push( tag.val );
      }
      return selected;
    },

    // deselect all tags
    deselectTags: function( tags ) {
      if( tags == undefined ) tags = resource_tags;
      for( var tag of tags )
        tag.deselectTag();
    }
  }
} );


/**
 * Creates loading notification modal/pop-up that blocks
 * further user input and action
 * @type {Service}
 */
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
