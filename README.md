Spoke
=====

App
---
The mobile app uses Phonegap to run in Android and iOS, the main code can be
found in `phonegap/www` which is then symlinked into the right places from
`phonegap/android/assets` and `ios` for the Android and iOS versions
respectively. You should be able to open the Eclipse project in
`phonegap/android` or the XCode project in `ios/spoke.xcodeproj` to run the
app in the right simulator or on a connected device.

App Testing
-----------
Tests for the app can be found in `phonegap/www/spec.html` which you can just
open in your browser locally to run (they use Jasmine).
