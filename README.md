My Portfolio/Blog website.


## Useful dev commands:

Run the Hugo site using Docker compose:
```
docker compose up -d --build && docker compose watch
```

or on Windows:

```
docker compose up -d --build; if ($?) { docker compose watch }
```


Run normally using Hugo:
```
hugo server  # runs the app locally with hugo
```

Update themes via Hugo:
```
hugo mod get -u # updates theme via hugo
```

Note that the submodule is only there for reference and easy copy/paste, the actual theme is managed via Hugo modules.
