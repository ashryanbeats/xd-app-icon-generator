const {Artboard, BooleanGroup, Color, Ellipse, GraphicNode, Group, Line, LinkedGraphic, Path, Rectangle, RepeatGrid, RootNode, SceneNode, SymbolInstance, Text} = require("scenegraph");

const application = require("application");
const localFileSystem = require("uxp").storage.localFileSystem;
const commands = require("commands");

const replaceFolder = require("./replaceFolder");
const usage = require("./usage");

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - REFERENCES
// - - - - - - - - - - - - - - - - - - - - APPLICATION
let xdVersion = application.version;
let xdRequiredMajorVersion = 14;

// - - - - - - - - - - - - - - - - - - - - UI
var pluginFolder;
var dataFolder;
var settingsFile;
var settingsA = [];
var jsonSettings;

var dialogWidth = 620;

var pluginTitle = "App Icon Generator";

var labelFontSizeMini = 10;
var labelFontSize = 11;
var textFontSize = 12;

var activeColor = "#2680EB";
var inactiveColor = "#A0A0A0";
var activeBkgColor = "#E2E2E2";
var lightBkgColor = "#FBFBFB";
var labelQuietColor = "#999";
var separatorColor = "#E4E4E4";
var errorColor = "#FF0000";

var exportFolder;
var projectFolder;
var existingProjectFolder;
var projectName;

var renditionsA;

var mainSelection;
var selectedObject;
var selectedObjectBounds;
var selectedObjectWidth;
var selectedObjectHeight;
var multipleSelection;

var popup;
var popupSV;
var popupOpen = false;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - MAIN DIALOG
var dialog = document.createElement("dialog");
dialog.style.width = dialogWidth;
// dialog.style.height = 440;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - MAIN CONTAINER
// main container
var container = document.createElement("form");
// container.style.width = 620;
container.style.background = "#F7F7F7";
// handle "enter" key
container.onsubmit = (e) => validateDialog(e);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - MAIN HEADER
var mainHeader = document.createElement("div");
mainHeader.style.display = "flex";
mainHeader.style.width = 300;
mainHeader.style.flexDirection = "row";
mainHeader.style.alignItems = "center";
mainHeader.style.justifyContent = "space-between";
container.appendChild(mainHeader);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - MAIN TITLE
var mainTitle = document.createElement("h1");
mainTitle.style.marginBottom = 10;
mainTitle.textContent = pluginTitle;
mainHeader.appendChild(mainTitle);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - USAGE BUTTON
var usageB = createButton("", "primary", true);
// usageB.style.marginLeft = 80;
usageB.onclick = (e) => openPopup("usage", "Usage", false);
usageB.style.title = "How to use " + pluginTitle;
mainHeader.appendChild(usageB);

var usageIcon = document.createElement("img");
usageIcon.src = "img/usage.png";
usageB.appendChild(usageIcon);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - MAIN SEPARATOR
var mainSeparator = document.createElement("hr");
mainSeparator.style.marginBottom = 30;
mainSeparator.style.width = mainHeader.style.width;
mainSeparator.style.height = 1;
mainSeparator.style.background = separatorColor;
container.appendChild(mainSeparator);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - EXPORT FOLDER
var exportFolderGroup = document.createElement("div");
exportFolderGroup.style.marginBottom = 20;
container.appendChild(exportFolderGroup);

var exportFolderL = createLabel("Export Folder");
exportFolderL.style.marginLeft = 6;
exportFolderGroup.appendChild(exportFolderL);

var exportFolderRow = document.createElement("div");
exportFolderRow.style.display = "flex";
exportFolderRow.style.flexDirection = "row";
exportFolderRow.style.alignItems = "center";
exportFolderGroup.appendChild(exportFolderRow);

var exportFolderTF = createTextInput("", null, false);
exportFolderTF.style.width = 260;
exportFolderTF.setAttribute("readonly", true);
exportFolderTF.style.background = "#FBFBFB";
exportFolderRow.appendChild(exportFolderTF);

// var exportFolderB = createButton("", "action", true);
var exportFolderB = createButton("", "primary", true);
exportFolderB.style.paddingLeft = 2;
exportFolderB.style.paddingRight = 2;
exportFolderB.onclick = (e) => selectExportFolder();
exportFolderB.style.title = "Choose an export folder";
exportFolderRow.appendChild(exportFolderB);

var browseIcon = document.createElement("img");
browseIcon.src = "img/browse.png";
exportFolderB.appendChild(browseIcon);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - PROJECT NAME
var appNameGroup = document.createElement("div");
appNameGroup.style.marginBottom = 20;
container.appendChild(appNameGroup);

var appNameL = createLabel("Project Name");
appNameL.style.marginLeft = 6;
appNameGroup.appendChild(appNameL);
var appNameTF = createTextInput("", "", false);
appNameTF.style.width = 300;
appNameTF.style.background = "#FBFBFB";
appNameGroup.appendChild(appNameTF);


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - FILE NAME
var fileNameGroup = document.createElement("div");
fileNameGroup.style.marginBottom = 20;
container.appendChild(fileNameGroup);

var fileNameL = createLabel("File Name (optional)");
fileNameL.style.marginLeft = 6;
fileNameGroup.appendChild(fileNameL);
var fileNameTF = createTextInput("", "", false);
fileNameTF.style.width = 300;
fileNameTF.style.background = "#FBFBFB";
fileNameTF.value = "icon_";
fileNameTF.oninput = (e) => changeFileNames(fileNameTF.value);
fileNameGroup.appendChild(fileNameTF);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - SCROLL VIEW
var renditionsSV = document.createElement("div");
renditionsSV.style.position = "absolute";
renditionsSV.style.top = 0;
renditionsSV.style.left = 380;
renditionsSV.style.padding = "30 10 30 20";
renditionsSV.style.width = 240;
renditionsSV.style.height = 440;
renditionsSV.style.background = "#FFF";
renditionsSV.style.overflowY = "auto";
renditionsSV.style.overflowX = "hidden";
container.appendChild(renditionsSV);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - WARNING
var warningMessage = document.createElement("div");
warningMessage.style.marginLeft = 6;
warningMessage.style.width = 300;
warningMessage.style.color = errorColor;
warningMessage.style.textAlign = "center";
warningMessage.style.visibility = "hidden";
warningMessage.style.fontSize = labelFontSize;
warningMessage.textContent = "Warning Message";
container.appendChild(warningMessage);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - FOOTER
var footer = document.createElement("footer");
footer.style.marginTop = 30;
footer.style.width = 310;
container.appendChild(footer);

var cancelB = createButton("Cancel");
cancelB.onclick = (e) => cancelDialog();
footer.appendChild(cancelB);

var okB = createButton("Export", "cta");
okB.setAttribute("type", "submit");
okB.onclick = (e) => validateDialog(e);
footer.appendChild(okB);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - MAIN FUNCTION
async function init(selection)
{
	try
	{
		let v = await checkXdVersion();
		if(!v)
		{
			return;
		}
	}
	catch(_error)
	{
		console.log(_error);
	}

	mainSelection = selection;
	
	try
	{
		let s = await checkSelection(selection);
		if(s)
		{
			// get db
			try
			{
				await getDB();
			}
			catch(_error)
			{
				console.log(_error);
			}

			// set default settings
			try
			{
				await setDefaultSettings();
			}
			catch(_error)
			{
				console.log(_error);
			}
			
			// get settings
			try
			{
				await getSettings();
			}
			catch(_error)
			{
				console.log(_error);
			}
			
			dialog.appendChild(container);
			document.body.appendChild(dialog);

			setRenditionsList();
			
			try
			{
				const d = await dialog.showModal();
				
				if(d === "OK")
				{
					// exportAppIconOK();
					try
					{
						let e = await exportAppIconOK();
						if (e === "OK")
						{
							// console.log("* * * RENDITIONS COMPLETE * * *");
							
							// save settings
							for(let i = 0; i < renditionsA.length; i++)
							{
								settingsA["platforms"][renditionsA[i]["platform"]] = renditionsA[i]["checkBox"].checked;
							}

							try
							{
								await saveSettings();
							}
							catch(_error)
							{
								console.log(_error);
							}

							try
							{
								await openAlertDialog(pluginTitle, "All icons have been exported successfully.");

								if(multipleSelection == true)
								{
									commands.ungroup();
									multipleSelection = false;
								}
							}
							catch(_error)
							{
								console.log(_error);
							}						
						}
					}
					catch(_error)
					{
						console.log(_error);
					}
				}
				if(d)
				{
					// console.log("ESC pressed");

					if(popupOpen)
					{
						closePopup("");
						// cancelPopup();
						// popup.remove();
					}
					
					// save settings
					for(let i = 0; i < renditionsA.length; i++)
					{
						settingsA["platforms"][renditionsA[i]["platform"]] = renditionsA[i]["checkBox"].checked;
					}
					try
					{
						await saveSettings();
					}
					catch(_error)
					{
						console.log(_error);
					}

					resetValues();
				}
			}
			catch(_error)
			{
				console.log(_error);
			}
		}
	}
	catch(_error)
	{
		console.log(_error);
	}
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - XD VERSION CHECK
async function checkXdVersion()
{
	// console.log("checkXdVersion()");
	
	/* console.log("XD version: " + xdVersion);
	console.log("XD required version: " + xdRequiredMajorVersion); */

	let xdVersionItemsA = xdVersion.split(".");
	// console.log(xdVersionItemsA);
	let xdMajorVersion = parseInt(xdVersionItemsA[0]);
	// console.log(xdVersion);
	if(xdMajorVersion < xdRequiredMajorVersion)
	{
		try
		{
			await openAlertDialog(pluginTitle, pluginTitle + " requires XD " + xdRequiredMajorVersion + ". Please update XD.");
			// return;
		}
		catch(_error)
		{
			console.log(_error);
		}
		return false;
	}

	return true;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - SELECTION CHECK
async function checkSelection(_selection)
{
	if(mainSelection.items.length == 0)
	{
		try
		{
			await openAlertDialog(pluginTitle, "Please select a square Artboard, object or group.");
		}
		catch(_error)
		{
			console.log(_error);
		}
		return false;
	}

	// detect multiple selection
	if(mainSelection.items.length > 1)
	{
		commands.group();
		multipleSelection = true;
	}

	selectedObject = mainSelection.items[0];
	selectedObjectBounds = selectedObject.boundsInParent;
	selectedObjectWidth = selectedObjectBounds.width;
	selectedObjectHeight = selectedObjectBounds.height;

	if(selectedObjectWidth != selectedObjectHeight)
	{
		try
		{
			await openAlertDialog(pluginTitle, "The selected object is not a perfect square.");
			
			if(multipleSelection == true)
			{
				commands.ungroup();
				multipleSelection = false;
			}
			return false;
		}
		catch(_error)
		{
			console.log(_error);
		}
	}
	
	return true;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ALERT DIALOG
async function openAlertDialog(_title, _message)
{
	let alertDialog = document.createElement("dialog");
	
	// CONTAINER
	let alertContainer = document.createElement("form");
	alertContainer.style.width = 300;
	alertContainer.onsubmit = (e) => alertDialog.close();
	alertDialog.appendChild(alertContainer);
	
	// TITLE
	let alertTitle = document.createElement("h1");
	alertTitle.textContent = _title;
	alertTitle.style.marginBottom = 10;
	alertContainer.appendChild(alertTitle);
	
	// SEPARATOR
	let separator = document.createElement("hr");
	separator.style.marginBottom = 30;
	separator.style.width = alertTitle.style.width;
	separator.style.height = 1;
	separator.style.background = separatorColor;
	alertContainer.appendChild(separator);
	
	// MESSAGE
	let alertMessage = document.createElement("div");
	alertMessage.style.padding = "0 6";
	alertMessage.style.fontSize = textFontSize;
	alertMessage.textContent = _message;
	alertContainer.appendChild(alertMessage);
	
	// FOOTER
	let alertFooter = document.createElement("footer");
	alertFooter.style.marginTop = 30;
	alertContainer.appendChild(alertFooter);
	
	let alertOkB = createButton("OK", "cta");
	alertOkB.setAttribute("type", "submit");
	alertOkB.onclick = (e) => alertDialog.close();
	alertFooter.appendChild(alertOkB);
	
	document.body.appendChild(alertDialog);
	
	try
	{
		await alertDialog.showModal();
	}
	catch(_error)
	{
		console.log(_error);
	}
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - DIALOG VALIDATION 
async function validateDialog(_e)
// function validateDialog(e)
{
	// console.log("validateDialog()");
	
	_e.preventDefault();
	
	if(!checkExportFolder())
	{
		return;
	}
	
	if(!checkAppName())
	{
		return;
	}
	
	if(!checkPlatform())
	{
		return;
	}

	try
	{
		let exportFolderExists = await checkExistingExportFolder();
		if(exportFolderExists == true)
		{
			return;
		}
	}
	catch(_error)
	{
		console.log(_error);
	}

	try
	{
		let projectFolderExists = await checkExistingProjectFolder();
		if(projectFolderExists == true)
		{
			return;
		}
	}
	catch(_error)
	{
		console.log(_error);
	}
	
	dialog.close("OK");
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - DIALOG DISMISSAL
function cancelDialog()
{
	// save settings
	for(let i = 0; i < renditionsA.length; i++)
	{
		settingsA["platforms"][renditionsA[i]["platform"]] = renditionsA[i]["checkBox"].checked;
	}
	
	saveSettings();
	
	resetValues();
	dialog.close();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - WARNING
function displayWarning(_message)
{
	warningMessage.textContent = _message;
	warningMessage.style.visibility = "visible";
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - POPUP
function openPopup(_popupType, _title, _allowCancel)
{
	// console.log("openPopup()");

	popup = document.createElement("div");
	popup.style.position = "absolute";
	popup.style.top = 0;
	popup.style.left = 0;
	popup.style.width = dialogWidth;
	popup.style.height = 1000;
	container.appendChild(popup);
	
	let popupBkg = document.createElement("div");
	popupBkg.style.width = popup.style.width;
	popupBkg.style.height = popup.style.height;
	popupBkg.style.background = "#000000";
	popupBkg.style.opacity = .8;
	// popupBkg.onclick = (e) => popup.remove();
	popup.appendChild(popupBkg);

	let popupContainer = document.createElement("div");
	popupContainer.style.position = "absolute";
	popupContainer.style.padding = "20 0 20 20";
	popupContainer.style.width = 260;
	popupContainer.style.left = (popup.style.width.value / 2) - (popupContainer.style.width.value / 2);
	// popupContainer.style.borderRadius = 4; // "0 0 4 4";
	popupContainer.style.background = "#FFFFFF";
	popup.appendChild(popupContainer);

	let popupTitleL = createLabel(_title);
	popupTitleL.style.marginBottom = 20;
	popupTitleL.style.fontSize = 14;
	popupTitleL.style.fontWeight = "bold";
	popupTitleL.style.color = "#2C2C2C";
	popupContainer.appendChild(popupTitleL);

	let separatorTop = document.createElement("div");
	separatorTop.style.width = 220;
	separatorTop.style.height = 1;
	separatorTop.style.background = separatorColor;
	popupContainer.appendChild(separatorTop);
	
	popupSV = document.createElement("div");
	popupSV.style.padding = "20 0 20 0";
	popupSV.style.maxHeight = 150;
	popupSV.style.overflowX = "hidden";
	popupSV.style.overflowY = "auto";
	popupContainer.appendChild(popupSV);

	switch(_popupType)
	{
		case "replaceFolder":
			let rf = replaceFolder(popupSV, projectName);
			break;
			
		case "usage":
			let u = usage(popupSV);
			break;
	}

	let separatorBottom = document.createElement("div");
	separatorBottom.style.margin = "0 0 20 0";
	separatorBottom.style.width = 220;
	separatorBottom.style.height = 1;
	separatorBottom.style.background = separatorColor;
	popupContainer.appendChild(separatorBottom);
	
	let popupFooter = document.createElement("div");
	popupFooter.style.display = "flex"; 
	popupFooter.style.flexDirection = "row";
	popupFooter.style.justifyContent = "flex-end";
	popupFooter.style.marginTop = 20;
	popupContainer.appendChild(popupFooter);
	
	if(_allowCancel)
	{
		let popupCancelB = createButton("Cancel");
		popupCancelB.onclick = (e) => closePopup("");
		popupFooter.appendChild(popupCancelB);
	}

	if(_popupType == "replaceFolder")
	{
		let replaceFolderB = createButton("Replace", "warning", false);
		replaceFolderB.style.marginRight = 14;
		replaceFolderB.onclick = (e) => replaceExistingAssets();
		popupFooter.appendChild(replaceFolderB);
	}
	else
	{
		let popupOkB = createButton("OK", "primary", false);
		popupOkB.style.marginRight = 14;
		popupOkB.onclick = (e) => closePopup(_popupType);
		popupFooter.appendChild(popupOkB);
	}

	popupOpen = true;
}

function closePopup(_popupType)
{
	/* switch(_popupType)
	{
		case "_popupType":
			// actions
			break;
	} */
	
	popup.remove();
	popupOpen = false;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - DATA CHECK
function checkExportFolder()
{
	// console.log("checkExportFolder()");
	let exportFolderString = exportFolderTF.value;
	
	if(exportFolderString == "")
	{
		displayWarning("Choose an export folder for exporting assets");
		return false;
	}
	else
	{
		return true;
	}
}

function checkAppName()
{
	// console.log("checkAppName()");
	projectName = appNameTF.value;
	// console.log(projectName);
	
	if(projectName == "")
	{
		displayWarning("Insert the project name");
		return false;
	}
	else
	{
		return true;
	}
}

function checkPlatform()
{
	// console.log("checkPlatform()");
	let platformUncheckedA = [];
	
	for(let i = 0; i < renditionsA.length; i++)
	{
		let platformCB = renditionsA[i]["checkBox"];
		if(platformCB.checked == false)
		{
			platformUncheckedA.push(platformCB);
			// return false;
		}
	}
	
	if(platformUncheckedA.length == renditionsA.length)
	{
		displayWarning("Select at least one platform");
		return false;
	}
	else
	{
		return true;
	}
}

async function checkExistingExportFolder()
{
	// console.log("checkExistingExportFolder()");
	try
	{
		// try to get entries from export folder to check if it exists or has been deleted
		await exportFolder.getEntries();
	}
	catch(_error)
	{
		// console.log("CATCH ERROR! - EXPORT FOLDER HAS BEEN DELETED");
		// keep commented - when export folder doesn't exist it displays { [Error: no such file or directory] code: -2 }
		// console.log(_error);
		
		displayWarning("The selected export folder doesn't exist");
		return true;
	}
}

async function checkExistingProjectFolder()
{
	// console.log("checkExistingProjectFolder()");
	try
	{
		// console.log("getEntry()");
		existingProjectFolder = await exportFolder.getEntry("./" + projectName);
		if(existingProjectFolder)
		{
			await openPopup("replaceFolder", "Replace existing folder?", true);
			return true;
		}
		else
		{
			return false;
		}
	}
	catch(_error)
	{
		// keep commented - when project folder doesn't exist it displays [Error: getEntry: File with given name not found]
		// console.log(_error);
	}
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - HELPERS
function createButton(_text, _variant, _quiet)
{
    let newButton = document.createElement("button");
    newButton.textContent = _text;
    newButton.setAttribute("uxp-variant", _variant);
	newButton.setAttribute("uxp-quiet", _quiet);
    return newButton;
}

function createTextInput(_placeholder, _width, _quiet)
{
    let newTextInput = document.createElement("input");
	newTextInput.style.width = _width;
	newTextInput.setAttribute("placeholder", _placeholder);
	newTextInput.setAttribute("uxp-quiet", _quiet);
    return newTextInput;
}

function createCheckBox(_placeholder, _width, _checked)
{
    let newCheckBox = document.createElement("label");
	newCheckBox.style.display = "flex";
	newCheckBox.style.flexDirection = "row";
	newCheckBox.style.alignItems = "center";
	
	let checkBox = document.createElement("input");
    checkBox.type = "checkbox";
	if (_checked)
	{
        checkBox.checked = true;
    }
	newCheckBox.appendChild(checkBox);
	
	let checkBoxL = createLabel(_placeholder);
	checkBoxL.style.marginLeft = 2;
	checkBoxL.style.width = _width;
    newCheckBox.appendChild(checkBoxL);
	
    return newCheckBox;
}

function createLabel(_text)
{
	let newLabel = document.createElement("span");
	newLabel.style.textAlign = "left";
	newLabel.style.fontSize = labelFontSize;
	newLabel.textContent = _text;
	return newLabel;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - UTILITIES
async function getDB()
{
	// console.log("getDB()");
	try
	{
		// console.log("\tget plugin folder");
		pluginFolder = await localFileSystem.getPluginFolder();
		try
		{
			// console.log("\tget renditions file");
			let renditionsFile = await pluginFolder.getEntry("renditionsDB.json");
			try
			{
				// console.log("\tread renditions file");
				let jsonRenditions = await renditionsFile.read();
				renditionsA = JSON.parse(jsonRenditions);
				// console.log(renditionsA);						
			}
			catch(_error)
			{
				console.log(_error);
			}
		}
		catch(_error)
		{
			console.log(_error);
		}
	}
	catch(_error)
	{
		console.log(_error);
	}
}

async function setDefaultSettings()
{
	// console.log("setDefaultSettings()");
	try
	{
		// console.log("\tget data folder");
		dataFolder = await localFileSystem.getDataFolder();
		
		try
		{
			// console.log("\tget settings file");
			settingsFile = await dataFolder.getEntry("settings.json");
		}
		catch(_error)
		{
			// console.log(_error);
			// console.log("\t\tsettings file not found");
			try
			{
				// console.log("\t\tcreate settings.json");
				settingsFile = await dataFolder.createFile("settings.json", {overwrite: true});

				try
				{
					let settingsObj = {};
					let platformObj = {};

					for(let i = 0; i < renditionsA.length; i++)
					{
						// console.log("renditionsA[" + i + "]: " + renditionsA[i]["platform"]);
						platformObj[renditionsA[i]["platform"]] = true;
					}
					// console.log("platformObj");
					// console.log(platformObj);

					settingsObj["platforms"] = platformObj;
					// console.log("settingsObj");
					// console.log(settingsObj);

					// set default settings
					// await settingsFile.write("{}", {append: false});
					await settingsFile.write(JSON.stringify(settingsObj), {append: false});
				}
				catch(_error)
				{
					console.log(_error);
				}
			}
			catch(_error)
			{
				console.log(_error);
			}
		}
	}
	catch(_error)
	{
		console.log(_error);
	}
}

async function getSettings()
{
	// console.log("getSettings()");
	let jsonSettings;
	try
	{
		// console.log("read settings file");
		jsonSettings = await settingsFile.read();
	}
	catch (_error)
	{
		// console.log(_error);
	}
	// console.log("build settings array");
	// console.log("jsonSettings: " + jsonSettings);
	settingsA = JSON.parse(jsonSettings);
	// console.log("settingsA:");
	// console.log(settingsA);	
}

async function saveSettings()
{
	// console.log("saveSettings()");
	// console.log(JSON.stringify(settingsA));
	try
	{
		// console.log("\twrite settings");
		await settingsFile.write(JSON.stringify(settingsA), {append: false});
	}
	catch (_error)
	{
		
	}	
}

function setRenditionsList()
{
	// console.log("setRenditionsList()");
	
	renditionsSV.textContent = "";
	
	for(let i = 0; i < renditionsA.length; i++)
	{
		let platformHeader = document.createElement("div");
		platformHeader.style.display = "flex";
		platformHeader.style.width = 200;
		platformHeader.style.flexDirection = "row";
		platformHeader.style.alignItems = "center";
		platformHeader.style.justifyContent = "space-between";
		platformHeader.style.padding = "6 0";
		
		// platformHeader.style.background = "#EAEAEA";
		renditionsSV.appendChild(platformHeader);
		
		// console.log("settings iOS: " + settingsA["platforms"]["iOS"]);
		// console.log("settings " + renditionsA[i]["platform"] + ": " + settingsA["platforms"][renditionsA[i]["platform"]]);
		
		let platformChecked = settingsA["platforms"][renditionsA[i]["platform"]];
		// let checkBox = createCheckBox(renditionsA[i]["platform"], 136, true);
		let checkBox = createCheckBox(renditionsA[i]["platform"], "", platformChecked);
		// checkBox.style.background = "#CCCCCC";
		renditionsA[i]["checkBox"] = checkBox.firstChild;
		renditionsA[i]["checkBox"].onchange = (e) => dimList(renditionsA[i]["list"]);
		platformHeader.appendChild(checkBox);
		
		let arrowB = document.createElement("div");
		arrowB.style.padding = 6;
		arrowB.onclick = (e) => showList(renditionsA[i]["list"], renditionsA[i]["arrow"]);
		platformHeader.appendChild(arrowB);
		
		let arrow = document.createElement("img");
		renditionsA[i]["arrow"] = arrow;
		arrow.src = "img/arrow_down.png";
		arrowB.appendChild(arrow);
		
		let platformList = document.createElement("div");
		renditionsA[i]["list"] = platformList;
		platformList.style.display = "none";

		if(platformChecked == false)
		{
			dimList(platformList);
		}

		renditionsSV.appendChild(platformList);
		
		for(let j = 0; j < renditionsA[i]["renditions"].length; j++)
		{
			// console.log(j);
			let rendition = document.createElement("label");
			rendition.style.margin = "0 22";
			rendition.style.padding = "6 0";
			rendition.textContent = fileNameTF.value + renditionsA[i]["renditions"][j] + ".png";
			// rendition.textContent = fileNameTF.value + renditionsA[i]["renditions"][j][0] + ".png";
			// rendition.textContent = "icon_" + renditionsA[i]["renditions"][j][0] + ".png";
			rendition.style.fontSize = 11;
			platformList.appendChild(rendition);
		}
	}
	// console.log(renditionsA);
}

function dimList(_list)
{
	if (_list.style.opacity == 1)
	{
		_list.style.opacity = .4;
	}
	else
	{
		_list.style.opacity = 1;
	}
}

function showList(_list, _arrow)
{
	if (_list.style.display == "block")
	{
		_arrow.src = "img/arrow_down.png";
		_list.style.display = "none";
	}
	else
	{
		_arrow.src = "img/minus.png";
		_list.style.display = "block";
	}
}

async function selectExportFolder()
{
	try
	{
		exportFolder = await localFileSystem.getFolder();
		if (exportFolder)
		{
			// exportFolderTF.value = exportFolder.nativePath;
			// console.log("exportFolder: " + exportFolder);
			exportFolderTF.value = exportFolder.name;
		}
	}
	catch(_error)
	{
		console.log(_error);
	}
}

function resetValues()
{
	// console.log("resetValues()");
	warningMessage.style.visibility = "hidden";
	if(multipleSelection == true)
	{
		commands.ungroup();
		multipleSelection = false;
	}
}

function changeFileNames(_customFileNamePrefix)
{
	// console.log(_customFileNamePrefix);
	for(let i = 0; i < renditionsA.length; i++)
	{
		for(let j = 0; j < renditionsA[i]["renditions"].length; j++)
		{
			let fileNameSuffix = renditionsA[i]["renditions"][j][0] + ".png";
			renditionsA[i]["list"].childNodes[j].textContent = _customFileNamePrefix + fileNameSuffix;
		}
	}
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - OK ACTIONS
async function exportAppIconOK()
{
	// console.log("exportAppIconOK()");
	
	warningMessage.style.visibility = "hidden";
	
	try
	{
		// create project folder
		// console.log("create project folder: " + projectName);
		projectFolder = await exportFolder.createFolder(projectName, {overwrite: true});
		if(projectFolder)
		{
			for(let i = 0; i < renditionsA.length; i ++)
			{
				if(renditionsA[i]["checkBox"].checked)
				{
					try
					{
						// create platform folder
						// console.log("\tcreate platform folder: " + renditionsA[i]["platform"]);
						let platformFolder = await projectFolder.createFolder(renditionsA[i]["platform"], {overwrite: true});
						if (platformFolder)
						{
							// exportRenditions(renditionsA[i]["renditions"], platformFolder);
							try
							{
								let r = await exportRenditions(renditionsA[i]["renditions"], platformFolder);
								// console.log("\t" + renditionsA[i]["platform"]);
							}
							catch(_error)
							{
								console.log(_error);
							}
						}
					}
					catch(_error)
					{
						console.log(_error);
					}
				}
			}
		}
	}
	catch(_error)
	{
		console.log(_error);
	}
	
	return "OK";
}

async function exportRenditions(_renditionsA, _platformFolder)
{	
	// console.log("\texportRenditions()");
		
	let renditions = [];
		
	for(let i = 0; i < _renditionsA.length; i++)
	{
		// console.log(_renditionsA[i]);
		// let fileName = "icon_" + _renditionsA[i] + ".png";
		let fileName = fileNameTF.value + _renditionsA[i] + ".png";
		try
		{
			let file = await _platformFolder.createFile(fileName, {overwrite: true});
			
			if(file)
			{
				// let scaleFactor = _renditionsA[i]/selectedObjectTempWidth;
				let scaleFactor = _renditionsA[i]/selectedObjectWidth;
				
				// console.log("target size: " + _sizesA[i] + "\nartwork size: " + selectedObjectWidth + "\nscale factor: " + scaleFactor + "\n\n");
				
				let rendition = {node: selectedObject, outputFile: file, type: application.RenditionType.PNG, scale: scaleFactor};
				renditions.push(rendition);
			}
		}
		catch(_error)
		{
			console.log(_error);
		}
	}
	
	try
	{
		await application.createRenditions(renditions);
	}
	catch(_error)
	{
		console.log(_error);
	}
}

async function replaceExistingAssets()
{
	// console.log("replaceExistingAssets()");

	try
	{
		let entries = await existingProjectFolder.getEntries();
		// entries.map(entry => console.log(entry.name));
		if(entries.length > 0)
		{
			for(let i = 0; i < entries.length; i++)
			{
				let firstChar = entries[i].name.charAt(0);
				// manage visible entries only
				if(firstChar != ".")
				{
					try
					{
						// console.log(entries[i].name);
						let files = await entries[i].getEntries();
						if(files.length > 0)
						{
							// delete files in each platform folder
							for(let j = 0; j < files.length; j++)
							{
								try
								{
									await files[j].delete();
								}
								catch(_error)
								{
									console.log(_error);
								}
							}
						}
					}
					catch(_error)
					{
						console.log(_error);
					}

					try
					{
						// delete each platform folder
						// console.log("remove folder: " + entries[i].name);
						await entries[i].delete();
					}
					catch(_error)
					{
						console.log(_error);
					}
				}
			}
		}

		// delete any other kind of entry, including invisibles
		entries.map(entry => entry.delete());
		
		// delete project folder (now empty)
		try
		{
			await existingProjectFolder.delete();
		}
		catch(_error)
		{
			console.log(_error);
		}

		closePopup("");
		
		// close main dialog
		dialog.close("OK");
	}
	catch(_error)
	{
		console.log(_error);
	}
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - EXPORT
module.exports = {
	commands: {
		init
	}
};










