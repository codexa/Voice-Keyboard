var settings = {};

settings.get = function (name) {
	name = ("app.settings."+name);
	return localStorage.getItem(name);
};

settings.save = function (name, value) {
	name = ("app.settings."+name);
	localStorage.setItem(name, value);
};
