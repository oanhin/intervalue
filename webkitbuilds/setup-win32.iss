; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define MyAppName "Intervalue-TN"
#define MyAppPackageName "Intervalue-TN"
#define MyAppVersion "2.1.0"
#define MyAppPublisher "Intervalue"
#define MyAppURL "https://Intervalue.org"
#define MyAppExeName "Intervalue-TN.exe"

[Setup]
; AppId={{804636ee-b017-4cad-8719-e58ac97ffa5c}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={pf}\{#MyAppName}
DefaultGroupName={#MyAppName}
OutputBaseFilename={#MyAppPackageName}-win32
; SourceDir=../../Intervaluebuilds
OutputDir=../../Intervaluebuilds
Compression=lzma
SolidCompression=yes
; SetupIconFile=../public/img/icons/icon-white-outline.ico
UninstallDisplayIcon={app}/icon.ico

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
; Name: "french"; MessagesFile: "compiler:Languages\French.isl"
; Name: "japanese"; MessagesFile: "compiler:Languages\Japanese.isl"
; Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Registry]
Root: HKLM; Subkey: "Software\Classes\Intervalue-tn"; Flags: uninsdeletekey
Root: HKLM; Subkey: "Software\Classes\Intervalue-tn"; ValueType: string; ValueName: ""; ValueData: "URL:Intervalue Protocol"
Root: HKLM; Subkey: "Software\Classes\Intervalue-tn"; ValueType: string; ValueName: "URL Protocol"; ValueData: ""
Root: HKLM; Subkey: "Software\Classes\Intervalue-tn\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\icon.ico"
Root: HKLM; Subkey: "Software\Classes\Intervalue-tn\shell"
Root: HKLM; Subkey: "Software\Classes\Intervalue-tn\shell\open"
Root: HKLM; Subkey: "Software\Classes\Intervalue-tn\shell\open\command"; ValueType: string; ValueName: ""; ValueData: "{app}\{#MyAppExeName} ""%1"""

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Source: "..\Intervaluebuilds\Intervalue-test\win32\Intervalue.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\Intervaluebuilds\{#MyAppPackageName}\win32\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "../public/img/icons/icon-white-outline.ico"; DestDir: "{app}"; DestName: "icon.ico"; Flags: ignoreversion
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; IconFilename: "{app}/icon.ico"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}/icon.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

