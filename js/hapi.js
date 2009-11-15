/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the hAPI JS Library.
 *
 * The Initial Developer of the Original Code is
 * Ryan Flint <rflint+hapi-web@gmail.com>.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

function hAPI() {
  // Check if there's an existing session, authenticate otherwise.
  this.authenticate();
}
hAPI.prototype = {
  authenticated: false,
  _key: "",
  _secret: "",
  _apiurl: "https://api.voxel.net/version/1.0/",
  // XXX Remove this once Voxel ticket #1094986 is fixed
  _apiproxy: "https://screwedbydesign.com/hapi/proxy.php",

  authenticate: function(aUsername, aPassword, aCallback) {
    var tokens = document.cookie.split(";");
    for (var i = 0; i < tokens.length; i++) {
      var cookie = tokens[i].replace(/^\s+/, "").replace(/\s+$/, "");
      cookie = cookie.split("=");
      if (cookie[0] == "hapi_key")
        this._key = cookie[1];
      if (cookie[0] == "hapi_secret")
        this._secret = cookie[1];
    }

    if (this._key && this._secret) {
      this.authenticated = true;
    } else if (aUsername && aPassword) {
      var self = this;
      function callback(result, status) {
        if (result.authkey) {
          self._key = result.authkey.key;
          self._secret = result.authkey.secret;
          var secure = (document.location.protocol == "https:") ? ";secure" : "";
          document.cookie = "hapi_key=" + self._key + secure;
          document.cookie = "hapi_secret=" + self._secret + secure;
          self.authenticated = true;
          aCallback(status);
        } else {  
          this.authenticated = false;
          if (aCallback)
            aCallback(status);
        }
      }

      var data = {};
      data.auth = {user: aUsername, pass: aPassword};

      // XXX Remove this once Voxel ticket #1094986 is fixed
      // data.url = this._apiurl + "?method=voxel.hapi.authkeys.read&format=json"
      data.url = this._apiproxy;

      this._makeRequest("GET", data, callback);
    } else {
      this.authenticated = false;
      if (aCallback)
        aCallback({code: 500, msg: "Username and password are required"});
    }
  },

  _makeRequest: function(aHttpMethod, aData, aCallback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(aEvent) {
      if (xhr.readyState == 4) {
        if (!aCallback)
          return;

        if (xhr.status == 200) {
          var res = JSON.parse(xhr.responseText);
          if (res.attributes.stat == "ok") {
            delete res.attributes;
            aCallback(res, {code: 200, msg: "ok"});
          }
          else
            aCallback({}, {code: res.err.attributes.code,
                           msg: res.err.attributes.msg});
        }
        else
          aCallback({}, {code: xhr.status, msg: "server error"});
      }
    };

    xhr.open(aHttpMethod, aData.url, aData.async || true);

    if (aData.auth)
      xhr.setRequestHeader("Authorization", "Basic " +
                           btoa(aData.auth.user + ":" + aData.auth.pass));

    if (aData.postData)
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.send(aData.postData || null);
  },

  request: function(aMethod, aData, aCallback) {
    if (typeof aData == "function")
      aCallback = aData;

    function flatten(obj, isSig) {
      var arr = [];
      for (var key in obj) {
        if (isSig)
          arr.push(key + "" + obj[key]);
        else
          arr.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
      }
      return arr;
    }

    var urlParams = {
      method: aMethod,
      key: this._key,
      format: "json",
      timestamp: this._generateTimestamp()
    };

    var sig = (flatten(aData, true).concat(flatten(urlParams, true))).sort();
    urlParams.api_sig = md5(this._secret + sig.join(""));

    var data = {};
    data.url = this._apiurl + "?" + flatten(urlParams, false).join("&");
    data.postData = flatten(aData, false).join("&");

    this._makeRequest("POST", data, aCallback);
  },

  _generateTimestamp: function() {
    function pad(s, l) {
      s = s.toString();
      while (s.length < l)
        s = '0' + s;
      return s;
    }

    var date = new Date();
    return pad(date.getUTCFullYear(), 4) + "-" +
           pad(date.getUTCMonth() + 1, 2) + "-" +
           pad(date.getUTCDate(), 2) + "T" +
           pad(date.getUTCHours(), 2) + ":" +
           pad(date.getUTCMinutes(), 2) + ":" +
           pad(date.getUTCSeconds(), 2) + "Z";
  },

  test: function(aParams) {
  }
};

var md5;
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */
(function(){function n(d){d=o(d);d=p(q(r(d),d.length*8));for(var a="0123456789abcdef",b="",c=0;c<d.length;c++){var e=d.charCodeAt(c);b+=a.charAt(e>>>4&15)+a.charAt(e&15)}return b}md5=n;function o(d){for(var a="",b=-1,c,e;++b<d.length;){c=d.charCodeAt(b);e=b+1<d.length?d.charCodeAt(b+1):0;if(55296<=c&&c<=56319&&56320<=e&&e<=57343){c=65536+((c&1023)<<10)+(e&1023);b++}if(c<=127)a+=String.fromCharCode(c);else if(c<=2047)a+=String.fromCharCode(192|c>>>6&31,128|c&63);else if(c<=65535)a+=String.fromCharCode(224| c>>>12&15,128|c>>>6&63,128|c&63);else if(c<=2097151)a+=String.fromCharCode(240|c>>>18&7,128|c>>>12&63,128|c>>>6&63,128|c&63)}return a}function r(d){for(var a=Array(d.length>>2),b=0;b<a.length;b++)a[b]=0;for(b=0;b<d.length*8;b+=8)a[b>>5]|=(d.charCodeAt(b/8)&255)<<b%32;return a}function p(d){for(var a="",b=0;b<d.length*32;b+=8)a+=String.fromCharCode(d[b>>5]>>>b%32&255);return a}function q(d,a){d[a>>5]|=128<<a%32;d[(a+64>>>9<<4)+14]=a;a=1732584193;for(var b=-271733879,c=-1732584194,e=271733878,f=0;f< d.length;f+=16){var k=a,s=b,t=c,u=e;a=g(a,b,c,e,d[f+0],7,-680876936);e=g(e,a,b,c,d[f+1],12,-389564586);c=g(c,e,a,b,d[f+2],17,606105819);b=g(b,c,e,a,d[f+3],22,-1044525330);a=g(a,b,c,e,d[f+4],7,-176418897);e=g(e,a,b,c,d[f+5],12,1200080426);c=g(c,e,a,b,d[f+6],17,-1473231341);b=g(b,c,e,a,d[f+7],22,-45705983);a=g(a,b,c,e,d[f+8],7,1770035416);e=g(e,a,b,c,d[f+9],12,-1958414417);c=g(c,e,a,b,d[f+10],17,-42063);b=g(b,c,e,a,d[f+11],22,-1990404162);a=g(a,b,c,e,d[f+12],7,1804603682);e=g(e,a,b,c,d[f+13],12,-40341101); c=g(c,e,a,b,d[f+14],17,-1502002290);b=g(b,c,e,a,d[f+15],22,1236535329);a=h(a,b,c,e,d[f+1],5,-165796510);e=h(e,a,b,c,d[f+6],9,-1069501632);c=h(c,e,a,b,d[f+11],14,643717713);b=h(b,c,e,a,d[f+0],20,-373897302);a=h(a,b,c,e,d[f+5],5,-701558691);e=h(e,a,b,c,d[f+10],9,38016083);c=h(c,e,a,b,d[f+15],14,-660478335);b=h(b,c,e,a,d[f+4],20,-405537848);a=h(a,b,c,e,d[f+9],5,568446438);e=h(e,a,b,c,d[f+14],9,-1019803690);c=h(c,e,a,b,d[f+3],14,-187363961);b=h(b,c,e,a,d[f+8],20,1163531501);a=h(a,b,c,e,d[f+13],5,-1444681467); e=h(e,a,b,c,d[f+2],9,-51403784);c=h(c,e,a,b,d[f+7],14,1735328473);b=h(b,c,e,a,d[f+12],20,-1926607734);a=i(a,b,c,e,d[f+5],4,-378558);e=i(e,a,b,c,d[f+8],11,-2022574463);c=i(c,e,a,b,d[f+11],16,1839030562);b=i(b,c,e,a,d[f+14],23,-35309556);a=i(a,b,c,e,d[f+1],4,-1530992060);e=i(e,a,b,c,d[f+4],11,1272893353);c=i(c,e,a,b,d[f+7],16,-155497632);b=i(b,c,e,a,d[f+10],23,-1094730640);a=i(a,b,c,e,d[f+13],4,681279174);e=i(e,a,b,c,d[f+0],11,-358537222);c=i(c,e,a,b,d[f+3],16,-722521979);b=i(b,c,e,a,d[f+6],23,76029189); a=i(a,b,c,e,d[f+9],4,-640364487);e=i(e,a,b,c,d[f+12],11,-421815835);c=i(c,e,a,b,d[f+15],16,530742520);b=i(b,c,e,a,d[f+2],23,-995338651);a=j(a,b,c,e,d[f+0],6,-198630844);e=j(e,a,b,c,d[f+7],10,1126891415);c=j(c,e,a,b,d[f+14],15,-1416354905);b=j(b,c,e,a,d[f+5],21,-57434055);a=j(a,b,c,e,d[f+12],6,1700485571);e=j(e,a,b,c,d[f+3],10,-1894986606);c=j(c,e,a,b,d[f+10],15,-1051523);b=j(b,c,e,a,d[f+1],21,-2054922799);a=j(a,b,c,e,d[f+8],6,1873313359);e=j(e,a,b,c,d[f+15],10,-30611744);c=j(c,e,a,b,d[f+6],15,-1560198380); b=j(b,c,e,a,d[f+13],21,1309151649);a=j(a,b,c,e,d[f+4],6,-145523070);e=j(e,a,b,c,d[f+11],10,-1120210379);c=j(c,e,a,b,d[f+2],15,718787259);b=j(b,c,e,a,d[f+9],21,-343485551);a=l(a,k);b=l(b,s);c=l(c,t);e=l(e,u)}return[a,b,c,e]}function m(d,a,b,c,e,f){d=l(l(a,d),l(c,f));return l(d<<e|d>>>32-e,b)}function g(d,a,b,c,e,f,k){return m(a&b|~a&c,d,a,e,f,k)}function h(d,a,b,c,e,f,k){return m(a&c|b&~c,d,a,e,f,k)}function i(d,a,b,c,e,f,k){return m(a^b^c,d,a,e,f,k)}function j(d,a,b,c,e,f,k){return m(b^(a|~c),d,a, e,f,k)}function l(d,a){var b=(d&65535)+(a&65535);d=(d>>16)+(a>>16)+(b>>16);return d<<16|b&65535}})();
