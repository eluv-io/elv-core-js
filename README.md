## ElvCore

### Purpose

This application serves as a secure account management wrapper around other applications
(e.g. the fabric browser). ElvCore contains users' current account information (accounts, current account,
private keys, etc.) and can perform fabric API requests and blockchain interactions on behalf of the
contained app, allowing the app to perform actions, while never allowing it to gain access
to the user's credentials.

The contained app is run in a sandboxed IFrame. It can make API requests using the FrameBrowser client.
This client will pass messages to ElvCore corresponding to specific API calls. Upon receiving a request
message, ElvCore will make the request using the current user's credentials, then pass the result back to
the contained app as another messsage.

See [ElvClient documentation](https://github.com/eluv-io/elv-client-js) for more details

### Setting Up and Running ElvCore With NPM

- Set up a `configuration.js` file in the root directory using `configuration-example.js` as a guide. This can be done with

```
cp configuration-example.js configuration.js
```

- Open the newly created `configuration.js` file and comment out all of the instances of `config-url` except for the one you wish to use (main, demo or test).
- Now everything is configured and we are ready to run using npm.

```
  npm install
  npm run serve
```

Then open http://localhost:8082 in your browser

### Configuration Details

- The `apps` section in `configuration.js` is used to specify the url's of apps that are commonly used with elv-core (e.g: the fabric browser)
- Simply uncomment the specific apps in this section that you wish to use and ensure that the specified url points to the correct instance (either local or deployed)
