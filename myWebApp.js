// Refresh Button Call

const GeolocationAPI = 'AIzaSyDBRx0crV33B-rLPoQr7SkYl4_ZrUOZzig';
const moviesShowsAPI = 'eaf569253a2f1da8b1911aedf15c6ea6';
const cinemasAPI = '';

let cinemas;
let map;


$( window ).on( "load", moviesandTv )


//Event to geolocate user
$(document).on("click", "#mapi", function () {

    event.preventDefault();

    $.post("https://www.googleapis.com/geolocation/v1/geolocate?key=" + GeolocationAPI, function (result) {

        let latitude = result.location.lat
        let longitude = result.location.lng

        console.log(latitude,longitude);

        removeMapp(map)
        AddMap(latitude, longitude);
        cinemasLocation(latitude, longitude);
    });
});


//Event to handle movie and tv shows searchs
$('document').ready(function () {
    $('input#search').keypress(function (e) {
        if (e.which == 13) {
            moviesandTv();
            //cinemas(8,3);
        }
    });
    $('#select input').change(function () {
        moviesandTv();
    });
});


//Event to navigate to navigate to map
$(document).on("pagebeforeshow", '#home', function () {
    $(document).on("click", '#mapi', function (e) {

        e.preventDefault();
        e.stopImmediatePropagation();

        $.mobile.changePage("#map-page");
    });
});



//Event to navigate to navigate to details
$(document).on("pagebeforeshow", '#home', function () {
    $(document).on('click', '#to_details', function (e) {

        e.preventDefault();
        e.stopImmediatePropagation();

        currentTvMovie = tvOrMovie[e.currentTarget.children[3].id];

        $.mobile.changePage("#details");
    });
});





//Event to populate movies or tv show details
$(document).on('pagebeforeshow', '#details', function (e) {
    e.preventDefault();

    let tvShowsUrl = 'https://api.themoviedb.org/3/';
    let category = $("input[type='radio']:checked").val();
    let movieID = currentTvMovie.id;

    let queryUrlShow = `${tvShowsUrl}${category}/${movieID}?api_key=${moviesShowsAPI}`;

    let poster = isImage(currentTvMovie.poster_path);
    let title = category == 'movie' ? 'original_title' : 'original_name';

    $('#tvMovieIcon').attr('src', poster);
    $('#tvMovieName').text(currentTvMovie[title]);
    $('#tvMovieDescription').text(currentTvMovie.overview);
    $('.clearfix').css('background', `linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)),url(${poster})`);

    populateDetailsShow(queryUrlShow, category);

});



//Add map and current location to display
function AddMap(lat, lon) {
    map = L.map('map').setView([lat, lon], 15);

    L.tileLayer(' https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
    }).addTo(map);

    L.marker([lat, lon]).addTo(map).bindPopup("<h2 id='pop-up'>Here you are!</h2>").openPopup();

    window.setTimeout(function () {
        map.invalidateSize();
    }, 1000);

};

function removeMapp(map) {
    if (map !== undefined && map !== null) {
        map.remove();
    }
}



//Get Nearby Cinemas Information (ONLY 75 REQUEST!!!!!)
function cinemasLocation(lat, lon) {

    $.ajax({
        url: 'https://api-gate2.movieglu.com/cinemasNearby/?n=10',
        method: 'GET',
        headers: {
            'api-version': 'v200',
            'x-api-key': 'WB67S8ateD3ogaE882ltx6npSbbJIKIt4nzhcRN0',
            'territory': 'ES',
            'authorization': 'Basic VU5JVl8zNDpiV0xlOGxvamZSd2I=',
            'client': 'UNIV_34',
            'device-datetime': '2019-12-14T16:24:17.000Z',
            'geolocation': `${lat.toFixed(3)};${lon.toFixed(3)}`
        },
        success: function (data) {
            console.log(data)
            cinemas = data.cinemas;

            AddPoints(cinemas,map);
        }
    });

}


//In case REQUEST ARE DONE!
/*function cinemasLocation(lat,lon) {

    $.getJSON('/cinemas.json',function(data){
            console.log(data);

            cinemas = data.cinemas;
            AddPoints(cinemas,map);
        }
    )
}*/

//Add Cinemas to map.
function AddPoints(cinemas, map) {

    let cinemaIcon = L.icon({
        iconUrl: '/img/marker-icon-2x.png',
        shadowUrl: '/img/marker-shadow.png',

        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    $.each(cinemas, function (index, cinema) {
        let cinemaDetails = `<h2 id='pop-up-name'>${cinema.cinema_name}</h2><hr><div id="pop-up">${cinema.address}</div><div id="pop-up">${cinema.address2}</div>
        <div id="pop-up">Distance: ${cinema.distance.toFixed(2)} km</div>`

        L.marker([cinema.lat, cinema.lng], {icon: cinemaIcon}, {opacity: 0.8}).addTo(map).bindPopup(cinemaDetails);
    });
}

//Fuction to populate list of movies and tv shows.
function moviesandTv() {
    let tvShowsUrl = 'https://api.themoviedb.org/3/';
    let category = $("input[type='radio']:checked").val();
    let keyWord = getKeyWord();


    let QueryUrl = keyWord =='%20'? '' : `&query=${keyWord}&page=1&include_adult=false`;
    let search = keyWord =='%20'? 'discover': 'search';

    let queryUrl = `${tvShowsUrl}${search}/${category}?api_key=${moviesShowsAPI}${QueryUrl}`

    console.log(queryUrl)


    $.getJSON(queryUrl, function (data) {

        tvOrMovie = data.results;
        $('tvmovie_list li').remove();
        $('#tvmovie_list').empty();

        let title = category == 'movie' ? 'original_title' : 'original_name';
        let date = category == 'movie' ? 'release_date' : 'first_air_date';

        $.each(tvOrMovie, function (index, movie) {

            let poster = isImage(movie.poster_path);

            $('#tvmovie_list').append(`<li><a id="to_details" data-transition="pop" href="#"><img id="image_content"src=${poster}>
                <h2>${movie[title]}</h2>
                <p>${dateBeautify(movie[date])}</p>
                <span id=${index} class="ui-li-count">${movie.vote_average.toFixed(1)}</span></a></li>`);
        });


        $('#tvmovie_list').listview('refresh');
    })
}


//Function to populate specific tv shows and movies details 
function populateDetailsShow(URL, category) {

    $.getJSON(URL, function (data) {

        show = data;

        let gender = show.genres.length == 0 ? 'Unknown' : show.genres[0].name;
        let duration = category == 'movie' ? show.runtime : show.episode_run_time;

        let year = category == 'movie' ? dateCheck(show.release_date).split("-")[0] : dateCheck(show.first_air_date).split("-")[0];

        $('#gener').text(` ${gender}`);
        $('#year').text(` ${year}`);
        $('#duration').text(` ${duration} min`);
        $('#score').text(` ${show.vote_average*10} %`);

        category == 'tv' ? $('#status').text(show.status) : $('#status').text(show.tagline);
        category == 'tv' ? $('#statusmovie').text('') : $('#statusmovie').text(show.status);

        isTVShow(category);


    });
}

//function to populate tv shows seasons
function isTVShow(category) {

    $('sea li').remove();
    $('#sea').empty();
    $('#sea').listview().listview('refresh');

    if (category === 'tv') {

        let seasons = show.seasons;

        $.each(seasons, function (index, season) {

            let seasondate = season.air_date == null ? 'No information' : season.air_date;

            $('#info').show();

            $('#sea').append(`<li data-role="list-divider">${season.name}\n <p id="airDate">${seasondate}</p><span id="episode" class="ui-li-count">episodes:
                 ${season.episode_count}</span></li>`);
        });
        $('#sea').listview().listview('refresh');
    } else {
        $('#info').hide();
    }

}


//function to get users input and tranform it to use in the request
function getKeyWord() {
    let searchKeyWords = $('input#search').val();

    if (searchKeyWords == '') {
        keyWord = '%20';
    } else {
        keyWord = encodeURI(searchKeyWords);
    }
    return keyWord;
}


//fuction to detect if teh date is null or not
function dateBeautify(dateString) {
    if (dateString == null) {
        return ' ';
    } else {
        return urlString(dateString);
    }
}

// changes the date format
function urlString(string) {
    let date = string.split('-');
    let months = {
        '01': 'January',
        '02': 'February',
        '03': 'March',
        '04': 'April',
        '05': 'May',
        '06': 'June',
        '07': 'July',
        '08': 'August',
        '09': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December',
    }

    if (date == '') {
        return '';
    } else {
        return `${parseInt(date[2])} ${months[date[1]]}, ${date[0]}`;
    }
}

//function to change null poster to a default image.
function isImage(imgString) {
    if (imgString == null) {
        img = 'img/default.jpg';
    } else {
        img = `https://image.tmdb.org/t/p/w600_and_h900_bestv2${imgString}`;
    }
    return img;
}

//function to change null date to a empty string.
function dateCheck(date){
    let finalDate;
    if (date==null){
        finalDate='';
    }else{
        finalDate= date;
    }
    return finalDate;
}