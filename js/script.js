// Initial setup
var preloader_width = 150; // Preloader width
var preloader_height = 4; // Preloader height
var preloader_color_fill = "#495272"; // Preloader fill color 
var preloader_color_outline = "#495272"; // Preloader outline color
var preloader_color_text = "#495272"; // Preloader text color

var background_path = "images/background.png"; // Specify here path to your background
var background_type = "stretched"; // Specify background type (can be "stretched", "fixed")
var background_info_path = "images/info_background.png"; // Specify here path to info-area background

var logo_path = "images/logo.png"; // Specify here path to your logo
var logo_scale = 60; // Logo sale factor (in percents)
var logo_x = 0; // Logo correction factor for X-position (in pixels);
var logo_y = 0; // Logo correction factor for Y-position (in pixels);
var logo_url_enable = true; // Make logo clickable (true, false)  
var logo_url = "http://kontramax.com"; // Specify URL when clicking on logo
var logo_url_target = "_self"; // Targeting (_blank, _self, _parent, _top)

var flickering = true; // Flickering (true, false)

// Other variables
var canvas, stage, exportRoot;
var background, main, logo, loader, progress, textfield, logo_container, counter, description_txt, mask_mc, a_rnd;

// Resize event listener
window.addEventListener('resize', resize, false);

// Init handler
function init() {
	// Creating and resize stage
	canvas = document.getElementById("canvas");
	stage = new createjs.Stage(canvas);
	stage.canvas.width = window.innerWidth;
	stage.canvas.height = window.innerHeight;
	//exportRoot = new lib.index(); // Uncomment to display initial stage in Flash
	//stage.addChild(exportRoot); // Uncomment to display initial stage in Flash
		
	// Ticker
	createjs.Ticker.setFPS(12);
	createjs.Ticker.addListener(stage);
		
	// Files list to load 
	images = images||{};
	var manifest = [
		{src:background_path, id:"background"},
		{src:background_info_path, id:"background_info_path"},
		{src:logo_path, id:"logo"}
	];	
	
	// Creating progress bar and textfield
	progress = new createjs.Shape();
	progress.graphics.beginStroke(preloader_color_outline).drawRect(stage.canvas.width / 2 - preloader_width / 2, stage.canvas.height / 2, preloader_width, preloader_height);
	stage.addChild(progress);
		
	textfield = new createjs.Text("Loading 0%", "normal 22px Trebuchet MS", preloader_color_text);
	textfield.x = stage.canvas.width / 2;
	textfield.y = stage.canvas.height / 2 - 30;
	textfield.textAlign ="center";
	stage.addChild(textfield);
		
	// Add preloader, handlers and start loading
	loader = new createjs.LoadQueue(true); // false - tag loading, true - XHR loading, none - XHR+(tag)
	loader.onProgress = handleFileProgress;
	loader.onFileLoad = handleFileLoad;
	loader.onComplete = handleComplete;
	loader.loadManifest(manifest);	
}

// Progress bar
function handleFileProgress(event) {
	var percents = 100*event.loaded;
	//console.log(percents.toFixed() + "%");
	textfield.text = percents.toFixed() + "%";
	progress.graphics.clear();
	progress.graphics.beginStroke(preloader_color_outline).drawRect(stage.canvas.width / 2 - preloader_width / 2, stage.canvas.height / 2, preloader_width, preloader_height);
	progress.graphics.beginFill(preloader_color_fill).drawRect(stage.canvas.width / 2 - preloader_width / 2, stage.canvas.height / 2, preloader_width * event.loaded, preloader_height);
}

// On file load handler
function handleFileLoad(event) {
images[event.id] = event.result; 
}

// On load complete handler
function handleComplete(event) {
	// Remove preloader
	progress.graphics.clear();
	stage.removeChild(progress);
	stage.removeChild(textfield);
		
	// Add background
	background = new createjs.Bitmap(loader.getResult("background"));
	stage.addChild(background);
	
	// Add background to info-area
	background_info = new createjs.Bitmap(loader.getResult("background_info_path"));
	stage.addChild(background_info);
	background_info.alpha = 0.85;
	
	// Add logo and interference, masking by screen
	logo = new createjs.Bitmap(loader.getResult("logo")); // Add logo
	logo.regX = logo.image.width / 2;
	logo.regY = logo.image.height / 2;	
	logo.scaleX = logo.scaleY = logo_scale/100;
	logo.rotation = -24;
	logo.x = logo.x + logo_x;
	logo.y = logo.y + logo_y;
	
	interference = new lib.interference(); // Add interference
	interference.x =- 20;
	interference.y =- 55;
	
	mask_mc = new lib.mask_mc();
	logo.mask = mask_mc.shape; // Add mask to logo and interference
	interference.mask = mask_mc.shape;
	
	logo_container = new createjs.Container();
	logo_container.addChild(mask_mc, logo, interference); // Add all to container
	stage.addChild(logo_container);
	
	if (logo_url_enable) {
		stage.enableMouseOver(); 
		mask_mc.cursor = "pointer"; // Hand cursor on mouse over
		mask_mc.onClick = handleLogoClick; // Clickable logo
	}

	// Add main animation from Flash
	main = new lib.main();
	stage.addChild(main);
	
	// Add jQuery countdown timer
	counter = new createjs.DOMElement(document.getElementById("counter"));
	description_txt = new createjs.DOMElement(document.getElementById("description_txt"));
	stage.addChild(counter, description_txt);

	// Start functions
	counter_start();
	resize();
	if (flickering) { createjs.Ticker.addEventListener("tick", tick); }
	
	loader.close();
	stage.update();
}

// Random elements flickering 
function tick(event) {
	main.outlines.alpha = main.fill2.alpha = logo.alpha = counter.alpha = description_txt.alpha = 1; // Reset
	a_rnd = Math.random() * 100;
	if (a_rnd.toFixed() <= 2) { main.outlines.alpha = 0.4; }
	if (a_rnd.toFixed() >= 90) { main.fill2.alpha = 0.3; }
	if (a_rnd.toFixed() == 21 | a_rnd.toFixed() == 22 | a_rnd.toFixed() == 23 | a_rnd.toFixed() == 24) { logo.alpha = 0.3;}
	if (a_rnd.toFixed() == 31 | a_rnd.toFixed() == 32 | a_rnd.toFixed() == 95 | a_rnd.toFixed() == 96) { counter.alpha = 0.6;}
	if (a_rnd.toFixed() == 95 | a_rnd.toFixed() == 42 | a_rnd.toFixed() == 43) { description_txt.alpha = 0.6;}
}

// Open URL when click on logo
function handleLogoClick() {
	window.open(logo_url, logo_url_target, false);
}

// Resize browser event handler
function resize() {
	stage.canvas.width = window.innerWidth;
	stage.canvas.height = window.innerHeight;
	
	// Preloader text positioning
	if (textfield != null) {
		textfield.x = stage.canvas.width / 2;
		textfield.y = stage.canvas.height / 2 - 30;
	}
	
	// Main animation positioning
	main.x = stage.canvas.width / 2 - 17;
	main.y = stage.canvas.height / 2 - 50;
	
	// Logo positioning
	logo_container.x = main.x - 63;
	logo_container.y = main.y - 119;

	// Countdown timer positioning
	counter.x = main.x + 132;
	counter.y = -main.y + 70;
	
	// Text positioning
	description_txt.x = main.x - 440;
	description_txt.y = -main.y + 65;
	
	// Background under info-area positioning
	background_info.x = main.x - 415;
	background_info.y = main.y + 126;
	
	// Background types
	if (background_type == "stretched") {
		background.scaleX = stage.canvas.width / background.image.width;
		background.scaleY = stage.canvas.height / background.image.height;
	}
	if (background_type == "fixed") {
		background.x = stage.canvas.width / 2 - background.image.width / 2 ;
		background.y = stage.canvas.height / 2 - background.image.height / 2 ;
	}	
}

// jQuery Countdown styles 1.6.1. - plugin by Keith Wood
function counter_start() {
	var austDay = new Date();
	austDay = new Date(austDay.getFullYear(), 8 - 1, 12); // Examples: (austDay.getFullYear() + 1, 3 - 1, 6) or (2013, 3 - 1, 6)
	$("#defaultCountdown").countdown({until: austDay, format: 'DHMS'});
}