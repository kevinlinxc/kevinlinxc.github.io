---
title: "Python Logbook"
center: false
date: 2022-11-19
summary: "Python patterns I find myself using a lot"
showReadingTime: false
_build:
  render: "false"
  list: "local"
---
### Listing files in a directory in numerical order

Normally, if you have a bunch of files like 1-1000.png, glob.glob will sort them alphabetically, instead of from 1-1000.
The way to have a correctly ordered list is to do this:

```python
import glob
import os
files = sorted(glob.glob('output/*'), key=len)
```
where `output` is the directory with all the files.


### Simple progress bar

```python
def progress(purpose,currentcount, maxcount):
   sys.stdout.write('\r')
   sys.stdout.write("{}: {} of {}, {.2f}%".format(purpose, currentcount+1, maxcount, (currentcount+1)/maxcount*100))
   sys.stdout.flush()
```

