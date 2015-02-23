var _ = require("underscore");
var async = require("async");
var Download = require("download");
var parse = require("csv-parse");
var path = require("path");
var fs = require("fs");
var xml2js = require("xml2js");

var csv = process.argv[2];
var download = new Download({ extract: true })
	.get("https://github.com/tomgreenfield/AdaptHelper/archive/master.zip");
var parser = new xml2js.Parser();
var snippets = {};

var outputJSON = {
	contentObjects: [],
	articles: [],
	blocks: [],
	components: []
};
var replacements = {
	contentObjectID: "",
	parentID: "",
	type: "",
	articleID: "",
	blockID: "",
	componentID: "",
	layout: ""
};
var elementTypes = _.keys(outputJSON);
var placeholders = _.keys(replacements);

function csveat() {
	if (!csv) return console.log("Error: no CSV specified.");

	fs.readFile(csv, { encoding: "utf8" }, function(err, data) {
		if (err) return console.log(err.toString());

		csv = data;
		downloadSnippets();
	});
}

function downloadSnippets() {
	console.log("Downloading snippets...");
	download.run(function(err, files) {
		if (err) return console.log(err.toString());

		async.each(files, parseSnippet, parseCSV);
	});
}

function parseSnippet(file, done) {
	if (path.extname(file.path) !== ".sublime-snippet") return done();

	parser.parseString(file.contents, function(err, output) {
		snippets[output.snippet.tabTrigger] = output.snippet.content[0];
		parser.reset();
		done();
	});
}

function parseCSV() {
	parse(csv, function(err, output) {
		if (!err) console.log("CSVeating...");

		var width = output[0].length; 
		var height = output.length;

		for (var i = 1; i < height; i++) {
			// fill in blanks

			for (var j = 0; j < width; j++) {
				if (output[i][j]) continue;

				var hasIdenticalParents = output[i][j - 1] === output[i - 1][j - 1];

				if (hasIdenticalParents) output[i][j] = output[i - 1][j];
			}

			replacements.articleID = output[i][width - 4];
			replacements.blockID = output[i][width - 3];
			replacements.componentID = output[i][width - 2];

			// content objects

			for (var j = 1, k = width - 4; j < k; j++) {
				replacements.contentObjectID = output[i][j];

				if (!replacements.contentObjectID || existInJSON("contentObject")) continue;

				replacements.parentID = output[i][j - 1];
				replacements.type = !output[i][j + 1] || j === width - 5 ? "page" : "menu";

				outputJSON.contentObjects.push(populateSnippet(snippets.contentobject));
			}

			// articles

			if (!existInJSON("article")) {
				if (!replacements.contentObjectID) {
					for (j = 6; j < width; j++) {
						if (output[i][width - j]) {
							replacements.contentObjectID = output[i][width - j];
							break;
						}
					}
				}

				outputJSON.articles.push(populateSnippet(snippets.article));
			}

			// blocks

			if (!existInJSON("block")) {
				outputJSON.blocks.push(populateSnippet(snippets.block));
			}

			// components

			var prevBlockID = output[i - 1] ? output[i - 1][width - 3] : "";
			var nextBlockID = output[i + 1] ? output[i + 1][width - 3] : "";
			var componentType = output[i][width - 1];

			if (!snippets[componentType]) {
				console.log(replacements.componentID + " skipped; cannot find '" +
					componentType + "' snippet.");
				continue;
			}

			if (nextBlockID === replacements.blockID) replacements.layout = "left";
			else if (prevBlockID === replacements.blockID) replacements.layout = "right";
			else replacements.layout = "full";

			outputJSON.components.push(populateSnippet(snippets[componentType]));
		}

		writeFiles();
	});
}


function existInJSON(elementType) {
	return _.find(outputJSON[elementType + "s"], {
		_id: replacements[elementType + "ID"]
	});
}

function populateSnippet(snippet) {
	for (var i = 0, j = placeholders.length; i < j; i++) {
		var regexp = new RegExp("([^_])" + placeholders[i], "g");

		snippet = snippet.replace(regexp, "$1" + replacements[placeholders[i]]);
	}
	return JSON.parse(snippet);
}

function writeFiles() {
	async.each(elementTypes, function(elementType, done) {
		var prettyOutput = JSON.stringify(outputJSON[elementType], null, "\t");

		console.log("Writing " + outputJSON[elementType].length + " " + elementType + "...");
		fs.writeFile(elementType + ".json", prettyOutput, done);
	}, function() { console.log("Finished."); });
}

module.exports = {
	csveat: function() { csveat(); }
};