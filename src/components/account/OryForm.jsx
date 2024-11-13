import LoginStyles from "../../static/stylesheets/modules/login.module.scss";

import React, {useState, useEffect, useRef} from "react";
import {observer} from "mobx-react";
import {rootStore, accountsStore} from "../../stores";
import {Button, Loader, PasswordInput, TextInput} from "@mantine/core";
import {CreateModuleClassMatcher, ValidEmail} from "../../Utils";
import {ButtonWithLoader} from "../Misc";
import {Link} from "react-router-dom";
import {AccountSelector} from "./AccountMenu";

const S = CreateModuleClassMatcher(LoginStyles);

const searchParams = new URLSearchParams(window.location.search);
let timeoutDelay = 100;

// Settings form has other stuff in it, build password form manually
const PasswordResetForm = ({OrySubmit, nodes}) => {
  const csrfToken = nodes.find(node => node.attributes.name === "csrf_token").attributes.value;

  return (
    <>
      <div className={S("ory-login__message")}>{rootStore.l10n.login.ory.messages.set_password}</div>
      <input name="csrf_token" type="hidden" required value={csrfToken}/>
      <PasswordInput
        name="password"
        type="password"
        required
        autoComplete="new-password"
        placeholder="Password"
        classNames={{
          root: S("input-container"),
          wrapper: S("input-wrapper"),
          input: S("input"),
          innerInput: S("inner-input"),
          visibilityToggle: S("input-visibility-toggle")
        }}
      />
      <PasswordInput
        name="password_confirmation"
        type="password"
        required
        placeholder="Password Confirmation"
        classNames={{
          root: S("input-container"),
          wrapper: S("input-wrapper"),
          input: S("input"),
          innerInput: S("inner-input"),
          visibilityToggle: S("input-visibility-toggle")
        }}
      />
      <input name="method" type="hidden" placeholder="Save" value="password"/>
      <ButtonWithLoader onClick={OrySubmit} type="submit" action={false} className={S("button")}>
        {rootStore.l10n.login.ory.actions.update_password}
      </ButtonWithLoader>
    </>
  );
};

const ForgotPasswordForm = ({OrySubmit, Cancel}) => {
  return (
    <>
      <div className={S("ory-login__message")}>{rootStore.l10n.login.ory.messages.recovery_prompt}</div>
      <TextInput
        name="email"
        type="email"
        placeholder="Email"
        required
        autofocus
      />
      <ButtonWithLoader
        formNoValidate
        onClick={OrySubmit}
        type="submit"
        className={S("button")}
      >
        Submit
      </ButtonWithLoader>
      <button
        key="back-link"
        onClick={Cancel}
        className={S("button-link")}
      >
        {rootStore.l10n.login.ory.actions.back_to_sign_in}
      </button>
    </>
  );
};

let submitting = false;
const SubmitRecoveryCode = async ({flows, setFlows, setFlowType, setErrorMessage}) => {
  if(submitting) {
    return;
  }

  submitting = true;

  const RecoveryFailed = async () => {
    if(searchParams.get("code")) {
      setFlowType("login");

      setTimeout(() => setErrorMessage(rootStore.l10n.login.ory.errors.invalid_recovery_email), timeoutDelay);
      return;
    }

    // Code redemption failed
    const newFlow = await accountsStore.oryClient.createBrowserRecoveryFlow();

    setFlows({
      ...flows,
      recovery: newFlow.data
    });
    setFlowType("recovery");

    setTimeout(() => setErrorMessage(rootStore.l10n.login.ory.errors.invalid_recovery_email), timeoutDelay);
  };

  try {
    const createResponse = await accountsStore.oryClient.getRecoveryFlow({id: searchParams.get("flow")});

    if(searchParams.has("code")) {
      try {
        const updateResponse = await accountsStore.oryClient.updateRecoveryFlow({
          flow: searchParams.get("flow"),
          updateRecoveryFlowBody: {
            code: searchParams.get("code"),
            method: "code"
          }
        });

        // Code redemption succeeded
        setFlowType(updateResponse.data.state === "passed_challenge" ? "settings" : "recovery");
        setFlows({...flows, recovery: updateResponse.data});

        return true;
      } catch(error) {
        rootStore.Log(error, true);
        await RecoveryFailed();
        return false;
      }
    } else {
      // Flow initialized
      setFlowType("recovery");
      setFlows({...flows, recovery: createResponse.data});
      return true;
    }
  } catch(error) {
    // Flow initialization failed
    rootStore.Log(error, true);
    await RecoveryFailed();
    return false;
  } finally {
    submitting = false;
  }
};

const OryForm = observer(({userData, isLoginGate, Close}) => {
  const [flowType, setFlowType] = useState(searchParams.has("flow") ? "initializeFlow" : "login");
  const [flows, setFlows] = useState({});
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(undefined);
  const [errorMessage, setErrorMessage] = useState(undefined);
  const formRef = useRef();

  useEffect(() => {
    if(!accountsStore.oryClient) { return; }

    setErrorMessage(undefined);
    setStatusMessage(undefined);

    const existingFlow = flows[flowType];

    if(existingFlow) { return; }

    switch(flowType) {
      case "initializeFlow":
        // Recovery flow - try and submit code
        if(location.pathname.endsWith("/register") && !flows.recovery) {
          SubmitRecoveryCode({flows, setFlows, setFlowType, setErrorMessage})
            .then(success => {
              if(success) {
                setTimeout(() => setStatusMessage(rootStore.l10n.login.ory.messages.set_password), timeoutDelay);
              } else {
                accountsStore.LockAccount();
              }
            });
        }

        break;
      case "login":
        accountsStore.oryClient.createBrowserLoginFlow({refresh: true})
          .then(({data}) => setFlows({...flows, [flowType]: data}));
        break;
      case "registration":
        accountsStore.oryClient.createBrowserRegistrationFlow({returnTo: window.location.origin})
          .then(({data}) => setFlows({...flows, [flowType]: data}));
        break;
      case "settings":
        accountsStore.oryClient.createBrowserSettingsFlow()
          .then(({data}) => setFlows({...flows, [flowType]: data}));
        break;
    }
  }, [accountsStore.oryClient, flowType]);


  console.log(flows, flowType);


  const flow = flows[flowType];

  if(!flow || loading) {
    return (
      <div className={S("ory-login", "ory-login--loading")}>
        <Loader />
      </div>
    );
  }

  let title;
  let additionalContent = [];
  if(flowType === "login") {
    if(!flow.refresh && flow.requested_aal !== "aal2") {
      if(!isLoginGate) {
        additionalContent.push(
          <Button
            key="registration-link"
            onClick={() => setFlowType("registration")}
            color="gray.8"
            className={S("button")}
          >
            {rootStore.l10n.login.ory.actions.registration}
          </Button>
        );
      }

      additionalContent.push(
        <button
          key="recovery-link"
          onClick={() => {
            setFlows({...flows, recovery_email: {}});
            setFlowType("recovery_email");
          }}
          className={S("button-link")}
        >
          { rootStore.l10n.login.ory.actions.recovery }
        </button>
      );

      additionalContent.push(
        <Link
          to="/accounts"
          key="back-link"
          onClick={() => Close?.()}
          className={S("button-link", "button-link--secondary")}
        >
          { rootStore.l10n.login.ory.actions.back_to_accounts }
        </Link>
      );
    } else {
      additionalContent.push(
        <button
          key="sign-out-link"
          onClick={async event => {
            event.preventDefault();
            await LogOut();
          }}
          className={S("button-link")}
        >
          {rootStore.l10n.login.ory.actions.sign_out}
        </button>
      );
    }
  } else if(flowType === "registration") {
    title = rootStore.l10n.login.ory.registration;

    additionalContent.push(
      <button
        key="back-link"
        onClick={() => {
          setFlowType("login");
        }}
        className={S("button-link")}
      >
        {rootStore.l10n.login.ory.actions.back_to_sign_in}
      </button>
    );
  } else if(["recovery", "recovery_code"].includes(flowType)) {
    title = rootStore.l10n.login.ory.recovery;

    additionalContent.push(
      <button
        key="back-link"
        onClick={() => {
          setFlowType("login");
          setFlows({
            ...flows,
            recovery: undefined
          });
        }}
        className={S("button-link")}
      >
        {rootStore.l10n.login.ory.actions.back_to_sign_in}
      </button>
    );
  } else if(flowType === "settings") {
    title = rootStore.l10n.login.ory.update_password;
  }

  const LogOut = async () => {
    try {
      setLoading(true);
      await accountsStore.LogOutOry();
      setFlows({});
      setFlowType("reset");
      setTimeout(() => setFlowType("login"), 250);
    } catch(error) {
      rootStore.Log(error);
    } finally {
      setLoading(false);
    }
  };

  const OrySubmit = async (event, additionalData={}) => {
    event.preventDefault();
    setErrorMessage(undefined);

    try {
      const formData = new FormData(formRef.current);
      const body = { ...Object.fromEntries(formData), ...additionalData };

      let response;

      const email = body.email || body.identifier || body["traits.email"];

      if(email && !ValidEmail(email)) {
        setErrorMessage(rootStore.l10n.login.ory.errors.invalid_email);
        return;
      }

      if("password_confirmation" in body && body.password !== body.password_confirmation) {
        setErrorMessage(rootStore.l10n.login.ory.errors.invalid_password_confirmation);
        return;
      }

      let next = false;
      switch(flowType) {
        case "login":
          await accountsStore.oryClient.updateLoginFlow({flow: flow.id, updateLoginFlowBody: body});
          await accountsStore.AuthenticateOry({userData});
          next = true;

          break;
        case "login_limited":
          await accountsStore.AuthenticateOry({userData, force: true});
          next = true;

          break;
        case "registration":
          await accountsStore.oryClient.updateRegistrationFlow({flow: flow.id, updateRegistrationFlowBody: body});
          await accountsStore.AuthenticateOry({userData, sendWelcomeEmail: true, sendVerificationEmail: true});
          next = true;

          break;

        case "recovery_email":
          const flowInfo = await accountsStore.SendLoginEmail({type: "reset_password", email: body.email});
          response = await accountsStore.oryClient.getRecoveryFlow({id: flowInfo.flow});
          setFlows({...flows, recovery: response.data});
          setFlowType("recovery");

          break;
        case "recovery":
          response = await accountsStore.oryClient.updateRecoveryFlow({flow: flow.id, updateRecoveryFlowBody: body});
          setFlows({...flows, [flowType]: response.data});

          if(response.data.state === "passed_challenge") {
            setFlowType("settings");
          }

          break;
        case "settings":
          response = await accountsStore.oryClient.updateSettingsFlow({flow: flow.id, updateSettingsFlowBody: body});

          if(response.data.state === "success") {
            setStatusMessage(rootStore.l10n.login.ory.messages.password_updated);
            await accountsStore.AuthenticateOry({userData, sendVerificationEmail: location.pathname.endsWith("/register")});
          }

          setFlows({...flows, [flowType]: response.data});
          next = true;
          break;
      }

      setStatusMessage(undefined);

      if(next) {
        Close?.(true);
      }
    } catch(error) {
      if(error.login_limited) {
        setFlows({...flows, login_limited: {}});
        setFlowType("login_limited");
        return;
      }

      rootStore.Log(error, true);

      const errors = error?.response?.data?.ui?.messages
        ?.map(message => message.text)
        ?.filter(message => message)
        ?.join("\n");

      if(errors) {
        setErrorMessage(errors);
        return;
      }

      const fieldErrors = error.response?.data?.ui?.nodes
        ?.map(node =>
          node.messages
            ?.filter(message => message.type === "error")
            ?.map(message => message.text)
            ?.join("\n")
        )
        ?.filter(message => message)
        ?.join("\n");

      if(fieldErrors) {
        setErrorMessage(fieldErrors);
        return;
      }

      if(error.response.status === 400) {
        switch(flowType) {
          case "login":
            setErrorMessage(rootStore.l10n.login.ory.errors.invalid_credentials);
            break;
          case "registration":
            setErrorMessage(rootStore.l10n.login.ory.errors.invalid_credentials);
            break;
          case "recovery":
            setErrorMessage(rootStore.l10n.login.ory.errors.invalid_verification_code);
            break;
        }
      }
    }
  };

  const messages = [
    ...(flow?.ui?.messages || []),
    statusMessage
  ].filter(m => m);

  console.log(messages, errorMessage, title);

  console.log(flow);

  return (
    <div className={S("ory-login")}>
      {
        messages.map(message =>
          <div key={`message-${message.id || message}`} className={S("ory-login__message")}>{message.text || message}</div>
        )
      }
      <form
        key={`form-${flowType}-${flow.state}`}
        ref={formRef}
        className={S("ory-login-form")}
      >
        {
          flowType === "recovery_email" ?
            <ForgotPasswordForm OrySubmit={OrySubmit} Cancel={() => setFlowType("login")} /> :
            flowType === "settings" ?
              <PasswordResetForm nodes={flow.ui.nodes} OrySubmit={OrySubmit} /> :
              flow.ui.nodes.map(node => {
                let attributes = {
                  ...node.attributes
                };
                const nodeType = attributes.type === "submit" ? "submit" : attributes.node_type;
                delete attributes.node_type;

                let label = attributes.title || node.meta?.label?.text || attributes.label || node.attributes.name;
                if(["identifier", "traits.email"].includes(attributes.name) && attributes.type !== "hidden") {
                  label = "Email";
                  attributes.type = "email";
                  delete attributes.value;
                }

                if(attributes.autocomplete) {
                  attributes.autoComplete = attributes.autocomplete;
                  delete attributes.autocomplete;
                }

                attributes.placeholder = label;
                const key = node?.meta?.label?.id || attributes.name;

                // 'Send sign in code' buttons?
                if([1040006, 1010015].includes(node?.meta?.label?.id)) {
                  return null;
                }

                if(nodeType === "submit" && attributes.value) {
                  // recovery code resend button
                  if(
                    node.meta.label?.id === 1070007 ||
                    node.meta.label?.id === 1070008
                  ) {
                    attributes.formNoValidate = true;

                    return [
                      <ButtonWithLoader
                        onClick={async event => await OrySubmit(event, {email: attributes.value})}
                        key={`button-${key}`}
                        formNoValidate
                        type="submit"
                        action={false}
                        className={S("button")}
                      >
                        {node.meta.label.text}
                      </ButtonWithLoader>
                    ];
                  }

                  if(node.meta?.label?.id === 1010022) {
                    node.meta.label.text = rootStore.l10n.login.ory.actions.sign_in;
                  }

                  return [
                    <input key={`input-${key}`} {...attributes} type="hidden" className={S("input")}/>,
                    <ButtonWithLoader
                      onClick={OrySubmit}
                      key={`button-${attributes.name}`}
                      type="submit"
                      action={false}
                      className={S("button")}
                    >
                      {node.meta.label.text}
                    </ButtonWithLoader>
                  ];
                }

                switch(nodeType) {
                  case "button":
                  case "submit":
                    return (
                      <button key={`button-${key}`} {...attributes}>
                        {node.meta.label.text}
                      </button>
                    );
                  default:
                    if(attributes.type === "password") {
                      return (
                        <PasswordInput
                          key={`input-${key}`}
                          {...attributes}
                        />
                      );
                    }

                    if(attributes.type !== "hidden") {
                      if(isLoginGate && attributes.type === "email") {
                        return (
                          <>
                            <AccountSelector center key={key} className={S("account-selector")} />
                            <input key={`hidden-${key}`} {...attributes} type="hidden" value={accountsStore.currentAccount?.email} />
                          </>
                        );
                      }

                      return (
                        <TextInput
                          key={`inputs-${key}`}
                          {...attributes}
                        />
                      );
                    }

                    return (
                      <input key={`inputs-${key}`} {...attributes} className={S("input")} />
                    );
                }
              })
        }
        {additionalContent}
        {
          !errorMessage ? null :
            <div className={S("error")}>
              { errorMessage }
            </div>
        }
      </form>
    </div>
  );
});

export default OryForm;
