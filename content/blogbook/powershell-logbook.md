---
title: "Powershell Logbook"
center: false
date: 2022-11-28
summary: "PS patterns I find myself using a lot"
showReadingTime: false
_build:
  render: "false"
  list: "local"
---

PowerShell is the main shell used in VS Code and JetBrains IDEs on Windows computers, so it's good to know some optimizations.

## Adding a permanent alias e.g. g = git

First, find where the user profile is. This is like the ~/.bashrc file but for PowerShell, meaning it runs every time you open a new PowerShell window.


```
echo $profile
C:\Users\Kevin\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
```

Navigate to this folder. It might not exist, so create the directories and the file.

Edit the file and add your alias to the file like so:

```
New-Alias g git
```

Since this will run every time you open a new PowerShell window, you can now use `g` as an alias for `git`.

Make sure to restart your PowerShell window for the new profile to take effect.
