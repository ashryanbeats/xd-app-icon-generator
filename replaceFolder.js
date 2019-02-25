// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - REFERENCES
var titleSize = 14;
var textFontSize = 12;
var labelFontSize = 11;
var labelFontSizeMini = 10;

var titleColor = "#2C2C2C";
var activeColor = "#2680EB";
var inactiveColor = "#A0A0A0";
var activeBkgColor = "#E2E2E2";
var lightBkgColor = "#FBFBFB";
var labelQuietColor = "#999999";
var separatorColor = "#E4E4E4";
var errorColor = "#FF0000";

var text = "";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - MAIN FUNCTIONS
function replaceFolder(_popupSV, _projectName)
{
	// console.log("replaceFolder()");

	text = "\"" + _projectName + "\" folder already exists. Replacing it will overwrite its current contents.";
	
	let textL = createLabel(text);
	textL.style.marginRight = 10;
	textL.style.lineHeight = 15;
	_popupSV.appendChild(textL);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - UTILITIES

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - HELPERS
function createButton(_text, _variant, _quiet)
{
    let newButton = document.createElement("button");
    newButton.textContent = _text;
    newButton.setAttribute("uxp-variant", _variant);
	newButton.setAttribute("uxp-quiet", _quiet);
    return newButton;
}

function createLabel(_text)
{
	let newLabel = document.createElement("span");
	newLabel.style.textAlign = "left";
	newLabel.style.fontSize = labelFontSize;
	newLabel.textContent = _text;
	return newLabel;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - EXPORT
module.exports = replaceFolder;