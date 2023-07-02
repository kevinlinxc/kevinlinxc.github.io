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
### Pretty printing a Python object's functions and attributes
In everyday Python usage, you might use dir() to see an object's functions and attributes, but it's littered with __dunder__ methods
and the distinction between functions and attributes is not clear.  Here's a function that will print out the functions with "()" appended, and the attributes that aren't dunder methods:

```python
def ddir(obj):
    return [a + '()' if callable(getattr(obj, a)) else a
            for a in dir(obj) if not (a[:2] == '__' == a[-2:])]
```
Originally discovered [here](https://discuss.python.org/t/add-a-flag-hide-magic-names-in-dir/7276/2).


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
def progress(purpose, currentcount, maxcount):
   sys.stdout.write('\r')
   sys.stdout.write("{}: {} of {}, {.2f}%".format(purpose, currentcount+1, maxcount, (currentcount+1)/maxcount*100))
   sys.stdout.flush()
```

