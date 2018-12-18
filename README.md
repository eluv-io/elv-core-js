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

See [ElvClient documentation](https://github.com/eluv-io/elv-client-js) for more details)

### Running ElvCore
#### Running with NPM

```
  npm install
  npm run serve
```

Then open http://localhost:8082 in your browser

##### Configuration
Edit ```./configuration.json``` to point to your fabric and ethereum nodes


#### Running from static build 

Simply open dist/index.html in your browser

##### Configuration

Edit the following line in the packed javascript file ```dist/index.js``` 
to point to your fabric and ethereum nodes

```javascript
module.exports = {"fabric":{"hostname":"localhost","port":8008,"use_https":false},"ethereum":{"hostname":"localhost","port":7545,"use_https":false}};
```


#### IMPORTANT: CORS Configuration

##### Fabric

Ensure your qfab daemon configuration has the following options set
in the "api#cors" section

```json
"allowed_origins": [
  "*"
],
"allowed_methods": [
  "GET",
  "PUT",
  "POST",
  "OPTIONS",
  "DELETE"
],
 "allowed_headers": [
  "*"
 ]
```

##### Ethereum

If you are running Geth, ensure you have the rpccorsdomain flag set:

```geth --rpccorsdomain "*" ...```

Ganache should allow CORS requests by default
