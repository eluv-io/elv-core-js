import UrlJoin from "url-join";
import {
  startRegistration,
  startAuthentication,
  base64URLStringToBuffer,
  bufferToBase64URLString
} from "@simplewebauthn/browser";

// SimpleWebAuthn only knows how to convert the fields it recognizes
// (challenge, user.id, excludeCredentials[].id, ...) between base64url
// strings and ArrayBuffers. The "prf" extension isn't one of them, so its
// salt has to be converted by hand before the options are handed to the
// browser - the native WebAuthn API requires a real ArrayBuffer here.
const BufferizePrfEval = publicKey => {
  const first = publicKey?.extensions?.prf?.eval?.first;
  if(first) {
    publicKey.extensions.prf.eval.first = base64URLStringToBuffer(first);
  }
};

// ...and the PRF result has to be converted back to a base64url string by
// hand too - an ArrayBuffer would otherwise serialize as "{}" over
// JSON.stringify.
const ExtractPrfSecret = clientExtensionResults => {
  const first = clientExtensionResults?.prf?.results?.first;
  return first ? bufferToBase64URLString(first) : undefined;
};

const AuthServiceRequest = async ({client, pathParts, queryParams, body}) => {
  const response = await client.MakeAuthServiceRequest({
    method: "POST",
    path: UrlJoin("as", "api", ...pathParts),
    queryParams,
    body,
    bodyType: "JSON"
  });

  return await client.utils.ResponseToJson(response);
};

/**
 * Register a new passkey for the given account and derive a stable PRF
 * secret from it. The caller is responsible for using that secret as the
 * password when re-encrypting the account's private key (see
 * AccountStore.RegisterPasskey) - this function only handles the WebAuthn
 * ceremony itself, nothing about wallets or key storage.
 *
 * @namedParams
 * @param {Object} client - An ElvClient instance
 * @param {string} username - Identifier to register the passkey under (the wallet address)
 *
 * @returns {Promise<{credentialId: string, prfSecret: string}>}
 */
export async function RegisterPasskey({client, username}) {
  const options = await AuthServiceRequest({client, pathParts: ["register", "begin"], body: {username}});
  BufferizePrfEval(options.publicKey);

  const credentialResponse = await startRegistration({optionsJSON: options.publicKey});
  const prfSecret = ExtractPrfSecret(credentialResponse.clientExtensionResults);

  if(!prfSecret) {
    throw Error("This authenticator does not support the PRF extension required for passkey login");
  }

  await AuthServiceRequest({
    client,
    pathParts: ["register", "finish"],
    queryParams: {username},
    body: credentialResponse
  });

  return {credentialId: credentialResponse.id, prfSecret};
}

/**
 * Authenticate with a previously registered passkey and derive the same PRF
 * secret produced at registration time. The caller uses that secret as the
 * password to decrypt the account's private key (see
 * AccountStore.UnlockAccountWithPasskey).
 *
 * @namedParams
 * @param {Object} client - An ElvClient instance
 * @param {string} username - Identifier the passkey was registered under (the wallet address)
 *
 * @returns {Promise<{prfSecret: string}>}
 */
export async function LoginWithPasskey({client, username}) {
  const options = await AuthServiceRequest({client, pathParts: ["login", "begin"], body: {username}});
  BufferizePrfEval(options.publicKey);

  const credentialResponse = await startAuthentication({optionsJSON: options.publicKey});
  const prfSecret = ExtractPrfSecret(credentialResponse.clientExtensionResults);

  if(!prfSecret) {
    throw Error("This authenticator did not return a PRF secret");
  }

  await AuthServiceRequest({
    client,
    pathParts: ["login", "finish"],
    queryParams: {username},
    body: credentialResponse
  });

  return {prfSecret};
}
