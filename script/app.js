// _ = helper functions
function _parseMillisecondsIntoReadableTime(timestamp) {
	//Get hours from milliseconds
	const date = new Date(timestamp * 1000);
	// Hours part from the timestamp
	const hours = '0' + date.getHours();
	// Minutes part from the timestamp
	const minutes = '0' + date.getMinutes();
	// Seconds part from the timestamp (gebruiken we nu niet)
	// const seconds = '0' + date.getSeconds();

	// Will display time in 10:30(:23) format
	return hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s
}

// 5 TODO: maak updateSun functie

function updateSun(totalMinutes, sunUpMinutes, sun){
	const perc = Math.floor(sunUpMinutes/totalMinutes*100);
	sun.style.left = perc+'%';

	let now = new Date();
	let y = -0.04 * Math.pow(perc, 2) + 4 * perc - 2e-13;
	let x = perc;

	sun.setAttribute('data-time', _parseMillisecondsIntoReadableTime(now / 1000));
	sun.style.bottom = `${y}%`;
	sun.style.left = `${x}%`;
}

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = (totalMinutes, timestampSunset, timestampSunrise) => {
	// In de functie moeten we eerst wat zaken ophalen en berekenen.
	// Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
	let now = new Date();
	let sunset = new Date(timestampSunset * 1000);
	let sunsetMinutes = sunset/(1000*60);
	let diff = new Date(sunset.getTime() - now.getTime());
	let diffminutes = diff/(1000*60);

	let sun = document.querySelector('.js-sun');

	// Bepaal het aantal minuten dat de zon al op is.
	let sunrise = new Date(timestampSunrise * 1000);
	let sunriseMinutes = sunrise/(1000*60);

	let diffSunrise = new Date(now.getTime() - sunrise.getTime());
	let diffSunriseMinutes = diffSunrise/(1000*60);
	// console.log(diffSunriseMinutes);
	// Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
	updateSun(totalMinutes, diffSunriseMinutes, sun);
	// We voegen ook de 'is-loaded' class toe aan de body-tag.
	document.querySelector('.js-body').classList.add('is-loaded');
	// Vergeet niet om het resterende aantal minuten in te vullen.
	document.querySelector('.js-time-left').innerHTML = `${Math.floor(diffminutes)} minutes`;
	// Nu maken we een functie die de zon elke minuut zal updaten

	// Bekijk of de zon niet nog onder of reeds onder is
	if (now.getTime()>sunset.getTime()) {
		document.documentElement.classList = ['is-night'];
		document.querySelector('.js-time-left').innerHTML = `0 minutes`;
	}else {
		document.documentElement.classList = ['is-day'];
	}
	// Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
	// PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
};

// 3 Met de data van de API kunnen we de app opvullen
let showResult = queryResponse => {
	// We gaan eerst een paar onderdelen opvullen
	// console.log(queryResponse.city);
	// Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
	document.querySelector('.js-location').innerHTML = `${queryResponse.city.name}, ${queryResponse.city.country}`;
	// Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
	document.querySelector('.js-sunrise').innerHTML = _parseMillisecondsIntoReadableTime(queryResponse.city.sunrise);
	document.querySelector('.js-sunset').innerHTML = _parseMillisecondsIntoReadableTime(queryResponse.city.sunset);
	// Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
	// Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
	const minutes = Math.floor((parseInt(queryResponse.city.sunset) - parseInt(queryResponse.city.sunrise)) / 60);
	// console.log(minutes);
	placeSunAndStartMoving(minutes, queryResponse.city.sunset, queryResponse.city.sunrise);
	setInterval(()=>placeSunAndStartMoving(minutes, queryResponse.city.sunset, queryResponse.city.sunrise), 1000*60);
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = (lat, lon) => {
	// Eerst bouwen we onze url op
	const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=3cca7d77733bd576a2c25e88ff3b50f1&units=metric&lang=nl&cnt=1`;

	// Met de fetch API proberen we de data op te halen.
	// const response = fetch(url);
	fetch(url).then(function(response)	{
		console.info('Er is een response teruggekomen van de server');
		return response.json();
	}).then(function(jsonObject) {
		console.info('json object is aangemaakt');
		showResult(jsonObject);
		}).catch(function(error) {
			console.error(`fout bij verwerken json${error}`);
		});

	// Als dat gelukt is, gaan we naar onze showResult functie.

};

document.addEventListener('DOMContentLoaded', function() {
	// 1 We will query the API with longitude and latitude.
	console.log('script Loaded!');
	getAPI(50.8027841, 3.2097454);
});
