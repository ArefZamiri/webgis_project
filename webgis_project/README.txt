** Hi, This is Aref . I hope my explanations are useful for you . 


* Use the following script to disable CORS in Chrome browser (Paste it in the command prompt) :

‪C:\Program Files\Google\Chrome\Application\chrome.exe


* Use the following script to disable CORS in ARC browser (Paste it in the command prompt) :

"C:\Users\Asus\AppData\Local\Microsoft\WindowsApps\arc.exe" --disable-web-security --user-data-dir="C:\my-cors-profile"


* Use the following script to disable CORS in Edge browser (Paste it in the command prompt) :

"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --disable-web-security --user-data-dir="C:\my-cors-profile"


* Disable CORS in  Firefox browser :

Type about:config in the Firefox address bar and press Enter

In the search bar at the top of the configuration page, type security.fileuri.strict_origin_policy.

When you find the security.fileuri.strict_origin_policy preference, double-click it to toggle its value to false


My resources :
https://openlayers.org/en/latest/examples/bing-maps.html
https://learn.microsoft.com/en-us/bingmaps/v8-web-control/map-control-concepts/custom-overlays/html-pushpin-overlay
https://openlayers.org/en/latest/examples/cartodb.html
https://openlayers.org/en/latest/apidoc/module-ol_source_CartoDB-CartoDB.html
https://openlayers.org/en/latest/examples/simple.html
https://openlayers.org/en/latest/apidoc/module-ol_source_OSM-OSM.html
