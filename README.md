# Plugin consists of React component and Python component

## What is it?

This prototype is AI moderator plugin for BigBlueButton. 

After completion of Bigbluebutton3.x and generation of plugin-file, copy the javascript (.js) file to the below path

var/www/bigbluebutton-default/assets/plugins

## Identify the Configuration file 'settings.yml'path, if it is otherthan the below given path.
## Then, modify it to include the plugin details as given below

Path : /usr/share/bigbluebutton/html5-client/private/config/

Add this to the `settings.yml` of the BBB HTML5-client:

```yaml
public:
  plugins:
    - name: SampleServerCommandsPlugin
      url: <<PLUGIN_URL>>
```

Where `<<PLUGIN_URL>>` is the URL that points to the location where your bundled `SampleServerCommandsPlugin.js`-file is hosted.
