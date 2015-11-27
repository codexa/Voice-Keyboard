var inputContext = null;
var keyboardElement, recordButton, isRecording;
var grammar, recognition;

/* Basic functions */
window.addEventListener('load', init);

function init() {
	keyboardElement = document.getElementById('keyboard');

	window.navigator.mozInputMethod.oninputcontextchange = function() {
		inputContext = navigator.mozInputMethod.inputcontext;
		resizeWindow();
	};

	window.addEventListener('resize', resizeWindow);

	keyboardElement.addEventListener('mousedown', function onMouseDown(evt) {
		// Prevent loosing focus to the currently focused app
		// Otherwise, right after mousedown event, the app will receive a focus event.
		evt.preventDefault();
	});

	var switchLayoutButton = document.getElementById('switch-layout-button');
	switchLayoutButton.addEventListener('click', function switchHandler() {
		var mgmt = navigator.mozInputMethod.mgmt;
		mgmt.next();
	});

	// long press to trigger IME menu
	var menuTimeout = 0;
	switchLayoutButton.addEventListener('touchstart', function longHandler() {
		menuTimeout = window.setTimeout(function menuTimeout() {
			var mgmt = navigator.mozInputMethod.mgmt;
			mgmt.showAll();
		}, 700);
	});

	switchLayoutButton.addEventListener('touchend', function longHandler() {
		clearTimeout(menuTimeout);
	});
	
	var closeButton = document.getElementById('close-button');
	if (closeButton) {
		closeButton.addEventListener('click', function(){
			var mgmt = navigator.mozInputMethod.mgmt;
			mgmt.hide();
		});
	}

	recordButton = document.getElementById('record-button');
	recordButton.addEventListener('click', captureSpeech);
	
	// Preload grammar	
	initRecognition();
}

function resizeWindow() {
	window.resizeTo(window.innerWidth, keyboardElement.clientHeight);
}

function sendKey(keyCode) {
	switch (keyCode) {
		case KeyEvent.DOM_VK_BACK_SPACE:
		case KeyEvent.DOM_VK_RETURN:
			if (inputContext) {
				inputContext.sendKey(keyCode, 0, 0);
			}
			break;

		default:
			if (inputContext) {
				inputContext.sendKey(0, keyCode, 0);
			}
			break;
	}
}

/* Speech recognition */
function captureSpeech() {
	if (isRecording) {
		recognition.abort();
	} else {
		recognition.start();
		recordingUI("on");
	}
}

function addRecordingListeners() {
	recognition.onaudiostart = function() {
		recordingUI("audio");
	};
	recognition.onaudioend = function() {
		recordingUI("recognition");
	};
	recognition.onend = function() {
		recordingUI("off");
	};
	
	recognition.onnomatch = function() {
		recordingUI("error");
	};
	recognition.onerror = function() {
		recordingUI("error");
	};
	
	recognition.onresult = function(event) {
		sendTranscript(event.results[0][0].transcript);
	};	
}

function recordingUI(state) {
	switch (state) {
		case "on":
			isRecording = true;
			break;
		case "off":
		case "error":
			isRecording = false;
			break;
		default:
			break;
	}
	recordButton.setAttribute("data-state",state);
}

function sendTranscript(transcript) {
	for (var i = 0; i < transcript.length; i++) {
		sendKey(transcript.charCodeAt(i));
	}	
}

function getGrammar(locale,callback) {
	var url = "/grammar/"+locale+"_jsgf.txt";
	var speechRecognitionList = new SpeechGrammarList();
	
	// Load grammar
	var request = new XMLHttpRequest();
	request.open("GET", url);
	request.addEventListener("load", function(e) {
		//var words = "#JSGF V1.0; grammar en; public <en> = "+this.responseText.replace(/\n/g," | ")+" ;";
		speechRecognitionList.addFromString(this.responseText);
		callback(speechRecognitionList);
	});
	request.send();
}

function initRecognition() {
	getGrammar("en-US",function(result){
		grammar = result;
		
		// Initialize recognition object
		recognition = new SpeechRecognition();
		recognition.grammars = grammar;
		//recognition.continuous = false;
		recognition.lang = 'en-US';
		recognition.interimResults = false;
		recognition.maxAlternatives = 1;
		addRecordingListeners();
		
		// Enable recording UI
		recordingUI("enabled");
	});	
}
