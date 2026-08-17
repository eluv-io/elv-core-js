import {
  startRegistration,
  startAuthentication,
  base64URLStringToBuffer,
  bufferToBase64URLString
} from "@simplewebauthn/browser";

const RP_NAME = "Eluvio Content Fabric";

const PUB_KEY_CRED_PARAMS = [
  {alg: -7, type: "public-key"},   // ES256
  {alg: -257, type: "public-key"}  // RS256
];

// doesn't need to be secret, just needs to be constant, so passkey derives same PRF secret
const PRF_SALT_BASE64URL = "_uXyRAInP_wAyd_NxJxB6TUT0pydVBgp53xzsISzSuk";

const randomChallenge = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bufferToBase64URLString(bytes);
};

// user.id just needs to be valid base64url bytes for SimpleWebAuthn to convert to an ArrayBuffer
const walletAddressUserHandle = walletAddress => bufferToBase64URLString(new TextEncoder().encode(walletAddress));

const prfExtension = () => ({
  prf: {
    eval: {
      first: base64URLStringToBuffer(PRF_SALT_BASE64URL)
    }
  }
});

const extractPrfSecret = clientExtensionResults => {
  const first = clientExtensionResults?.prf?.results?.first;
  return first ? bufferToBase64URLString(first) : undefined;
};

/**
 * Register a new passkey for the given account and derive a stable PRF secret from it.
 * Caller is responsible for using that secret as the password when re-encrypting the account's private key.
 *
 * @namedParams
 * @param {string} walletAddress - The account's wallet address, used as the WebAuthn user handle
 * @param {string=} existingCredentialId - This account's existing passkey credential ID (base64url), if any,
 *   so re-registering doesn't create a duplicate credential for the same authenticator
 *
 * @returns {Promise<{credentialId: string, prfSecret: string}>}
 */
export async function RegisterPasskey({walletAddress, existingCredentialId}) {
  const credentialResponse = await startRegistration({
    optionsJSON: {
      rp: {id: window.location.hostname, name: RP_NAME},
      user: {id: walletAddressUserHandle(walletAddress), name: walletAddress, displayName: walletAddress},
      challenge: randomChallenge(),
      pubKeyCredParams: PUB_KEY_CRED_PARAMS,
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required"
      },
      excludeCredentials: existingCredentialId ? [{id: existingCredentialId, type: "public-key"}] : [],
      extensions: prfExtension()
    }
  });

  const prfSecret = extractPrfSecret(credentialResponse.clientExtensionResults);
  if(!prfSecret) {
    throw Error("This authenticator does not support the PRF extension required for passkey login");
  }

  return {credentialId: credentialResponse.id, prfSecret};
}

/**
 * Authenticate with a previously registered passkey and derive the same PRF secret produced at registration time
 *
 * @namedParams
 * @param {string} credentialId - The account's passkey credential ID (base64url)
 *
 * @returns {Promise<{prfSecret: string}>}
 */
export async function LoginWithPasskey({credentialId}) {
  const credentialResponse = await startAuthentication({
    optionsJSON: {
      rpId: window.location.hostname,
      challenge: randomChallenge(),
      allowCredentials: [{id: credentialId, type: "public-key"}],
      userVerification: "required",
      extensions: prfExtension()
    }
  });

  const prfSecret = extractPrfSecret(credentialResponse.clientExtensionResults);
  if(!prfSecret) {
    throw Error("This authenticator did not return a PRF secret");
  }

  return {prfSecret};
}

// strip "See: <spec url>" from err msg
export function FormatWebAuthnError(error) {
  return (error?.toString() || "").replace(/\s*See:\s*https?:\/\/\S+\s*$/i, "");
}
