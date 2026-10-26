# Android app build and install

The APK download in the website is produced by `npm run build:android`. It builds the
web app, syncs the Capacitor Android project, assembles a debug-signed APK, and copies
the APK to `public/downloads/unibot.apk` and `dist/downloads/unibot.apk`. The APK is
direct-installable on Android 7.0 or later; Android may ask you to allow installs from
the browser used to download it.

Install Node.js, JDK 21, and Android SDK Platform 36 plus Build Tools 36.0.0. Set
`ANDROID_HOME` (or `ANDROID_SDK_ROOT`) to the SDK directory and `JAVA_HOME` to JDK 21.
Run `npm run build:android` from `client`. For a hosted deployment, set
`VITE_API_BASE_URL` to the publicly reachable HTTPS backend URL ending in `/api` before
building.

If `VITE_API_BASE_URL` is not set, the build script points the app at this computer's
private LAN address on port 5000. That APK is only useful while the phone and computer
are on the same Wi-Fi and the computer allows inbound connections on port 5000. This
development APK uses HTTP for that local connection; use HTTPS for public distribution.
The generated APK is debug-signed and is intended for direct testing, not Play Store
release.
