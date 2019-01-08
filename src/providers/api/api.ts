import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage';
import { Globalization } from '@ionic-native/globalization';

/*
  Generated class for the ApiProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

/*
Svensk request: 
Accept-Language: sv-DK;q=1, en-DK;q=0.9, da-DK;q=0.8

English storbritannien:
Accept-Language: en-GB;q=1, sv-DK;q=0.9, en-DK;q=0.8, da-DK;q=0.7


Dansk med engelsk som andetsprog:
Accept-Language: da-DK;q=1, en-DK;q=0.9
*/

@Injectable()
export class ApiProvider {

  proxyApiUrl = 'https://aarsmobileapi.herokuapp.com';
  aarsApiUrl = 'https://mobileapi.aarstiderne.com';

  username: string = "";
  password: string = "";

  isAuthenticated: boolean = false;

  auth: string = "";

  constructor(public http: HttpClient, private storage: Storage, private globalization: Globalization) {
    console.log('Hello ApiProvider Provider');
  }

  getLocaleName() {
    return this.globalization.getLocaleName();
  }
  getPreferredLanguage() {
    return this.globalization.getPreferredLanguage();
  }

  getRoot() {
    return this.http.get(this.proxyApiUrl + '/v7/root', {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl, 'Accept-Language': 'da-DK;q=1, en-DK;q=0.9' })
    });
  }

  getNewitems() {
    return this.http.get(this.proxyApiUrl + '/v7/products/newitems', {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

  getBoxes() {
    return this.http.get(this.proxyApiUrl + '/v7/products/boxes', {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

  getMealboxes() {
    return this.http.get(this.proxyApiUrl + '/v7/products/families', {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

  getExtras() {
    return this.http.get(this.proxyApiUrl + '/v7/products/extra', {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

  getDetails(product) {
    var url = product.Details.replace(this.aarsApiUrl, this.proxyApiUrl);
    return this.http.get(url, {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

  getIngredients(ingredientsUrl) {
    var url = ingredientsUrl.replace(this.aarsApiUrl, this.proxyApiUrl);
    return this.http.get(url, {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

  getOrderingOptions(orderingOptionsUrl) {
    var url = orderingOptionsUrl.replace(this.aarsApiUrl, this.proxyApiUrl);
    return this.http.get(url, {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

  getAddOnTypes() {
    return this.http.get(this.proxyApiUrl + '/v7/products/addontypes', {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

  placeOrderCombined(orders) {
    var url = this.proxyApiUrl + "/v7/sales/createmultiple";
    return this.http.post(url, orders, {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

  placeOrder(order) {
    var url = this.proxyApiUrl + "/v7/sales";
    //console.log(">>>", order, url);
    return this.http.post(url, order, {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }



  // TODO: implement in mealboxes.ts
  setDefaultPersons(persons) {
    this.storage.set("selectedPersons", persons);
  }

  // TODO: implement in mealboxes.ts
  getDefaultPersons(persons) {
    this.storage.get("selectedPersons");
  }




  // USERS API
  removeAuthorizationHeaderValue() {
    this.auth = "";
  }

  setAuthorizationHeaderValue(username, password) {
    this.auth = "Basic " + btoa(username + ":" + password);
  }

  removeUserFromStorage() {
    this.storage.remove("user");
  }

  addUserToStorage(username, password) {
    this.storage.set("user", { username: username, password: password });
  }

  fakeUser() {
    console.warn("FAKING USER LOGIN!")
    this.storage.set('user', { "username": "mae@aarstiderne.com", "password": "gulerod" });
  }

  tryAutoLogin() {
    console.log("Running autologin()");
    //this.fakeUser();
    this.storage.get('user').then(user => {
      if (user && user.username && user.password) {
        console.log("- autologin(): have user in storage...");
        this.login(user.username, user.password).subscribe(apiUser => {
          if (apiUser["d"].Status === "Authenticated") {
            console.log("- autologin(): user is authenticated...", JSON.stringify(apiUser));
            this.addUserToStorage(this.username, this.password);
            this.isAuthenticated = true;
          } else {
            console.log("- autologin(): Sorry! Aser is NOT authenticated...", apiUser);
            this.removeAuthorizationHeaderValue();
            this.removeUserFromStorage();
            this.isAuthenticated = false;
          }
        },
          error => {
            console.log("api.ts:login() - error", error);
            this.removeAuthorizationHeaderValue();
            this.removeUserFromStorage();
            this.isAuthenticated = false;
          });
      } else {
        console.log("Cant autologin. Have no user in storage!");
        this.removeAuthorizationHeaderValue();
        this.removeUserFromStorage();
        this.isAuthenticated = false;
      }
    });
  }

  login(username, password) {
    console.log("Running api.ts:login()");
    this.setAuthorizationHeaderValue(username, password);
    return this.http.get(this.proxyApiUrl + '/v7/user', {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

  logout() {
    this.removeAuthorizationHeaderValue();
    this.removeUserFromStorage();
    this.isAuthenticated = false;
  }

  setUserUnauthenticated(auth: boolean) {
    this.isAuthenticated = auth;
  }

  userIsAuthenticated() {
    return this.isAuthenticated;
  }

  getSales() {
    return this.http.get(this.proxyApiUrl + '/v7/sales', {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

  deleteLine(line) {
    return this.http.delete(this.proxyApiUrl + '/v7/sales/' + line.LineId, {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

  calculatePrice(products) {
    return this.http.post(this.proxyApiUrl + '/v7/sales/calculateprice', products, {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

  getAddOns(itemNo, unitCode) {
    return this.http.get(this.proxyApiUrl + '/v7/addonsbyid/' + itemNo + "/" + unitCode, {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

  getMealboxOrderingOptions(products) {
    return this.http.post(this.proxyApiUrl + '/v7/sales/multipleorderingoptionscombined', products, {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

  getHasSubscriptions(){
    return this.http.get(this.proxyApiUrl + '/v7/sales/hassubscriptions', {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }


  getChef(url) {
    var url = url.replace(this.aarsApiUrl, this.proxyApiUrl);
    return this.http.get(url, {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

  getRecipe(url) {
    var url = url.replace(this.aarsApiUrl, this.proxyApiUrl);
    return this.http.get(url, {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }



  // icoud token https://ionicframework.com/docs/native/cloud-settings/
  private icloudToken: string = "7CD4F20C376420B1670CCC8FC7CDF81CC43B79B99D94A492349C61760863EE7C";

  getPushMessages() {
    return this.http.get(this.proxyApiUrl + '/v7/pushmessageslist/' + this.icloudToken, {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

  getPushMessageGroups() {
    return this.http.get(this.proxyApiUrl + "/v7/pushmessagelist/" + this.icloudToken, {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

  setPushMessage(type) {
    return this.http.post(this.proxyApiUrl + "/v7/pushmessages/" + type + "/" + this.icloudToken, {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

  deletePushMessage(type) {
    this.http.delete(this.proxyApiUrl + "/v7/pushmessages/" + type + "/" + this.icloudToken, {
      headers: new HttpHeaders({ "Authorization": this.auth, "Target-URL": this.aarsApiUrl })
    });
  }

}
