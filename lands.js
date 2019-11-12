var cardsJson = {};

async function getCardsList() {
	let result;
	if (typeof localStorage.cardsTime === "undefined" || Date.now() - Number(localStorage.cardsTime) >= 86400000) {
		try {
			const cardsUrl = 'https://api.scryfall.com/cards/search?q=%28type%3Aland+type%3Abasic%29+legal%3Astandard+%28set%3Arna+OR+set%3Agrn+OR+set%3Adom+OR+set%3Arix+OR+set%3Axln+OR+set%3Am19%29+unique%3Aprints&unique=cards&as=grid&order=name';
			result = await $.get(cardsUrl, function(cardsList) {
				localStorage.cardsList = cardsList;
				localStorage.cardsTime = Date.now();
				console.log("Cards list updated.");
			}, "text");
			return result;
		} catch (error) {
			console.error("Couldn't request data on cards: " + error);
		}
	} else return;
}

function fillCards() {
	cardsJson = JSON.parse(localStorage.cardsList);
	var length = cardsJson.data.length;
	var colsPerRow = 4;
	var picks = $("#picks");
	$.each(cardsJson.data, function(index, card) {
		var rowNb = Math.floor(index / colsPerRow);
		var colNb = index % colsPerRow;
		if (colNb == 0) {
			picks.append("<div class=\"row row-mb\" id=\"row" + rowNb + "\"></div>");
		}
		var row = $("#row"  + rowNb);
		row.append("<div class=\"col\" id=\"col" + rowNb + "-" + colNb + "\"></div>");
		var col = $("#col"  + rowNb + "-" + colNb);
		var cardCard = "";
		cardCard += "<div class=\"card text-white bg-dark ";
		cardCard += card.color_identity[0];
		cardCard += "\"><img src=\"";
		cardCard += card.image_uris.art_crop;
		cardCard += "\" class=\"card-img-top\"><div class=\"card-body\"><h5 class=\"card-title\">"
		cardCard += card.name;
		cardCard += "</h5><h6 class=\"card-subtitle mb-2 text-muted\">";
		cardCard += card.artist;
		cardCard += "</h6><input class=\"form-control-sm\" id=\"";
		cardCard += index;
		cardCard += "\" type=\"number\" min=\"0\"></div></div>";
		col.append(cardCard);
		if (index == length - 1) {
			for (var i = colNb + 1; i < colsPerRow; i++) {
				row.append("<div class=\"col\"></div>");
			}
		}
		if (card.set == "dom") {
			card.set = "dar";
		}
	});
}

function toggleElem(elem){
	$("." + $(elem).attr("id")).toggle();
	$(elem).toggleClass("ms-cost");
}

function submit() {
	$("#result").empty();
	var result = "";
	var lands = $("input").filter(function(index){
		return this.value != 0;
	});
	$.each(lands, function(index, input) {
		var card = cardsJson.data[input.id];
		result += input.value + " " + card.name + " (" + card.set + ") " + card.collector_number + "\n";
	});
	$("#result").append(result);
}

function reset() {
	$.each($("input"), function(index, input) {
		input.value = input.defaultValue;
	});
	$("#result").empty();
}

function updateCards() {
	getCardsList()
	.then(() => fillCards());
}