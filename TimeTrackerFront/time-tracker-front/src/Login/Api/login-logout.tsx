import { ajax } from 'rxjs/ajax';
import { map, catchError, Observer, Observable } from 'rxjs';
import {
  redirect,
  useNavigate,
} from "react-router-dom";
import { LogoutDeleteCookie } from '../../Components/Navbar';
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { GetTokenObservable, domainBack } from '../../Redux/Requests/TimeRequests';
import { GetAjaxObservable } from '../../Redux/Requests/TimeRequests';
import { mergeMap } from 'rxjs';

export const accessTokenLiveTime = 60;

const url = "https://"+domainBack+"/graphql-login";

/*    "errors": [
        {
            "message": "User does not auth"
        }
    ],
    "data": {
        "refreshToken": {
            "refresh_token": "Your session was expired. Please, login again",
            "user_id": 0,
            "access_token": ""
        }
    }*/

export function isUnvalidTokenError(response: {
  "errors": [
    {
      "message": string
    }
  ],
  "data": {
    "refreshToken": {
      "refresh_token": string,
      "user_id": number,
      "access_token": string
    }
  }
}) {
  const errors = response.errors;
  if (errors && response.data.refreshToken) {
    return true;
  }
  return false;
}

export type LoginErrorType = {
  message: string
}

export type RequestTokenType = {
  issuedAt: Date,
  token: string
  expiredAt: Date,
}

export type StoredTokenType = {
  issuedAt: number,
  token: string
  expiredAt: number,
}

export type LoginType = {
  data: {
    login: {
      access_token: RequestTokenType,
      user_id: string,
      is_fulltimer: string,
      refresh_token: RequestTokenType,
      redirect_url:string,
    }
  },
  errors: LoginErrorType[]
}

export type RefreshType = {
  data: {
    refreshToken: {
      access_token: RequestTokenType,
      user_id: string,
      refresh_token: RequestTokenType
    }
  },
  errors: LoginErrorType[]
}

export function ajaxForLogin(variables: {}){
  return ajax<LoginType>({
    url: url,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `query($login:LoginInput!){
        login(login:$login){
          access_token {
            issuedAt
            token
            expiredAt
          }
          user_id
          refresh_token {
            issuedAt
            token
            expiredAt
          }
          is_fulltimer
          redirect_url
        }
      }`,
      variables
    }),
    withCredentials: true,
  }).pipe(
    map((value): string => {


      let fullResponse = value.response;
      let response = fullResponse.data.login;


      if (fullResponse.errors)
        throw fullResponse.errors[0].message;


      if(response.redirect_url){
          return response.redirect_url;
      }

      const access_token_to_save: StoredTokenType = {
        issuedAt: new Date(response.access_token.issuedAt).getTime(),
        expiredAt: new Date(response.access_token.expiredAt).getTime(),
        token: response.access_token.token
      }

      const refresh_token_to_save: StoredTokenType = {
        issuedAt: new Date(response.refresh_token.issuedAt).getTime(),
        expiredAt: new Date(response.refresh_token.expiredAt).getTime(),
        token: response.refresh_token.token
      }
      setCookie({
        name: "access_token",
        value: JSON.stringify(access_token_to_save),
        expires_second: access_token_to_save.expiredAt / 1000,
        path: "/"
      });
      setCookie({
        name: "user_id",
        value: response.user_id,
        expires_second: access_token_to_save.expiredAt / 1000,
        path: "/"
      });
      setCookie({
        name: "refresh_token",
        value: JSON.stringify(refresh_token_to_save),
        expires_second: refresh_token_to_save.expiredAt / 1000,
        path: "/"
      });
      setCookie({
        name: "is_fulltimer",
        value: JSON.stringify(response.is_fulltimer),
        expires_second: 60*60*24*365,
        path: "/"
      });

      return "/";
    }),
    catchError((error) => {
      throw error
    })
  );
}


export function IsRefreshError(error: any) {
  const refreshError: RefreshError = error
  return refreshError.error && refreshError.errorType === RefreshErrorEnum.RefreshError;
}


export enum RefreshErrorEnum {
  RefreshError
}

export type RefreshError = {
  error: string,
  errorType: RefreshErrorEnum
}

export function ajaxForRefresh(variables: {}, token: string) {
  return ajax<RefreshType>({
    url: url,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      refresh_token: token,
    },
    body: JSON.stringify({
      query: `query{
        refreshToken{
          access_token {
            issuedAt
            token
            expiredAt
          }
          user_id
          refresh_token {
            issuedAt
            token
            expiredAt
          }
        }
        }`,
      variables
    }),
    withCredentials: true,
  }).pipe(
    map((value): void => {

      let response = value.response.data.refreshToken;
      let refreshError: RefreshError = {
        error: "",
        errorType: RefreshErrorEnum.RefreshError
      }

      if (isUnvalidTokenError(value.response as any)) {
        LogoutDeleteCookie()
        refreshError.error = response.refresh_token.token
        throw refreshError;
      }

      if (value.response.errors)
        throw refreshError;

      const access_token_to_save: StoredTokenType = {
        issuedAt: new Date(response.access_token.issuedAt).getTime(),
        expiredAt: new Date(response.access_token.expiredAt).getTime(),
        token: response.access_token.token
      }

      const refresh_token_to_save: StoredTokenType = {
        issuedAt: new Date(response.refresh_token.issuedAt).getTime(),
        expiredAt: new Date(response.refresh_token.expiredAt).getTime(),
        token: response.refresh_token.token
      }
      setCookie({
        name: "access_token",
        value: JSON.stringify(access_token_to_save),
        expires_second: access_token_to_save.expiredAt / 1000,
        path: "/"
      });
      setCookie({
        name: "user_id",
        value: response.user_id,
        expires_second: access_token_to_save.expiredAt / 1000,
        path: "/"
      });
      setCookie({
        name: "refresh_token",
        value: JSON.stringify(refresh_token_to_save),
        expires_second: refresh_token_to_save.expiredAt / 1000,
        path: "/"
      });
    }),
    catchError((error) => {
      throw error
    })
  );
}

export function ajaxForLogout(token: string) {
  return ajax({
    url: url,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      refresh_token: token,
    },
    body: JSON.stringify({
      query: `query{
        logout
      }`,
    }),
    withCredentials: true,
  }).pipe(
    map((res: any): void => {

      if (res.response.errors) {
        console.error(JSON.stringify(res.response.errors))
        throw "error"
      }

      return res;
    }),
    catchError((error) => {
      throw error
    })
  );
}

const serviceUrl = "https://"+domainBack+"/foreign-service-auth"

export function ajaxForServiceLogin(serviceName:string) {
 window.location.href = serviceUrl+`?serviceName=${serviceName}`;
}

const _2fAuthUrl = "https://"+domainBack+"/2f-auth"

export interface _2fAuthResult{
  qrUrl:string,
  manualEntry:string,
  key:string
}

export function ajaxFor2fAuth(){
  return GetTokenObservable().pipe( mergeMap(()=>{
    const token: StoredTokenType = JSON.parse(getCookie("access_token")!)
   return ajax<_2fAuthResult>({
      url:_2fAuthUrl,
      method: "POST",
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token.token,
      }
  })}))
}

const _2fSetUrl = "https://"+domainBack+"/set-2f-auth";

export function axajSetUser2fAuth(key:string,code:string){
  return GetTokenObservable().pipe( mergeMap(()=>{
  const token: StoredTokenType = JSON.parse(getCookie("access_token")!)
   return ajax<_2fAuthResult>({
      url:_2fSetUrl+`?key=${key}&code=${code}`,
      method: "POST",
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token.token,
      }
  })}))
}

const _2fVerifyServiceUrl = "https://"+domainBack+"/verify-2f-auth";

export function ajaxVerifyUserCode(token:string,code:string){
    return ajax({
      url: _2fVerifyServiceUrl + `?token=${token}&code=${code}`
    })
}

const _2fDropUrl = "https://"+domainBack+"/drop-2f-auth"

export enum WayToDrop2f
{
    Code = 0,
    Email = 1
}

export function ajaxFor2fDrop(code:string,way:WayToDrop2f){

  return GetTokenObservable().pipe( mergeMap(()=>{
    const token: StoredTokenType = JSON.parse(getCookie("access_token")!)
     return ajax<string>({
        url:_2fDropUrl+`?code=${code}&way=${way}`,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token.token,
        }
    })}))
}

type navigateType = ReturnType<typeof useNavigate>;

export const getQueryObserver = (setError: (value: string) => void, setShowError: (value: boolean) => void, setLoginByToken: () => void, commitNavigate: navigateType, t: TFunction): Observer<any> => {
  return {
    next: (path) => {
      commitNavigate(path);
      setLoginByToken();
    },
    error: (value) => {

      value == t("Login.disabledUser") ? setError(value) : setError(t("Login.wrongCredentialsError"));
      setShowError(true);
    },
    complete: () => {
    }
  }
}


export function getCookie(name: string) {
  name = name + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return decodeURIComponent(c.substring(name.length, c.length));
    }
  }
  return null;
}

export function setCookie(cookieParams: setCookieParamas) {
  let s = cookieParams.name + '=' + encodeURIComponent(cookieParams.value) + ';';
  if (cookieParams.expires_second) {
    let d = new Date();
    d.setTime(d.getTime() + cookieParams.expires_second * 1000);
    s += ' expires=' + d.toUTCString() + ';';
  }
  if (cookieParams.path) s += ' path=' + cookieParams.path + ';';
  if (cookieParams.domain) s += ' domain=' + cookieParams.domain + ';';
  if (cookieParams.secure) s += ' secure;';
  document.cookie = s;
}

export function deleteCookie(name: string) {
  document.cookie = name + '=; expires=' + Date();
}

export function getTokenOrNavigate(isLoginRedirect: boolean = false) {
  const token = getCookie("refresh_token");
  if (!token && !isLoginRedirect) {
    return redirect("/Login");
  } else if (isLoginRedirect && token)
    return redirect("/");

  return token;
}

export type setCookieParamas = {
  name: string,
  value: string,
  expires_second?: number,
  path?: string,
  domain?: string,
  secure?: boolean
}