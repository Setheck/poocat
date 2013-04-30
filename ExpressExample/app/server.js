var express = require('express'),
	url 	= require('url'),
	router 	= require('./router.js'),
	app 	= express();

app.get(/\w/, function(request, response) {
	console.log("Request Url: " + request.url);
	var rootPath = "./";

	var urlParts = url.parse(request.url, true)
	var result = router.route(urlParts);
	var resultVal;
	
	switch(typeof result) {
		case "string":
			resultVal = result;
			break;
		case "object":
			resultVal = JSON.stringify(result);
			break;
	}
	
	//Add callback to be jsonp friendly
	if(urlParts.query.callback) {
		resultVal = urlParts.query.callback + "(" + resultVal + ")";
		
		response.writeHead(200, {"Content-Type": "application/javascript"});
	} else {
		response.writeHead(200, {"Content-Type": "application/json"});
	}
	
    response.write(resultVal);
    response.end();
  });

app.listen(3000);
