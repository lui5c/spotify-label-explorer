(function() {
  /**
      function isMobile() {
        return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }

    if (isMobile()) {
      //execute the redirect to mobile page here
    } **/
        /**
         * Obtains parameters from the hash of the URL
         * @return Object
         */
        function getHashParams() {
          var hashParams = {};
          var e, r = /([^&;=]+)=?([^&;]*)/g,
              q = window.location.hash.substring(1);
          while ( e = r.exec(q)) {
             hashParams[e[1]] = decodeURIComponent(e[2]);
          }
          return hashParams;
        }

        //var userProfileSource = document.getElementById('user-profile-template').innerHTML,
        //    userProfileTemplate = Handlebars.compile(userProfileSource),
        //    userProfilePlaceholder = document.getElementById('user-profile');

        //var oauthSource = document.getElementById('oauth-template').innerHTML,
        //    oauthTemplate = Handlebars.compile(oauthSource),
        //    oauthPlaceholder = document.getElementById('oauth');

        var params = getHashParams();


        var access_token = params.access_token,
            refresh_token = params.refresh_token,
            error = params.error;

    /** code for getting the name right in the welcome **/
  const nameToFillIn = document.getElementById("person-name");
  
  function setNameAs(name){
    nameToFillIn.innerText = name.toLowerCase();
  }
/** TODO:
  - get a function that adds rows without context
  - fix table header in overlay box
**/ 


  const helpDiv = document.getElementById("help");
  const showHelpButton = document.getElementById("show-help");
  showHelpButton.onclick=showHelp;
  const hideHelpButton = document.getElementById("hide-help");
  hideHelpButton.onclick=hideHelp;

  function hideHelp() {
    $(helpDiv).hide(400);
  }

  function showHelp(){
    $(helpDiv).show(400);
  }

  /** code for the hidden login **/
  const headerWithHidden = document.getElementById("header-container");
  var hiddenEnterButton = document.getElementById("hidden-enter-button");
  
  headerWithHidden.addEventListener('mouseenter', e => {
    $(hiddenEnterButton).css('display', 'inline-block');
    $(hiddenEnterButton).fadeIn("fast");
  });
  headerWithHidden.addEventListener('mouseleave', e => {
    $(hiddenEnterButton).fadeOut("fast");
  });
  
  /** code for search **/
  /*
  *  
  *
  *
  */
  const resultsList = document.getElementById("results-list");
  var searchInput = document.getElementById("search-input");
  var labelSearchButton = document.getElementById("label-search");
  var artistSearchButton = document.getElementById("artist-search");
  var playlistSearchButton = document.getElementById("playlist-search");

  var loadMoreHref;
  var loadMoreType;

  function setLoadMoreInfo(typeOfResult, link){
    loadMoreHref = link;
    loadMoreType = typeOfResult;
  }

  $("#showmore").on("mousedown", function(event){
    event.preventDefault();
    loadMore();
  })

  function loadMore(){
    var flag = true;
    if (!loadMoreHref){
      flag = false;
      $("#showmore").hide();
    }
    if (loadMoreType == "artists" && flag){
      $.ajax({
          url: loadMoreHref,
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response){
            for (var i = 0; i < response.artists.items.length; i++){
              addArtistResult(response.artists.items[i]);
            }
            setLoadMoreInfo("artists", response.artists.next);
          }
      });
    }
    if (loadMoreType == "albums" && flag){
      $.ajax({
      url: loadMoreHref,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      success: function(response){
        //the response is preformatted JSON!
        for (var i = 0; i < response.items.length; i++){
          getLabelAndAdd(response.items[i], response.items[i].href);
          }
        setLoadMoreInfo("albums", response.next);
      }
      });
    }
    if (loadMoreType == "label_albums" && flag){
      $.ajax({
      url: loadMoreHref,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      success: function(response){
        console.log(response);
        //the response is preformatted JSON!
        for (var i = 0; i < response.albums.items.length; i++){
          getLabelAndAdd(response.albums.items[i], response.albums.items[i].href);
          }
        setLoadMoreInfo("label_albums", response.albums.next);
      }
      });
    }
    if (loadMoreType == "playlists" && flag){
      $.ajax({
        url: loadMoreHref,
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        success: function(response){
          //the response is preformatted JSON!
          for (var i = 0; i < response.playlists.items.length; i++){
            addPlaylistResult(response.playlists.items[i]);
          }
          setLoadMoreInfo("playlists", response.playlists.next);
        }
      });
    } 
  }

  $('#search-input').on('keyup keypress', function(e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode === 13) { 
      e.preventDefault();
      return false;
    }
  });

  labelSearchButton.onclick = function() {barSearch("albums")}

  artistSearchButton.onclick = function() {barSearch("artists")}

  playlistSearchButton.onclick = function() {barSearch("playlists")}

  /** the types of results to show will be 
  * artists (search for artist)
  * artist_releases (artist.onclick)
  * label_releases (search for label, label.onclick)
  * playlists (search for playlist)
  * songs (playlist.onclick, album.onclick)   
  */

  $('#showmore').hide();

  function barSearch(typeOfResult) {
    $("#results-list").empty();
    var searchQuery = searchInput.value;
    searchAndDisplay(searchQuery, typeOfResult);
  }

  function clickSearch(typeOfResult, link){
    $('#showmore').show();
    $("#results-list").empty();
    if (typeOfResult == "albums"){
      $.ajax({
      url: link,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      success: function(response){
        //the response is preformatted JSON!
        for (var i = 0; i < response.items.length; i++){
          getLabelAndAdd(response.items[i], response.items[i].href);
          }
        setLoadMoreInfo("albums", response.next);
      }
      });
    }
    if (typeOfResult == "songs"){
      $.ajax({
      url: link,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      success: function(response){
        for (var i = 0; i < response.tracks.items.length; i++){
          songs_getLabelAndAdd(response.tracks.items[i].track, response.tracks.items[i].track.album.href);
        }
        setLoadMoreInfo("songs", response.next);
      }
      });
    }
    if (typeOfResult == "album_songs"){
      $.ajax({
      url: link,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      success: function(response){
        for (var i = 0; i < response.tracks.items.length; i++){
          addSongResult(response.tracks.items[i], response.label);
        } 
        setLoadMoreInfo("songs", response.next);
      }
      });
    }
  }

  function searchAndDisplay(searchQuery, typeOfResult){
    $('#showmore').show();
    if (typeOfResult == "artists"){
      $("#results-list").empty();
      $.ajax({
      url: 'https://api.spotify.com/v1/search',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      data: {
        q: searchQuery,
        type: 'artist',
      },
      success: function(response){
          //console.log(response);
          arrayOfArtistObjects = response;
          var i;
          for (i = 0; i < arrayOfArtistObjects.artists.items.length; i++)
          {
            addArtistResult(response.artists.items[i]);
          }
          setLoadMoreInfo("artists", response.artists.next);
        }
      });
    }
    if (typeOfResult == "albums"){
      console.log("searching label:\"" + searchQuery + "\"");
      $("#results-list").empty();
      $.ajax({
      url: 'https://api.spotify.com/v1/search',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      data: {
        q: "label:\"" + searchQuery + "\"",
        type: 'album',
      },
      success: function(response){
        //the response is preformatted JSON!
        for (var i = 0; i < response.albums.items.length; i++){
          getLabelAndAdd(response.albums.items[i], response.albums.items[i].href);
          }
        console.log(response);
        setLoadMoreInfo("label_albums", response.albums.next);
      }
      });
    }
    if (typeOfResult == "playlists"){
      $("#results-list").empty();
      $.ajax({
      url: 'https://api.spotify.com/v1/search',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      data: {
        q: searchQuery,
        type: 'playlist',
      },
      success: function(response){
          for (var i = 0; i < response.playlists.items.length; i++)
          {
            addPlaylistResult(response.playlists.items[i]);
          }
          setLoadMoreInfo("playlists", response.playlists.next);
        }
      });
    }
  }

  function addArtistResult(artistObject){
    /** artistObject has id, href, name, images, 
    *   
    **/
    var img = "<img src=\"";
    img += artistObject.images[0].url;
    img += "\" />";

    /**
    var title = "<a onclick=\"" + "function aye(){clickSearch('albums', '";
    title += artistObject.href + "')}\">";
    title += artistObject.name + "</a>"; **/

    var title = "<a data-artistOnClick='true' data-href='";
    title += artistObject.href + "'>";
    title += artistObject.name + "</a>";

    var openExternal = "<a class='openexternal' href=\'";
    openExternal += artistObject.uri + "'>";
    openExternal += "open in Spotify // </a>";

    var secondRow = "<div class='second-row'>";
    secondRow += openExternal;
    secondRow += artistObject.genres[0];

    for (var i = 1; i < artistObject.genres.length; i++){
      secondRow += ", " + artistObject.genres[i];
    }
    
    var table = "<table class='response-container'>";
    table += "<tr><td>";
    table += title + "</td></tr>";
    table += "<tr><td>";
    table += secondRow + "</td></tr>";

    listElement = "<li class='list-group-item'>";
    listElement += img + table;
    listElement += "</li>";

    var DOM_adder = $(listElement).hide();
    $(resultsList).append(DOM_adder);
    DOM_adder.show('fast');
  }

  function addAlbumResult(albumObject, labelText){
    /** albumObject has name, artist, label, year 
    *   href, items[], next, 
    *   each release has album_type, artists, name, release_date, 
    *   images[0].url
    **/
    var img = "<img src=\"";
    img += albumObject.images[0].url;
    img += "\" />";

    var title = "<a data-albumOnClick='true' data-href='";
    title += albumObject.href + "'>";
    title += albumObject.name + "</a>";


    var openExternal = "<a class='openexternal' href=\'";
    openExternal += albumObject.uri + "'>";
    openExternal += "open in Spotify // </a>";

    var secondRow = "<div class='second-row'>";
    secondRow += openExternal;

    var firstArtist = "<a data-artistOnClick='true' data-href='";
    firstArtist += albumObject.artists[0].href + "'>";
    firstArtist += albumObject.artists[0].name + "</a>";

    secondRow += firstArtist;

    for (var i = 1; i < albumObject.artists.length; i++){
      secondRow += ", ";
      var nextArtist = "<a data-artistOnClick='true' data-href='";
      nextArtist += albumObject.artists[i].href + "'>";
      nextArtist += albumObject.artists[i].name + "</a>";
      secondRow += nextArtist;
    }

    var label = "<a data-labelSearch='true' data-label='";
    label += labelText + "'>" + labelText;
    label += " </a>";

    var year = albumObject.release_date;

    var releaseType = albumObject.album_type

    secondRow += " - " + year + " - " + label + " - " + releaseType + "</div>";
    
    var table = "<table class='response-container'>";
    table += "<tr><td>";
    table += title + "</td></tr>";
    table += "<tr><td>";
    table += secondRow + "</td></tr>";

    listElement = "<li class='list-group-item'>";
    listElement += img + table;
    listElement += "</li>";

    var DOM_adder = $(listElement).hide();
    $(resultsList).append(DOM_adder);
    DOM_adder.show('fast');
  }

  function addPlaylistResult(playlistObject){
    //playlist should show image, title, author
    var img = "<img src=\"";
    img += playlistObject.images[0].url;
    img += "\" />";

    var title = "<a data-playlistOnClick='true' data-href='";
    title += playlistObject.href + "'>";
    title += playlistObject.name + "</a>";

    var openExternal = "<a class='openexternal' href=\'";
    openExternal += playlistObject.uri + "'>";
    openExternal += "open in Spotify // </a>";

    var secondRow = "<div class='second-row'>";
    secondRow += openExternal;
    secondRow += playlistObject.owner.display_name;
    secondRow += "</div>";

    /**
    for (var i = 1; i < artistObject.genres.length; i++){
      secondRow += ", " + artistObject.genres[i];
    } **/
    
    var table = "<table class='response-container'>";
    table += "<tr><td>";
    table += title + "</td></tr>";
    table += "<tr><td>";
    table += secondRow + "</td></tr>";

    listElement = "<li class='list-group-item'>";
    listElement += img + table;
    listElement += "</li>";

    var DOM_adder = $(listElement).hide();
    $(resultsList).append(DOM_adder);
    DOM_adder.show('fast');
  }

  function getLabelAndAdd(albumObject, href){
    $.ajax({
      url: href,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      success: function(response){
        addAlbumResult(albumObject, response.label);
      }
    });
  }

  function songs_getLabelAndAdd(songObject, href){
    $.ajax({
      url: href,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      success: function(response){
        addSongResult(songObject, response.label);
      }
    });
  };

  function addSongResult(songObject, labelText){
    /** songObject has name, artist, album, label, album.href 
    *   album.images[0];
    **/
    var img = "<img src=\"";
    img += songObject.album.images[0].url;
    img += "\" />";

    var title = "<a>";
    title += songObject.name + "</a>";

    var secondRow = "<div class='second-row'>";

    var firstArtist = "<a data-artistOnClick='true' data-href='";
    firstArtist += songObject.artists[0].href + "'>";
    firstArtist += songObject.artists[0].name + "</a>";

    secondRow += firstArtist;

    for (var i = 1; i < songObject.album.artists.length; i++){
      secondRow += ", ";
      var nextArtist = "<a data-artistOnClick='true' data-href='";
      nextArtist += songObject.artists[i].href + "'>";
      nextArtist += songObject.artists[i].name + "</a>";
      secondRow += nextArtist;
    }

    var label = "<a data-labelSearch='true' data-label='";
    label += labelText + "'>" + labelText;
    label += " </a>";

    var album = "<a data-albumOnClick='true' data-href='";
    album += songObject.album.href + "'>" + songObject.album.name;
    label += " </a>";

    secondRow += " - " + album + " - " + label + "</div>";
    
    var table = "<table class='response-container'>";
    table += "<tr><td>";
    table += title + "</td></tr>";
    table += "<tr><td>";
    table += secondRow + "</td></tr>";

    listElement = "<li class='list-group-item'>";
    listElement += img + table;
    listElement += "</li>";

    var DOM_adder = $(listElement).hide();
    $(resultsList).append(DOM_adder);
    DOM_adder.show('fast');
  }

  $(document).on("click", "a", function(){
    if (this.getAttribute("data-showMore") == "true"){
      loadMore();
    }
    if (this.getAttribute("data-artistOnClick") == "true"){
      var newLink = this.getAttribute("data-href") + "/albums";
      clickSearch("albums", newLink);
    }
    if (this.getAttribute("data-labelSearch") == "true"){
      searchAndDisplay(this.getAttribute("data-label"), "albums");
    }
    if (this.getAttribute("data-playlistOnClick") == "true"){
      clickSearch("songs", this.getAttribute("data-href"));
    }
    /** what do we want album onclick to do?
    if (this.getAttribute("data-albumOnClick") == "true"){
      clickSearch("album_songs", this.getAttribute("data-href"));
    } **/
  });

    /** Here ends Luis's code'**/

        if (error) {
          alert('There was an error during the authentication');
        } else {
          if (access_token) {
            // render oauth info
      /**
            oauthPlaceholder.innerHTML = oauthTemplate({
              access_token: access_token,
              refresh_token: refresh_token
            }); **/

      /** here a call is made to the spotify API with the authorizer's 
      * access token, which then returns the "me" endpoint.
      *
      **/
            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                  'Authorization': 'Bearer ' + access_token
                },
                success: function(response) {
                  setNameAs(response.display_name);

                  $('#login').hide();
                  $('#loggedin').show();
                }
            });
          } else {
              // render initial screen
              $('#login').show();
              $('#loggedin').hide();
          }

          document.getElementById('obtain-new-token').addEventListener('click', function() {
            $.ajax({
              url: '/refresh_token',
              data: {
                'refresh_token': refresh_token
              }
            }).done(function(data) {
              access_token = data.access_token;
              oauthPlaceholder.innerHTML = oauthTemplate({
                access_token: access_token,
                refresh_token: refresh_token
              });
            });
          }, false);
        }
      })();