# Introduction 
TODO: Give a short introduction of your project. Let this section explain the objectives or the motivation behind this project. 

# Getting Started
TODO: Guide users through getting your code up and running on their own system. In this section you can talk about:
1.	Installation process
2.	Software dependencies
3.	Latest releases
4.	API references

# Build and Test
TODO: Describe and show how to build your code and run the tests. 

# Contribute
TODO: Explain how other users and developers can contribute to make your code better. 

If you want to learn more about creating good readme files then refer the following [guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops). You can also seek inspiration from the below readme files:
- [ASP.NET Core](https://github.com/aspnet/Home)
- [Visual Studio Code](https://github.com/Microsoft/vscode)
- [Chakra Core](https://github.com/Microsoft/ChakraCore)

=============================================================
PMKUSUM: Latest Version Updated date 
======================================================
Updated By App Version Update | API Level : 

Version note:
Node = 20.19.4
npm  = 10.8.2
React native = 0.81.5
expo = 54.0.33

=======================================================
npx react-native bundle --platform android --dev true --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res && cd android && gradlew assembleDebug && cd..


npx react-devtools
cmd to view api logs
adb logcat "*:S" ReactNative:V ReactNativeJS:V


adb install f:\Helly\Project\PMKUSUM_adhar\android\app\build\outputs\apk\debug\app-debug.apk



taskkill /f /im node.exe
taskkill /f /im java.exe

adb shell input text "TN/PMKUSUM-B/3957"
adb shell input text "8130991801"
adb shell input text "Sharma@9898"
adb shell input text "SWPS/2021/17205"

eas build --platform android --profile preview --local
eas build --platform android --profile development