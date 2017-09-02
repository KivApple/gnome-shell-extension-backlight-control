const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

function init() {
}

const BacklightControlSettings = new GObject.Class({
	Name: 'BacklightControlSettings',
	Extends: Gtk.Grid,

	_init: function (params) {
		this.parent(params);
        	this.margin = 24;
        	this.spacing = 30;
        	this.row_spacing = 10;
        	this._settings = Convenience.getSettings();
		
		let label, widget;
		label = new Gtk.Label({
            		label: 'AC',
            		hexpand: true,
            		halign: Gtk.Align.CENTER
        	});
		this.attach(label, 1, 1, 1, 1);
		label = new Gtk.Label({
            		label: 'Battery',
            		hexpand: true,
            		halign: Gtk.Align.CENTER
        	});
		this.attach(label, 2, 1, 1, 1);
		label = new Gtk.Label({
            		label: 'Backlight',
            		hexpand: true,
            		halign: Gtk.Align.START
        	});
		this.attach(label, 0, 2, 1, 1);
		widget = new Gtk.Scale({
			adjustment: new Gtk.Adjustment({
				lower: 0,
				upper: 100,
				value: this._settings.get_uint('ac-backlight')
			}),
			digits: 0,
			hexpand: true
		});
		widget.set_range(0, 100);
		widget.set_increments(10, 0);
		widget.set_value(this._settings.get_uint('ac-backlight'));
		widget.connect('value-changed', Lang.bind(this, function(w){
            		value = w.get_value();
            		this._settings.set_uint('ac-backlight', value);
         	}));
		this.attach(widget, 1, 2, 1, 1);
		widget = new Gtk.Scale({
			digits: 0,
			hexpand: true
		});
		widget.set_range(0, 100);
		widget.set_increments(10, 0);
		widget.set_value(this._settings.get_uint('bat-backlight'));
		widget.connect('value-changed', Lang.bind(this, function(w){
            		value = w.get_value();
            		this._settings.set_uint('bat-backlight', value);
         	}));
		this.attach(widget, 2, 2, 1, 1);
		label = new Gtk.Label({
            		label: 'Idle delay',
            		hexpand: true,
            		halign: Gtk.Align.START
        	});
		this.attach(label, 0, 3, 1, 1);
		widget = new Gtk.SpinButton({			
			halign: Gtk.Align.CENTER,
			digits: 0
		});
		widget.set_range(0, 60);
		widget.set_increments(1, 0);
		widget.set_value(this._settings.get_uint('ac-idle-delay') / 60);
		widget.connect('value-changed', Lang.bind(this, function(w){
            		value = w.get_value() * 60;
            		this._settings.set_uint('ac-idle-delay', value);
         	}));
		this.attach(widget, 1, 3, 1, 1);
		this.attach(label, 0, 3, 1, 1);
		widget = new Gtk.SpinButton({
			halign: Gtk.Align.CENTER,
			digits: 0
		});
		widget.set_range(0, 60);
		widget.set_increments(1, 0);
		widget.set_value(this._settings.get_uint('bat-idle-delay') / 60);
		widget.connect('value-changed', Lang.bind(this, function(w){
            		value = w.get_value() * 60;
            		this._settings.set_uint('bat-idle-delay', value);
         	}));
		this.attach(widget, 2, 3, 1, 1);
	}
});

function buildPrefsWidget() {
     let widget = new BacklightControlSettings();
     widget.show_all();
     return widget;
}

