var {Artboard, BooleanGroup, Color, Ellipse, GraphicNode, Group, Line, LinkedGraphic, Path, Rectangle, RepeatGrid, RootNode, SceneNode, SymbolInstance, Text} = require("scenegraph");

const APP = require("application");
const LS = require("uxp").storage;
const LFS = require("uxp").storage.localFileSystem;
const commands = require("commands");

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - REFERENCES
var pluginFolder;
var dataFolder;
var settingsFile;
var settingsA = [];
var jsonSettings;

var pluginTitle = "App Icon Generator";

var separatorColor = "#E4E4E4";

var dialogWidth = 620;

var exportFolder;
var appFolder;
var existingAppFolder;

var appName;

var renditionsA;

var mainSelection;
var selectedObject;
var selectedObjectBounds;
var selectedObjectWidth;
var selectedObjectHeight;
var multipleSelection;

var replaceConfirmBox;
var usageBox;

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
usageB.onclick = (e) => openUsage("Usage", "App Icon Generator exports all app icon renditions according to iOS, Android, UWP and XD requirements.\n\n• select a square Artboard, object or group;\n• make sure the selected element is 100x100 px;\n• Plugins > App Icon Generator;\n• choose an Export Folder for saving assets;\n• insert an App Name;\n• insert a File Name (expand the Platform lists to see a preview of file names);\n• select at least one Platform.");
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

// var exportFolderTF = createTextInput("Select Export Folder", null, false);
var exportFolderTF = createTextInput("", null, false);
exportFolderTF.style.width = 260;
exportFolderTF.setAttribute("readonly", true);
exportFolderTF.style.background = "#FBFBFB";
exportFolderRow.appendChild(exportFolderTF);

var exportFolderB = createButton("", "action", true);
exportFolderB.style.paddingLeft = 2;
exportFolderB.style.paddingRight = 2;
var browseIcon = document.createElement("img");
browseIcon.src = "img/browse.png";
exportFolderB.appendChild(browseIcon);
exportFolderB.onclick = (e) => selectExportFolder();
exportFolderRow.appendChild(exportFolderB);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - APP NAME
var appNameGroup = document.createElement("div");
appNameGroup.style.marginBottom = 20;
container.appendChild(appNameGroup);

var appNameL = createLabel("App Name");
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
// renditionsSV.style.margin = scrollViewSeparator.style.margin;
renditionsSV.style.position = "absolute";
renditionsSV.style.top = 0;
renditionsSV.style.left = 380;
renditionsSV.style.padding = "30 10 30 20";
// renditionsSV.style.width = 380;
renditionsSV.style.width = 240;
renditionsSV.style.height = 440;
// renditionsSV.style.height = 424;
renditionsSV.style.background = "#FFF";
renditionsSV.style.overflowY = "auto";
renditionsSV.style.overflowX = "hidden";
// dataSV.style.overflow = "hidden";
container.appendChild(renditionsSV);

/*
var footerBkg = document.createElement("div");
footerBkg.style.position = "absolute";
footerBkg.style.bottom = 0;
footerBkg.style.right = 0;
footerBkg.style.width = renditionsSV.style.width;
footerBkg.style.height = 100;
footerBkg.style.background = "#F7F7F7";
// footerBkg.style.background = "#CCCCCC";
footerBkg.style.opacity = .9;
container.appendChild(footerBkg);
*/

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - WARNING
var warningMessage = document.createElement("div");
warningMessage.style.marginLeft = 6;
warningMessage.style.width = 300;
// warningMessage.style.background = "#CCC";
warningMessage.style.color = "#FF0000";
warningMessage.style.textAlign = "center";
warningMessage.style.visibility = "hidden";
warningMessage.style.fontSize = 12;
warningMessage.textContent = "Warning Message";
container.appendChild(warningMessage);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - FOOTER
var footer = document.createElement("footer");
footer.style.marginTop = 30;
footer.style.width = 310;
container.appendChild(footer);

var cancelB = createButton("Cancel");
// cancelB.onclick = (e) => dialog.close();
cancelB.onclick = (e) => cancelDialog();
footer.appendChild(cancelB);

var okB = createButton("Export", "cta");
okB.setAttribute("type", "submit");
okB.onclick = (e) => validateDialog(e);
footer.appendChild(okB);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - MAIN FUNCTION
async function init(selection)
{
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
					if(replaceConfirmBox != null)
					{
						replaceConfirmBox.remove();
					}
					if(usageBox != null)
					{
						usageBox.remove();
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

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - SELECTION CHECK
async function checkSelection(_selection)
{
	if(mainSelection.items.length == 0)
	{
		try
		{
			// let a = await openAlertDialog(pluginTitle, "Please select a square Artboard, object or group.");
			await openAlertDialog(pluginTitle, "Please select a square Artboard, object or group. Make sure the selected element is 100x100 px.");
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
		
	// if(Math.round(selectedObjectWidth) != Math.round(selectedObjectHeight)) // (selectedObjectWidth != 100 || selectedObjectHeight != 100) 
	if(selectedObjectWidth != 100 || selectedObjectHeight != 100) 
	{
		try
		{
			// let a = await openAlertDialog(pluginTitle, "The selected object is not a perfect square.");
			await openAlertDialog(pluginTitle, "Make sure the selected element is 100x100 px.");
			
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
	alertMessage.style.fontSize = 12;
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
	
	/*
	if(!checkExistingAppFolder())
	{
		return;
	}
	*/
	
	
	try
	{
		let folderExists = await checkExistingAppFolder();
		if(folderExists == true)
		{
			return;
		}
	}
	catch(_error)
	{
		
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

async function openReplaceConfirm(_title, _message)
{
	replaceConfirmBox = document.createElement("div");
	// replaceConfirmBox.style.display = "flex";
	replaceConfirmBox.style.position = "absolute";
	replaceConfirmBox.style.top = 0;
	replaceConfirmBox.style.left = 0;
	// replaceConfirmBox.style.width = 402;
	// replaceConfirmBox.style.width = 380;
	replaceConfirmBox.style.width = dialogWidth;
	replaceConfirmBox.style.height = 1000;
	container.appendChild(replaceConfirmBox);
	
	let alertBkg = document.createElement("div");
	// alertBkg.style.display = "flex";
	// alertBkg.style.position = "absolute";
	// alertBkg.style.top = 0;
	// alertBkg.style.left = 0;
	alertBkg.style.width = replaceConfirmBox.style.width;
	alertBkg.style.height = replaceConfirmBox.style.height;
	alertBkg.style.background = "#000";
	alertBkg.style.opacity = .8;
	// alertBkg.onclick = (e) => closeAlert();
	replaceConfirmBox.appendChild(alertBkg);
	
	let alert = document.createElement("div");
	// alert.style.display = "flex";
	alert.style.position = "absolute";
	alert.style.padding = 20;
	alert.style.width = 260;
	// alert.style.height = 260;
	// alert.style.top = 100;
	alert.style.left = (replaceConfirmBox.style.width.value / 2) - (alert.style.width.value / 2);
	// alert.style.top = alert.style.left;
	// alert.style.borderRadius = 4;
	alert.style.borderRadius = "0 0 4 4";
	// console.log(replaceConfirmBox.style.width.value);
	// console.log(dialog.style.width);
	// console.log(dialog.style.height);
	alert.style.background = "#FFF";
	replaceConfirmBox.appendChild(alert);
	
	let alertTitle = document.createElement("label");
	alertTitle.style.marginBottom = 20;
	alertTitle.style.fontSize = 14;
	alertTitle.style.fontWeight = "bold";
	alertTitle.style.color = "#2C2C2C";
	alertTitle.textContent = _title;
	alert.appendChild(alertTitle);
	
	let alertMessage = document.createElement("label");
	alertMessage.style.fontSize = 12;
	// alertMessage.style.background = "#EAEAEA";
	// alertMessage.style.color = "#2C2C2C";
	alertMessage.textContent = _message;
	alert.appendChild(alertMessage);
	
	let alertFooter = document.createElement("div");
	alertFooter.style.display = "flex"; 
	alertFooter.style.flexDirection = "row";
	alertFooter.style.justifyContent = "flex-end";
	alertFooter.style.marginTop = 20;
	alert.appendChild(alertFooter);
	
	let cancelB = createButton("Cancel");
	// cancelB.onclick = (e) => dialog.close();
	// cancelB.onclick = (e) => closeReplaceConfirm();
	cancelB.onclick = (e) => replaceConfirmBox.remove();
	alertFooter.appendChild(cancelB);
	
	let closeB = createButton("Replace", "warning", false);
	closeB.onclick = (e) => replaceExistingAssets();
	alertFooter.appendChild(closeB);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - USAGE
function openUsage(_title, _message)
{
	usageBox = document.createElement("div");
	usageBox.style.position = "absolute";
	usageBox.style.top = 0;
	usageBox.style.left = 0;
	usageBox.style.width = dialogWidth;
	usageBox.style.height = 1000;
	container.appendChild(usageBox);
	
	let helpBkg = document.createElement("div");
	helpBkg.style.width = usageBox.style.width;
	helpBkg.style.height = usageBox.style.height;
	helpBkg.style.background = "#000";
	helpBkg.style.opacity = .8;
	usageBox.appendChild(helpBkg);
	
	let alert = document.createElement("div");
	alert.style.position = "absolute";
	alert.style.padding = 20;
	alert.style.width = 320;
	alert.style.left = (usageBox.style.width.value / 2) - (alert.style.width.value / 2);
	alert.style.borderRadius = "0 0 4 4";
	alert.style.background = "#FFF";
	usageBox.appendChild(alert);
	
	let alertTitle = document.createElement("label");
	alertTitle.style.marginBottom = 20;
	alertTitle.style.fontSize = 14;
	alertTitle.style.fontWeight = "bold";
	alertTitle.style.color = "#2C2C2C";
	alertTitle.textContent = _title;
	alert.appendChild(alertTitle);
	
	let alertMessage = document.createElement("label");
	alertMessage.style.fontSize = 12;
	alertMessage.textContent = _message;
	alert.appendChild(alertMessage);
	
	let alertFooter = document.createElement("div");
	alertFooter.style.display = "flex"; 
	alertFooter.style.flexDirection = "row";
	alertFooter.style.justifyContent = "flex-end";
	alertFooter.style.marginTop = 20;
	alert.appendChild(alertFooter);
	
	let closeB = createButton("OK", "primary", false);
	closeB.onclick = (e) => usageBox.remove();
	alertFooter.appendChild(closeB);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - DATA CHECK
function checkExportFolder()
{
	// console.log("checkExportFolder()");
	let exportFolderString = exportFolderTF.value;
	
	if(exportFolderString == "")
	{
		displayWarning("Choose an Export Folder for exporting assets.");
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
	appName = appNameTF.value;
	// console.log(appName);
	
	if(appName == "")
	{
		displayWarning("Insert the App Name.");
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
			// displayWarning("Select at least one platform");
			platformUncheckedA.push(platformCB);
			// return false;
		}
	}
	
	if(platformUncheckedA.length == renditionsA.length)
	{
		displayWarning("Select at least one Platform.");
		return false;
	}
	else
	{
		return true;
	}
}

async function checkExistingAppFolder()
{
	// console.log("checkExistingAppFolder()");
	
	try
	{
		// let folder = await exportFolder.getEntry("./" + appName);
		existingAppFolder = await exportFolder.getEntry("./" + appName);
		if(existingAppFolder)
		{
			// displayWarning("App name already used. Overwrite?");
			let a = await openReplaceConfirm("Replace existing folder?", "\"" + appName + "\" folder already exists. Replacing it will overwrite its current contents.");
			return true;
		}
		else
		{
			return false;
		}
	}
	catch(_error)
	{
		console.log(_error);
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
    let newCheckBoxGroup = document.createElement("label");
	newCheckBoxGroup.style.display = "flex";
	newCheckBoxGroup.style.flexDirection = "row";
	newCheckBoxGroup.style.alignItems = "center";
	
	let newCheckBox = document.createElement("input");
    newCheckBox.type = "checkbox";
    /*newCheckBox.id = _placeholder;
    newCheckBox.placeholder = _placeholder;*/
	if (_checked)
	{
        newCheckBox.checked = true;
    }
	newCheckBoxGroup.appendChild(newCheckBox);
	
	let newCheckBoxLabel = document.createElement("span");
	newCheckBoxLabel.style.marginLeft = 2;
	newCheckBoxLabel.style.width = _width;
    newCheckBoxLabel.textContent = _placeholder;
    newCheckBoxGroup.appendChild(newCheckBoxLabel);
	
    return newCheckBoxGroup;
}

function createLabel(_text)
{
	let newLabel = document.createElement("span");
	// label.style.margin = 5;
	// label.style.minWidth = 150;
	newLabel.style.textAlign = "left";
	newLabel.style.fontSize = 12;
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
		pluginFolder = await LFS.getPluginFolder();
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
		dataFolder = await LFS.getDataFolder();
		
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
		exportFolder = await LFS.getFolder();
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
		appFolder = await exportFolder.createFolder(appName, {overwrite: true});
		// appFolder = await exportFolder.createEntry(appName, {type: LS.types.folder, overwrite: true})
		// appFolder = await exportFolder.createEntry(appName, {type: LS.types.folder})
		if(appFolder)
		{
			for(let i = 0; i < renditionsA.length; i ++)
			{
				if(renditionsA[i]["checkBox"].checked)
				{
					try
					{
						// create iOS folder
						let platformFolder = await appFolder.createFolder(renditionsA[i]["platform"], {overwrite: true});
						// let platformFolder = await appFolder.createEntry(renditionsA[i]["platform"], {type: LS.types.folder, overwrite: true});
						// iosFolder = await appFolder.createEntry("iOS", {type: LS.types.folder});
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
	// console.log("exportRenditions()");
		
	let renditions = [];
		
	for(let i = 0; i < _renditionsA.length; i++)
	{
		// console.log(_renditionsA[i]);
		// let fileName = "icon_" + _renditionsA[i] + ".png";
		let fileName = fileNameTF.value + _renditionsA[i] + ".png";
		try
		{
			let file = await _platformFolder.createFile(fileName, {overwrite: true});
			// let file = await _platformFolder.createEntry(fileName, {type: LS.types.file, overwrite: true});
			// let file = await _platformFolder.createEntry(fileName, {type: LS.types.file});
			
			if(file)
			{
				// let scaleFactor = _renditionsA[i]/selectedObjectTempWidth;
				let scaleFactor = _renditionsA[i]/selectedObjectWidth;
				
				// console.log("target size: " + _sizesA[i] + "\nartwork size: " + selectedObjectWidth + "\nscale factor: " + scaleFactor + "\n\n");
				
				let rendition = {node: selectedObject, outputFile: file, type: APP.RenditionType.PNG, scale: scaleFactor};
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
		await APP.createRenditions(renditions);
	}
	catch(_error)
	{
		console.log(_error);
	}
}

async function replaceExistingAssets()
{
	try
	{
		let entries = await existingAppFolder.getEntries();
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
						// console.log("remove: " + entries[i].name);
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
		
		// delete app folder (now empty)
		try
		{
			await existingAppFolder.delete();
		}
		catch(_error)
		{
			console.log(_error);
		}

		// close confirm
		// closeReplaceConfirm();
		replaceConfirmBox.remove();

		// re-export renditions from scratch
		try
		{
			await exportAppIconOK();
		}
		catch(_error)
		{
			console.log(_error);
		}
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










