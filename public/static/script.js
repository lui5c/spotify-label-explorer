(function() {

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

/** Here begins Luis's code **/
	//todo: get a function that adds rows without context
	//todo: fix table header in overlay box

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


	var closePlaylistOverlay = document.getElementById('close-playlist-overlay');
	var closeArtistOverlay = document.getElementById('close-artist-overlay');
	var dialogPlaylist = document.getElementById('songs-table');
	
	closePlaylistOverlay.onclick = hideOverlay;
	closeArtistOverlay.onclick = hideOverlay;
	
	function hideOverlay(){
		var goner_rows = document.getElementsByClassName('temp-row');
		//console.log(goner_rows);
		while(goner_rows[0]){
			goner_rows[0].parentNode.removeChild(goner_rows[0]);
		}
		$('#playlist-overlay').css('display', 'none');
		$('#releases-overlay').css('display', 'none');
	}
	
	//this is the code for populating the table with playlists
	var myTable = document.getElementById('playlist-list-table');
	const button = document.getElementById('button-populate');
	
	button.onclick = requestTwentyRows;
	var offset = 0; //offset for which playlist to GET from spotify API
	
	function addRow(name, length, playlistID){
		var theEnd = myTable.rows.length;
		var newRow = myTable.insertRow(theEnd);
		var cell1 = newRow.insertCell(0);
		cell1.innerHTML = name;
		var cell2 = newRow.insertCell(1);
		cell2.innerHTML = length;
		var cell3 = newRow.insertCell(2);	
		cell3.innerHTML = playlistID;
		newRow.onclick = bringUpPlaylistDialog;
	}
	
	function requestTwentyRows(){
		$.ajax({
			url: 'https://api.spotify.com/v1/me/playlists',
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + access_token
			},
			data: {
				limit: '20',
			 	offset: offset
			},
			success: function(response){
					//the response is preformatted JSON!
					//console.log(response);
					var i;
					for (i = 0; i < response.items.length; i++){
						var playlist = response.items[i];
						addRow(playlist.name, playlist.tracks.total, playlist.id);
					}					
				}
			});
		offset += 20;
	}
	
	//and here is the code for handling the expansion of a playlist on click
	
	function addSong(name, artist, album, label){
		var theEnd = dialogPlaylist.rows.length;
		var newRow = dialogPlaylist.insertRow(theEnd);
		newRow.classList.add("temp-row");
		var cell1 = newRow.insertCell(0);
		cell1.innerHTML = name;
		var cell2 = newRow.insertCell(1);
		cell2.innerHTML = artist;
		var cell3 = newRow.insertCell(2);
		cell3.innerHTML = album;
		var cell4 = newRow.insertCell(3);
		cell4.innerHTML = label;
	}
	
	function parseSong(song){
		var name = song.track.name;
		
		var artistObjectArray = song.track.artists;
		var artistObject = artistObjectArray[0];
		var artist = artistObject.name;
		var artist_index = 1;
		while (artist_index < artistObjectArray.length){
			artistObject = artistObjectArray[artist_index];
			var toAdd = ", " + artistObject.name;
			artist += toAdd;
			artist_index++;
		}
		
		while (artist_index < song.track.artists.length){
			var artistToAdd = 
			artist += "," + song.track.artists[artist_index];
			artist_index++;
		}
		var album = song.track.album.name;
		var href = song.track.album.href;
		var label;
		
		$.ajax({
			url: href,
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + access_token
			},
			success: function(fullAlbumObject){
					//the response is preformatted JSON!
					label = fullAlbumObject.label;
					addSong(name, artist, album, label);
				}
		});
	}
	
	function bringUpPlaylistDialog(){
		//get id of the clicked playlist
		var playlistID = $(this).children().eq(2).text();
		var url = 'https://api.spotify.com/v1/playlists/' + playlistID;
		
		$.ajax({
			url: url,
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + access_token
			},
			success: function(playlistObject){
					//the response is preformatted JSON!
					var pagingObject = playlistObject.tracks;
					var arrayOfTracks = pagingObject.items;
					var sizeOfPlaylist = pagingObject.total;
					//console.log(arrayOfTracks);
					var i;
					for (i = 0; i < sizeOfPlaylist; i++){
						parseSong(arrayOfTracks[i]);
					}					
					$("#selected-playlist-name").text(playlistObject.name);
					$("#selected-playlist-owner").text(playlistObject.owner.display_name);
				}
		});
		$("#playlist-overlay").css('display', 'block');
	}

	
	/** cute code for getting the navbar to get smaller or bigger with scroll 
	window.onscroll = function() {scrollFunction()};
	const profPic = document.getElementById('profile-pic');
	const header = document.getElementById('user-profile');
	
	function scrollFunction(){
		var amtScrolled = document.documentElement.scrollTop;
		//console.log(amtScrolled);
		if (amtScrolled > 100){
			document.getElementById('profile-pic').style.maxHeight = "70px";
			document.getElementById('user-profile').style.fontSize = "35px";
		} else{
			var newPicHeight = 70 + 90*(1 - amtScrolled/100);
			var newFontSize = 35 + 35*(1 - amtScrolled/100);
			document.getElementById('profile-pic').style.maxHeight = newPicHeight + "px";
			document.getElementById('user-profile').style.fontSize = newFontSize + "px";
		}
	} **/
	
	/** code for tabbing through playlist search or artist search **/
	
	const playlistSearchView = document.getElementById("show-playlist-search");
	const artistSearchView = document.getElementById("show-artist-search");

	const playlistsContainer = document.getElementById("playlists-container");
	const artistsContainer = document.getElementById("artists-container");
	
	playlistSearchView.onclick = showPlaylistSearch;
	artistSearchView.onclick = showArtistSearch;
	
	function showPlaylistSearch(){
		artistsContainer.style.width = "0%";
		artistsContainer.style.display = "none";
		playlistsContainer.style.width = "100%";
		playlistSearchView.style.backgroundColor = "#e0e0e0";
		artistSearchView.style.backgroundColor = "white";
	}
	
	function showArtistSearch(){
		artistsContainer.style.display = "block";
		artistsContainer.style.width = "100%";
		playlistsContainer.style.width = "0%";
		playlistSearchView.style.backgroundColor = "white";
		artistSearchView.style.backgroundColor = "#e0e0e0";
	}

	/** handling artist search form submission **/
	const artistSearchBox = document.getElementById("artist-search-box");
	const artistSearchButton = document.getElementById("artist-search-button");
	artistSearchButton.onclick = conductArtistSearch;
	
	
	function conductArtistSearch(){
		//console.log("clicked");
		var rawQuery = artistSearchBox.value;
		var arrayOfArtistObjects;
		clearSearchResults();
		
		$.ajax({
			url: 'https://api.spotify.com/v1/search',
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + access_token
			},
			data: {
				q: rawQuery,
				type: 'artist',
			},
			success: function(response){
					//the response is preformatted JSON!
					//console.log(response);
					arrayOfArtistObjects = response;
					var i;
					for (i = 0; i < arrayOfArtistObjects.artists.items.length; i++){
						var currentArtistObject = arrayOfArtistObjects.artists.items[i];
						addNewSearchResult(currentArtistObject.name, currentArtistObject.id);
					}
				}
			});
		}
		
	/** code for showing search results **/
	var resultsList = document.getElementById("artist-search-results");
	
	function clearSearchResults(){
		while (resultsList.firstChild){
			resultsList.removeChild(resultsList.firstChild);
		}
	}
	
	function addNewSearchResult(artistName, artistID){
		var theEnd = resultsList.rows.length;
		var newRow = resultsList.insertRow(theEnd);
		var cell1 = newRow.insertCell(0);
		cell1.innerHTML = artistName;
		var cell2 = newRow.insertCell(1);
		cell2.innerHTML = artistID;
		newRow.onclick = showArtistDialog;
	}
	
	var artistReleasesDialog = document.getElementById("releases-overlay");
	
	function showArtistDialog(){
		var artistID = $(this).children().eq(1).text();
		var artistName = $(this).children().eq(0).text();
		var url = 'https://api.spotify.com/v1/artists/' + artistID + '/albums';
		$.ajax({
			url: url,
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + access_token
			},
			success: function(response){
					//the response is preformatted JSON!
					//response.items is an array of release objects
					var i;
					for (i = 0; i < response.items.length; i++){
						parseRelease_ArtistOverlay(response.items[i]);
					}
				}
		});
		$("#releases-overlay").css('display', 'block');
		$("#selected-artist").text(artistName);
	}
	
	function parseRelease_ArtistOverlay(releaseObject){
		var url = releaseObject.href;
		$.ajax({
			url: url,
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + access_token
			},
			success: function(response){
					//the response is preformatted JSON!
					//response is album object, we want
					addRelease_Artist_Overlay(response.name, response.release_date, response.label);
				}
		});
	}
	
	var listOfReleases = document.getElementById("releases-table");
	
	function addRelease_Artist_Overlay(name, date, label){
		var theEnd = listOfReleases.rows.length;		
		var newRow = listOfReleases.insertRow(theEnd);
		newRow.classList.add("temp-row");
		var cell1 = newRow.insertCell(0);
		cell1.innerHTML = name;
		var cell2 = newRow.insertCell(1);
		cell2.innerHTML = date;
		var cell3 = newRow.insertCell(2);
		cell3.innerHTML = label;
	}

	/** code for searching by label **/
	const labelSearchButton = document.getElementById("label-search-button");
	const labelSearchField = document.getElementById("label-search-field");
	const labelSearchClear = document.getElementById("label-search-clear");
	labelSearchClear.onclick = clearLabelSearchResults;
	labelSearchButton.onclick = showSearchByLabelResults;
	var href;

	function sethref(link){
		href = link;
	}

	function getLabelhref(){
		return href;
	}

	function showSearchByLabelResults(){
		clearLabelSearchResults();
		var searchQuery = labelSearchField.value;
		var formattedQuery = "label:\"" + searchQuery + "\"";
		//console.log(formattedQuery);
		$.ajax({
			url: 'https://api.spotify.com/v1/search',
			method: 'GET',
			data: {
				q: formattedQuery,
				type: 'album',
				limit: '20'
			},
			headers: {
				'Authorization': 'Bearer ' + access_token,
				'Content-Type' : 'application/json',
				'Accept' : 'application/json'

			},
			success: function(response){
					//the response is preformatted JSON
					var arrayOfAlbums = response.albums.items;
					var i;
					for (i = 0; i < arrayOfAlbums.length; i++){
						parseRelease_labelSearch(arrayOfAlbums[i]);
						sethref(response.albums.next);
					}
					labelPopulateButton.onclick = addMoreLabelReleases;
			}
		});
	}

	function addMoreLabelReleases(){
		var url = getLabelhref();
		//console.log(url);
		$.ajax({
			url: url,
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + access_token
			},
			success: function(response){
					//the response is preformatted JSON!
					//response is album object, we want
					//console.log(response);
					var arrayOfAlbums = response.albums.items;
					var i;
					for (i = 0; i < arrayOfAlbums.length; i++){
						parseRelease_labelSearch(arrayOfAlbums[i]);
					}
					sethref(response.albums.next);
					labelPopulateButton.onclick = addMoreLabelReleases;
				}
		});
	}

	const labelSearch_resultsTable = document.getElementById("label-search-results");

	function parseRelease_labelSearch(album_object) {
		//get label 
		var url = album_object.href;
		$.ajax({
			url: url,
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + access_token
			},
			success: function(response){
					//the response is preformatted JSON!
					//response is album object, we want
					//console.log(response);
					var theEnd = labelSearch_resultsTable.rows.length;		
					var newRow = labelSearch_resultsTable.insertRow(theEnd);
					newRow.classList.add("temp-row");
					var cell1 = newRow.insertCell(0);
					cell1.innerHTML = album_object.name;
					var cell2 = newRow.insertCell(1);
					cell2.innerHTML = album_object.artists[0].name;
					var cell3 = newRow.insertCell(2);
					cell3.innerHTML = response.label;
					var cell4 = newRow.insertCell(3);
					cell4.innerHTML = album_object.id;
					$(newRow).hide();
					$(newRow).show('fast');
				}
		});

	}

	function clearLabelSearchResults(){
		while (labelSearch_resultsTable.firstChild){
			labelSearch_resultsTable.removeChild(labelSearch_resultsTable.firstChild);
		}
	}

	const labelPopulateButton = document.getElementById("label-populate");


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
	
	/** code for getting the name right in the welcome **/
	const nameToFillIn = document.getElementById("person-name");
	
	function setNameAs(name){
		nameToFillIn.innerText = name.toLowerCase();
	}
	
	
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
			*	access token, which then returns the "me" endpoint.
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