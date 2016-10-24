"use strict";

var FileOpener = function() {
	//If not called as a constructor, do it
	if (!(this instanceof FileOpener))
	{
		return new FileOpener();
	}
	//Enable debugging mode, remove or set to false to disable
	var debugging = true;
	var regexZip = /.*\.zip$/;

	//Check if JSZip is loaded
	if (!window.JSZip)
	{
		displayLibraryError("JSZip");
	}

	//Set methods
	this.getFilesFromList = getFilesFromList;
	this.getFilesFromZip = getFilesFromZip;
	this.getFile = getFile;

	//Returns a promise of an array of the file contents of a list of files
	function getFilesFromList(fileList) 
	{
		return new Promise(function(resolve, reject) {
			if (fileList instanceof FileList) //Check if fileList is a FileList
			{
				var promises = [];
				for (let file of fileList)
				{
					if (file.name.match(regexZip)) //Probably a zip-file. Treat as such
					{
						promises.push(getFilesFromZip(file));
					}
					else //Treat like any other file
					{
						promises.push(getFile(file));
					}
				}
				Promise.all(promises)
				.then(function(result) {
					result.simplify = simplifyThis.bind(result);
					resolve(result);
				},
				function(err) {
					displayError(err);
				});
			}
			else
			{
				displayParameterError("fileList");
				reject("Not a FileList!");
			}			
		});		
	}

	//Returns a promise of an array of file contents that are bundled in a zip archive
	function getFilesFromZip(zipFile)
	{
		return new Promise(function(resolve, reject) {
			if (zipFile.name.match(regexZip)) //Probably a zip-file
			{		
				JSZip.loadAsync(zipFile)
				.then(function(zip) {
					accessZip(zip).then(function(result) {
						result.simplify = simplifyThis.bind(result);
						resolve(result);
					});
				});
			}
			else
			{
				reject(zipFile.name + " is not a zip file!");
			}
		});		
	}
	
	//Returns a promise of all file contents in an opened zip archive (opened by JSZip)
	function accessZip(zip)
	{
		var promises = [];
		zip.forEach(function(relPath, file) {
			promises.push(openZipObject(relPath, file));
		});
		return Promise.all(promises);
	}

	//Returns a promise of an object containing a zip-archived file's content and name
	function openZipObject(relPath, file)
	{
		return new Promise(function(resolve, reject) {
			file.async("string").then(function(content) {
				resolve({
					content: content,
					name: file.name,
				});
			});
		});		
	}

	//Returns a promise of an object containing a file's content and name
	function getFile(file)
	{
		return new Promise(function(resolve, reject) {
			var reader = new FileReader();
			reader.onload = function(e) {
				var content = e.target.result;
				resolve({
					content: content,
					name: file.name,
				});
			};
			reader.onError = function(err) {
				reject(err);
			};
			reader.readAsText(file);
		});
	}

	//Flattens arrayFrom and writes to arrayTo, which should be an empty array 
	function simplifyArray(arrayFrom, arrayTo)
	{
		arrayFrom.forEach(function(datum) {
			if (Array.isArray(datum))
			{
				simplifyArray(datum, arrayTo);
			}
			else
			{
				arrayTo.push(datum);
			}
		});
	}

	//calls simplifyArray on itself and returns flattened array
	function simplifyThis ()
	{
		var arrayTo = [];
		simplifyArray(this, arrayTo);
		return arrayTo;
	}

	//Function to write on browser console. If last parameter is not boolean false, message will only be displayed when variable debugging is set to true 
	function displayMessage()
	{
		var debugOnly;
		var message = [];
		var maxIndex = arguments.length-1;
		var display = false;
		if (typeof arguments[maxIndex] === typeof true)
		{
			debugOnly = arguments[maxIndex];
			for (var i = 0; i < maxIndex; i++)
			{
				message.push(arguments[i]);
			}
		}
		else
		{
			debugOnly = true;
			message = arguments;
		}
		if (typeof debugging !== 'undefined')
		{		
			display = debugging || (!debugOnly);
		}
		else
		{
			display = !debugOnly;
		}
		if (display)
		{
			console.log(message);
		}
	}

	//Writes error messages on console
	function displayError()
	{
		for (var i=0; i<arguments.length; i++)
		{
			displayMessage("ERROR in FileOpener: " + arguments[i], false);
		}	
	}

	//Writes parameter error message on console
	function displayParameterError(parameter)
	{
		displayError("Parameter " + parameter + " is not as expected!");
	}

	//Writes library error message on console
	function displayLibraryError(library)
	{
		displayError("Necessary library " + library + " is nowhere to be found. Please make sure it has been properly loaded");
	}
};

//Make functions accessible without explicitly initializing FileOpener
FileOpener.getFilesFromList = function(fileList) {
	return new FileOpener().getFilesFromList(fileList);
};
FileOpener.getFilesFromZip = function(zipFile) {
	return new FileOpener().getFilesFromZip(zipFile);
};
FileOpener.getFile = function(file) {
	return new FileOpener().getFile(file);
};


