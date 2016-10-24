# FileOpener
## Description
**FileOpener** automates opening files and retrieving their contents. It employs @Stuk 's library [JSZip](https://github.com/Stuk/jszip) to open and retrieve files in zipped archives.

## Using FileOpener
### Adding FileOpener to my project
Download fileOpener.js and include it wherever needed.

### Exemplary usage
FileOpener can be used in multiple ways. The following examples will behave the same:
```javascript
//Create a new instance of FileOpener: Call FileOpener constructor by using keyword new 
var opener = new FileOpener();
opener.getFilesFromList(fileList)
	.then(workWithFileContents, handleErrors);

//Call function directly
FileOpener.getFilesFromList(fileList)
	.then(workWithFileContents, handleErrors);

function workWithFileContents(result)
{
	console.log(result);
}

function handleErrors(err)
{
	console.log(err);
}
```
#### FileOpener methods
FileOpener offers three methods to use:
1. **getFile** - returns a promise of an object with the properties *name* and *content* of a single file or blob.
2. **getFilesFromZip** - returns a promise of an array of above described objects.
3. **getFilesFromList** -  returns a promise of a (nested) array of above described objects.

The arrays in 2 and 3 can be flattened using the *simplify*-method.