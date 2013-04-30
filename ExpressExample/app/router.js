var config = {
	ignorePath: "app/"
};

config.ignorePath = config.ignorePath.trim("/");

function route(urlParts) {
	var pathname = urlParts.pathname.trim("/").replace(config.ignorePath, "");
	var routeInfo = pathname.split("/");
	
	if(routeInfo.length != 2) {
		throw "Expected a url in the format of: " + config.ignorePath + ":controller/:action" + routeInfo;
	}
	
	console.log("Found route information: { controller: '" + routeInfo[0] + "', action: '" + routeInfo[1] + "'}");
	
	var theRoute = require("./" + routeInfo[0]);
	
	urlParts.query = decompressJson(urlParts.query);

	console.log("Decompressed Json: " + JSON.stringify(urlParts.query));
	
	return theRoute[routeInfo[1]](urlParts.query);
}

/**
 * Cleans slashes ('/') from the beginning and end of a url part.
 * @param {string} url Url part that may contain slashses at the beginning or end.
 * @return {string} The cleaned url part.
 */
function cleanUrlPart(url) {
	var cleanedUrl = (url.indexOf("/") == 0) ? url.substring(1) : url;
	cleanedUrl = url.lastIndexOf("/") == url.length - 1 ? url.substring(0, url.length - 1) : url

	return cleanedUrl;
}

String.prototype.trimStart = function (c) {
	if (this.length == 0) return this;

	c = c ? c : ' ';

	var i = 0;
	
	for (; this.charAt(i) == c && i < this.length; i++);

	return this.substring(i);
}

String.prototype.trimEnd = function(c) {
	c = c ? c : ' ';
	
	var i = this.length - 1;

	for(;i >= 0 && this.charAt(i) == c; i--);

	return this.substring(0, i + 1);
}

String.prototype.trim = function(c) { return this.trimStart(c).trimEnd(c); }

function decompressJson(json) {
	var decompressedJson = {};
	
	for(var key in json) {
		if(getType(json[key]) == "array") {
			var newArray = []
		
			for(var i = 0; i < json[key].length; i++)
				newArray.push(processElement(json[key][i]));
				
			decompressedJson[key] = newArray;
		} else {
			decompressedJson[key] = processElement(json[key]);
		}
	}

	return decompressedJson;
}

function processElement(jsonElement) {
	// Process KeyValue splitting.
	if(jsonElement.indexOf(":") != -1) {
		var kvSplit = jsonElement.split(":");
		
		if(kvSplit.length != 2) {
			throw "Unexpected amount of params for KeyValue formatting.";
		}
		
		jsonElement = { key:kvSplit[0], value:kvSplit[1] };
	}
	
	return jsonElement;
}

function getType(obj) {
	return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

exports.route = route;