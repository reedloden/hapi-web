<?php
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

header('Access-Control-Allow-Origin: *');
header('Content-Type: text/javascript');

if ($_SERVER['HTTPS'] == 'on') {
  if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header('Access-Control-Max-Age: 86400');
    header('Access-Control-Allow-Headers: Authorization');
  } else {
    $user = $_SERVER['PHP_AUTH_USER'];
    $pass = $_SERVER['PHP_AUTH_PW'];

    $conn = curl_init();
    curl_setopt($conn, CURLOPT_URL, "https://api.voxel.net/version/1.0/?method=voxel.hapi.authkeys.read&format=json");
    curl_setopt($conn, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($conn, CURLOPT_FORBID_REUSE, true);
    curl_setopt($conn, CURLOPT_SSLVERSION, 3);
    curl_setopt($conn, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($conn, CURLOPT_USERPWD, "$user:$pass");

    echo curl_exec($conn);
    curl_close($conn);
  }
} else {
  echo '{"attributes":{"stat":"fail"},"err":{"attributes":{"code":"500","msg":"SSL required"}}}';
}
