---
title: "Adding Aliases in PowerShell, Git Bash, CMD, and Zsh"
center: false
date: 2023-07-01
summary: "How to add aliases/terminal functions to Windows terminals"
showReadingTime: false
_build:
  render: "false"
  list: "local"
---
Adding aliases has the potential to save a lot of time, but in the past I've avoided putting in the initial work, especially because 
of the various Windows terminals that I would use. Well, I finally bit the bullet and added aliases to all of them, and I'm going to show you how to do it.

Let's say I want to add two useful aliases to all of my terminals. 

The first, `codex` changes directory into my design team's mono-repo, located at `C:\Users\Kevin\src\codex`. 

The second is `set-upstream`, a shortcut for `git push -u origin HEAD`, which devs will know is a command you have to push every time you push a
git branch for the first time. Note that the `-u` flag is for `--set-upstream`, and `HEAD` automatically chooses the current branch, which would normally be typed out.

## PowerShell
PowerShell "aliases" can't be multiple words long, so we actually need to make functions.

To do this, we need to edit the PowerShell profile, which is a script that runs every time you open PowerShell.
To do this, open PowerShell and run `notepad $PROFILE`. This will open the profile in Notepad, and if it doesn't exist, it will allegedly create it (according to Copilot). If for some reason that command doesn't work, the profile is usually at `C:\Users\<Username>\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`.

Next, add these lines to the file:

```powershell
function codex {
    cd C:\Users\Kevin\src\codex
}
function set-upstream {
    git push -u origin HEAD
}
```

After saving and opening a new PowerShell window, you should be able to run `codex` and `set-upstream`!


## Git Bash
The only complication for adding aliases to Git Bash is that the paths are somewhat different.

First, enter git bash and run `nano ~/.bashrc`, or if you're scared of nano, run `notepad ~/.bashrc`. This will open or create the bash profile which is run at the startup of every Git Bash window.

Then, add these lines to the file:

```bash
alias codex='cd /c/Users/Kevin/src/codex'
alias set-upstream='git push -u origin HEAD'
```

Reload git bash or run ~/.bashrc, and `codex` and `set-upstream` will work.


## CMD
Adding aliases to CMD is horribly inelegant for some reason, and I would recommend just not using CMD altogether.
The way to do it without using registry commands is to make batch files and put them in a folder that's in your PATH, like `C:\Windows\System32\`.

So, open Notepad as an administrator, and make a file called `codex.bat` and put it in `C:\Windows\System32\`. The contents of the file should be:

```batch
cd C:\Users\Kevin\src\codex
```

Similarly, make a file called `set-upstream.bat` and put it in `C:\Windows\System32\`. The contents of the file should be:

```batch
git push -u origin HEAD
```

Then, you can run `codex` and `set-upstream` from anywhere in CMD (it'll print out the actual command though, which can be seen as an upside or downside).

## Zsh
Zsh isn't installed by default on Windows, but it's the default shell on Macs, and I enjoy using it on WSL, so I'm including it here.


This is pretty much the same as the git bash instructions:

Open zsh and run `nano ~/.zshrc`.

Then, add these lines to the file:

```bash
alias codex="cd ~/src/codex"
alias set-upstream="git push -u origin HEAD"
```

Note that the path is different because WSL sets the home directory C:\Users\Kevin to be at '~'.

Reload zsh or run `source ~/.zshrc`, and `codex` and `set-upstream` will work.

## Conclusion

There you have it. Enjoy saving a day of your life across your career by adding aliases to your terminals.