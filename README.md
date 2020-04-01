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

### Running ElvCore
#### Running with NPM

```
  npm install
  npm run serve
```

Then open http://localhost:8082 in your browser

##### Configuration
Edit ```./configuration.json``` to point to the appropriate Eluvio configuration URL and any additional apps.


#### Running from static build 

Simply open dist/index.html in your browser
