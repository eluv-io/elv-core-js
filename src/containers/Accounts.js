import { connect } from "react-redux";
import Thunk from "../utils/Thunk";
import {WrapRequest} from "../actions/Requests";
import {
  AddAccount,
  AuthenticationFailure,
  DeletePrivateProfileMetadata,
  GetPrivateUserProfile,
  GetProfileImage,
  GetPublicUserProfile,
  LogIn,
  LogOut,
  RemoveAccount,
  SendFunds,
  SetAccounts, SetProfileImage,
  SwitchAccount,
  UpdateAccountBalance,
  UpdatePrivateProfileMetadata,
  UpdatePublicProfileMetadata
} from "../actions/Accounts";
import Accounts from "../components/Accounts";
import AccountForm from "../components/AccountForm";
import LoginForm from "../components/LoginForm";
import Profile from "../components/Profile";
import TransferForm from "../components/TransferForm";
import Header from "../components/Header";

const mapStateToProps = state => { return {...state}; };

const mapDispatchToProps = dispatch =>
  Thunk(
    dispatch,
    [
      WrapRequest,
      GetProfileImage,
      GetPublicUserProfile,
      GetPrivateUserProfile,
      SetProfileImage,
      UpdatePublicProfileMetadata,
      UpdatePrivateProfileMetadata,
      DeletePrivateProfileMetadata,
      LogIn,
      SwitchAccount,
      LogOut,
      UpdateAccountBalance,
      SetAccounts,
      AddAccount,
      RemoveAccount,
      SendFunds,
      AuthenticationFailure
    ]
  );

export const HeaderContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);

export const AccountsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Accounts);

export const AccountFormContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountForm);

export const LoginFormContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginForm);

export const ProfileContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile);

export const TransferFormContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TransferForm);
