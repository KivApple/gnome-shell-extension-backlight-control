const Gio = imports.gi.Gio;
const ExtensionUtils = imports.misc.extensionUtils;
const Lang = imports.lang;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const IntrospectableIface = '<node><interface name="org.freedesktop.DBus.Introspectable"><method name="Introspect"><arg name="xml_data" type="s" direction="out" /></method></interface></node>';
let IntrospectableProxy = null;

function makeProxyWrapperForObject(bus, object, path, ifaceName) {
	try {	
		let introspectable = new IntrospectableProxy(bus, object, path);
		let iface = introspectable.IntrospectSync().toString();
		let ifaceOffset = iface.indexOf('<interface name="' + ifaceName + '">');
		iface = '<node>' + iface.substring(ifaceOffset, iface.indexOf('</interface>', ifaceOffset) + '</interface>'.length) + '</node>';
		let proxy = Gio.DBusProxy.makeProxyWrapper(iface);
		return new proxy(bus, object, path);
	} catch (e) {
		log(e);
		return null;
	}
}

let settings = null;
let SessionConfig = null;
let UPowerProperties = null;
let Screen = null;

let OnBattery = undefined;

function applySettings() {
	const optionsPrefix = OnBattery ? 'bat-' : 'ac-';
	if (Screen) Screen.Brightness = settings.get_uint(optionsPrefix + 'backlight');
	if (SessionConfig) SessionConfig.set_uint('idle-delay', settings.get_uint(optionsPrefix + 'idle-delay'));
}

function onBatteryStateChanged(value) {
	if (value.length && value[0].get_type_string() === 'b') {
		value = value[0].unpack();
		if (OnBattery !== value) {
			OnBattery = value;
			log('OnBattery = ' + OnBattery);
			applySettings();
		}
	}
}

function UPowerPropertiesChanged(proxy) {
	onBatteryStateChanged(UPowerProperties.GetSync('org.freedesktop.UPower', 'OnBattery'));
}

function init() {
}

function enable() {
	settings = Convenience.getSettings();
	IntrospectableProxy = Gio.DBusProxy.makeProxyWrapper(IntrospectableIface);
	SessionConfig = new Gio.Settings({ schema: 'org.gnome.desktop.session' });
	UPowerProperties = makeProxyWrapperForObject(Gio.DBus.system, 'org.freedesktop.UPower', '/org/freedesktop/UPower', 'org.freedesktop.DBus.Properties');
	Screen = makeProxyWrapperForObject(Gio.DBus.session, 'org.gnome.SettingsDaemon.Power', '/org/gnome/SettingsDaemon/Power', 'org.gnome.SettingsDaemon.Power.Screen');
	if (UPowerProperties) {
		onBatteryStateChanged(UPowerProperties.GetSync('org.freedesktop.UPower', 'OnBattery'));
		UPowerProperties.connectSignal('PropertiesChanged', UPowerPropertiesChanged);
	}
	settings.connect('changed::ac-backlight', Lang.bind(this, applySettings));
	settings.connect('changed::ac-idle-delay', Lang.bind(this, applySettings));
	settings.connect('changed::bat-backlight', Lang.bind(this, applySettings));
	settings.connect('changed::bat-idle-delay', Lang.bind(this, applySettings));
}

function disable() {
	if (UPowerProperties) {
		UPowerProperties.disconnectSignal('PropertiesChanged', UPowerPropertiesChanged);
		UPowerProperties.disconnect();
		UPowerProperties = null;
	}
	if (Screen) {
		Screen.disconnect();
		Screen = null;
	}
	if (SessionConfig) {
		SessionConfig.run_dispose();
		SessionConfig = null;
	}
	if (IntrospectableProxy) {
		IntrospectableProxy = null;
	}
	settings.run_dispose();
}

