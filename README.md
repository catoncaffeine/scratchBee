##README

## Requirements
--------------
* Either have local versions of the above, or include their CDN tag on page
    * jQuery
    * Bootstrap
    * Fabric.js
    * FontAwesome


## What to include
-----------------
* Copy these files (including the scratchPad folder and folders in the structure)

scratchPad
    |__ js
    |   |__ main
    |       |___scratchPad.js
    |
    |__resource (everything)

* Not Necessary
    * test files
    * temp files and debug tools
    * everything in lib


## Start Using
-------------
* Include scratchPad.js on your page
* together with jQuery, Bootstrap, Fabric, FontAwesome
* Call ScratchPad.init(wrapper, config)
    * wrapper - the html element you want a scratch pad to be appended to
    * config - see below
    * returns - an instance of scratch pad


## Available Configs
--------------------
* dimension: {height: int, width: int}
* menu: [] (array, elements available in ScratchPad.menu object)
* toggleable: true/false
* readonly: true/false
* image: String (image url)
* imageAlt: String (image url when image fails)
