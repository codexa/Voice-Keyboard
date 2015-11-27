window.addEventListener('load', init);

function init() {
	document.getElementById('back').addEventListener('click', function() {
		document.addEventListener('visibilitychange', function() {
			// Close ourself after the activity transition is completed.
			window.close();
		});
		var activity = new MozActivity({
			name: 'configure',
			data: {
				target: 'device'
			}
		});
	});
	
	var vibrationEnabled = document.querySelector('#vibration-enabled-switch');
	if (settings.get('vibration') != "false") {
		vibrationEnabled.setAttribute('checked', '');
		if (settings.get('vibration') != "true") {
			settings.save('vibration', "true");
		}
	} else {
		vibrationEnabled.removeAttribute('checked');
	}
	vibrationEnabled.onchange = function () {
		settings.save('vibration', this.checked);
	}
}
