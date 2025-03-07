# Git_Practices

SOFTWARE LICENSE AGREEMENT

IMPORTANT: PLEASE READ THIS AGREEMENT BEFORE INSTALLING OR USING THIS SOFTWARE.

1. LICENSE
   MySampleApp ("Software") is licensed, not sold. By installing or using this Software, you agree to the terms of this agreement.

2. USAGE
   - You may install and use this Software on one device per license.
   - You may not modify, reverse engineer, decompile, or distribute this Software without permission.

3. OWNERSHIP
   - This Software is the intellectual property of the developer and is protected by copyright law.

4. LIMITATION OF LIABILITY
   - The Software is provided "as is" without any warranties.
   - The developer is not responsible for any damages arising from the use of this Software.

5. TERMINATION
   - This license will terminate if you fail to comply with any term.
   - Upon termination, you must uninstall and delete all copies of the Software.

6. CONTACT
   - For any questions, contact [your email or website].

By clicking "I Agree" and proceeding with the installation, you acknowledge that you have read and understood this agreement.

© 2025 MySampleApp. All rights reserved.




-----------

[Setup]
AppName=MySampleApp
AppVersion=1.0
DefaultDirName={pf}\MySampleApp
DefaultGroupName=MySampleApp
OutputDir=.
OutputBaseFilename=WpfFormApp
PrivilegesRequired=admin
WizardStyle=modern
LicenseFile=License.txt  ; ✅ Displays License Agreement before installation

[Files]
; ✅ Include the WPF application ZIP
Source: "setup.zip"; DestDir: "{tmp}"; Flags: deleteafterinstall

; ✅ Include the PostgreSQL installer

; ✅ Include the SQL script for database setup
Source: "CreateDatabaseAndSchema.sql"; DestDir: "{tmp}"; Flags: deleteafterinstall

; ✅ Include the License file
Source: "License.txt"; DestDir: "{app}"; Flags: onlyifdoesntexist uninsneveruninstall

[Run]
; ✅ Extract WPF app using PowerShell
Filename: "{cmd}"; Parameters: "/C powershell -Command ""Expand-Archive -Path '{tmp}\setup.zip' -DestinationPath '{app}' -Force"""; Flags: runhidden waituntilterminated

; ✅ Install PostgreSQL 16 silently (adjust if needed)

; ✅ Run the SQL script to create the database and schema
Filename: "{cmd}"; Parameters: "/C set PGPASSWORD=Admin && ""E:\PostgreSQL\16\bin\psql.exe"" -U postgres -h localhost -d postgres -f {tmp}\CreateDatabaseAndSchema.sql"; Flags: runhidden waituntilterminated

; ✅ Launch the WPF application after installation
Filename: "{app}\publish\WpfFormApp.exe"; Flags: nowait postinstall

[Icons]
; ✅ Create a shortcut for the WPF application on the desktop
Name: "{commondesktop}\MySampleApp"; Filename: "{app}\publish\WpfFormApp.exe"

; ✅ Create a shortcut in the Start menu
Name: "{group}\MySampleApp"; Filename: "{app}\publish\WpfFormApp.exe"

[Code]
var
  psqlPath: string;
  sqlFilePath: string;
  logFilePath: string;
  appExePath: string;
  ExecResult: Integer;

procedure RunPostgresSQL();
begin
  // PostgreSQL binary path
  psqlPath := 'E:\PostgreSQL\16\bin\psql.exe';  
  sqlFilePath := ExpandConstant('{tmp}\CreateDatabaseAndSchema.sql');  
  logFilePath := ExpandConstant('{tmp}\pg_install_log.txt');  
  appExePath := ExpandConstant('{app}\publish\WpfFormApp.exe');   // Path of the EXE to run

  // Ensure PostgreSQL is installed
  if not FileExists(psqlPath) then
  begin
    MsgBox('Error: PostgreSQL is not installed at ' + psqlPath, mbError, MB_OK);
    Exit;
  end;

  // Ensure SQL file exists
  if not FileExists(sqlFilePath) then
  begin
    MsgBox('Error: SQL file not found at ' + sqlFilePath, mbError, MB_OK);
    Exit;
  end;

  // Run SQL script using cmd.exe and check if it executes correctly
  if not Exec('cmd.exe', '/C set "PGPASSWORD=Admin" & "' + psqlPath + '" -U postgres -d postgres -f "' + sqlFilePath + '" > "' + logFilePath + '" 2>&1', '', SW_SHOW, ewWaitUntilTerminated, ExecResult) then
  begin
    MsgBox('Error: Failed to execute PostgreSQL script. Check log file at ' + logFilePath, mbError, MB_OK);
    Exit;
  end
  else
  begin
    MsgBox('Success: Database and schema created! Now launching application.', mbInformation, MB_OK);
  end;

  // Run the EXE file after successful database creation
  if FileExists(appExePath) then
  begin
    Exec(appExePath, '', '', SW_SHOW, ewNoWait, ExecResult);
  end
  else
  begin
    MsgBox('Warning: Application EXE not found at ' + appExePath, mbInformation, MB_OK);
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    RunPostgresSQL();
  end;
end;





----------

[Setup]
AppName=MySampleApp
AppVersion=1.0
DefaultDirName={pf}\MySampleApp
DefaultGroupName=MySampleApp
OutputDir=.
OutputBaseFilename=WpfFormApp
PrivilegesRequired=admin
WizardStyle=modern

[Files]
; ✅ Include the WPF application ZIP
Source: "setup.zip"; DestDir: "{tmp}"; Flags: deleteafterinstall

; ✅ Include the SQL script for database setup
Source: "CreateDatabaseAndSchema.sql"; DestDir: "{tmp}"; Flags: deleteafterinstall

[Run]
; ✅ Extract WPF app using PowerShell
Filename: "{cmd}"; Parameters: "/C powershell -Command ""Expand-Archive -Path '{tmp}\setup.zip' -DestinationPath '{app}' -Force"""; Flags: runhidden waituntilterminated

; ✅ Run the SQL script to create the database and schema
Filename: "{cmd}"; Parameters: "/C set PGPASSWORD=Admin && ""{code:GetPostgreSQLPath}"" -U postgres -h localhost -d postgres -f {tmp}\CreateDatabaseAndSchema.sql"; Flags: runhidden waituntilterminated

; ✅ Launch the WPF application after installation
Filename: "{app}\publish\WpfFormApp.exe"; Flags: nowait postinstall

[Icons]
; ✅ Create a shortcut for the WPF application on the desktop
Name: "{commondesktop}\MySampleApp"; Filename: "{app}\publish\WpfFormApp.exe"

; ✅ Create a shortcut in the Start menu
Name: "{group}\MySampleApp"; Filename: "{app}\publish\WpfFormApp.exe"

[Code]
var
  sqlFilePath: string;
  logFilePath: string;
  appExePath: string;
  ExecResult: Integer;

function GetPostgreSQLPath(): String;
var
  installPath: String;
begin
  // Try to get PostgreSQL path from Windows Registry
  if RegQueryStringValue(HKEY_LOCAL_MACHINE, 'SOFTWARE\PostgreSQL\Installations\postgresql-x64-16', 'Base Directory', installPath) then
  begin
    Result := installPath + '\bin\psql.exe';
  end
  else
  begin
    MsgBox('Error: PostgreSQL installation not found!', mbError, MB_OK);
    Result := '';
  end;
end;

procedure RunPostgresSQL();
var
  psqlPath: string;
begin
  psqlPath := GetPostgreSQLPath();
  sqlFilePath := ExpandConstant('{tmp}\CreateDatabaseAndSchema.sql');  
  logFilePath := ExpandConstant('{tmp}\pg_install_log.txt');  
  appExePath := ExpandConstant('{app}\publish\WpfFormApp.exe');  

  // Ensure PostgreSQL is installed
  if psqlPath = '' then
    Exit;
  
  // Ensure SQL file exists
  if not FileExists(sqlFilePath) then
  begin
    MsgBox('Error: SQL file not found at ' + sqlFilePath, mbError, MB_OK);
    Exit;
  end;

  // Run SQL script
  if not Exec('cmd.exe', '/C set "PGPASSWORD=Admin" & "' + psqlPath + '" -U postgres -d postgres -f "' + sqlFilePath + '" > "' + logFilePath + '" 2>&1', '', SW_SHOW, ewWaitUntilTerminated, ExecResult) then
  begin
    MsgBox('Error: Failed to execute PostgreSQL script. Check log file at ' + logFilePath, mbError, MB_OK);
    Exit;
  end
  else
  begin
    MsgBox('Success: Database and schema created! Now launching application.', mbInformation, MB_OK);
  end;

  // Run the EXE file after successful database creation
  if FileExists(appExePath) then
  begin
    Exec(appExePath, '', '', SW_SHOW, ewNoWait, ExecResult);
  end
  else
  begin
    MsgBox('Warning: Application EXE not found at ' + appExePath, mbInformation, MB_OK);
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    RunPostgresSQL();
  end;
end;


