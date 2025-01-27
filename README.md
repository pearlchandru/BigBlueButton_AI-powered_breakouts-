# AI moderator plugin for BigBlueButton breakout room

## What is it?

This prototype is AI moderator plugin for BigBlueButton. It consists front-end react component that runs at client-side and a python component that runs at server.

## Step-by-step instructions to prepare generative AI moderator agent
Step 1: Complete installation of BigBlueButton3.x.

Step 2: Build the .js plugin-file from the given components either locally or in the BigBlueButton  server using the following scripts.  in dist folder.

```
cd $HOME/src/generative_AI_moderation
npm ci
npm run build-bundle
```
The above command will generate the `dist` folder, containing the bundled JavaScript file named `SampleServerCommandsPlugin.js`. This file can be hosted on any HTTPS server.

Step 3: Copy the javascript (.js) plugin-file to the below path

```
var/www/bigbluebutton-default/assets/plugins
```
Step 4: Identify the Configuration file 'settings.yml'path, if it is otherthan the below given path,

Path : /usr/share/bigbluebutton/html5-client/private/config/

Then, modify it to include the plugin details as given below
Add this to the `settings.yml` of the BBB HTML5-client:

```yaml
public:
  plugins:
    - name: SampleServerCommandsPlugin
      url: <<PLUGIN_URL>>
```

Where `<<PLUGIN_URL>>` is the URL that points to the location where your bundled `SampleServerCommandsPlugin.js`-file is hosted.

Step 5: 
We use Open-AI SWARM Multi-agent orchestration and hence it requires an OpenAI API Key to connect OPENAI from the backend Python server.
