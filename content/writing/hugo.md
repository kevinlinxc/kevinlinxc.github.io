---
title: "Hugo Logbook"
center: false
date: 2022-11-15
summary: "Logbook for Hugo"
showReadingTime: false
_build:
  render: "false"
  list: "local"
---
So, this site is written with the static website framework, Hugo.

I've had to do a bunch of discovery work to figure out how to use it,
and this is my place to store all my discovery work for future reference.

## Running Hugo Locally with Docker
It's relatively straightforward to run Hugo sites with Docker, but the tricky part is to get it to update when changes are made to files, as is normally the case when running
with `hugo server`. One solution is to mount a volume, but I found a far more simple solution is to use the experimental "watch" feature of Docker compose. Note that you need to have Docker updated
to have this feature.

Then, you just need two files in your project directory: `docker-compose.yml` and `Dockerfile`.

Dockerfile:
```Dockerfile
FROM hugomods/hugo:latest

COPY . /src/

EXPOSE 1313

ENTRYPOINT [ "hugo", "server", "--bind=0.0.0.0"] 
```

docker-compose.yml:
```yaml
version: '3'
services:
  hugo:
    build: .
    ports:
      - "1313:1313"
    x-develop:
      watch:
        - action: sync
          path: .
          target: /src/
```

Finally, to run it, you just need to run [Docker](https://docs.docker.com/), and then in a terminal, go to your project repository and run 

```
docker compose up -d && docker compose alpha watch
```
in Bash/Zsh, or
```
docker compose up -d; docker compose alpha watch
```
on Powershell.


The first half spins up the Dockerfile into a container, which runs the Hugo server, and the second half watches for changes and updates the container.

Going to localhost:1313 should show the site running, and you could run this site without having Go or Hugo installed!


## Rendering Latex anywhere on a page
With Katex, it turns out this is really easy, you just need to have this code on your page somewhere: https://katex.org/docs/autorender.html#usage

Anything with the delimiters will be replaced with rendered Latex. The rendering can be customized with passed options to the function, or with CSS as well.


## Concatenating strings for display
I wanted to display double dollar signs on the ends of my latex, so I needed a way to concatenate strings. The + sign didn't do it, but this did:

[https://blog.anantshri.info/concatinating-strings-in-hugo/](https://blog.anantshri.info/concatinating-strings-in-hugo/)

The resultant line was:

`{{ printf "%s" "$$" | printf "%s%s" .Params.latex | printf "%s%s" "$$" | printf "%s" }}`



## Playing gifs in Markdown/Hugo

I wanted to play gifs on my [video editing portfolio page](https://kevinlinxc.com/video_editing/) because that would mean the people visiting
the page wouldn't need to hit play on a bunch of YouTube videos.

So, my first attempt was to render all my work as gifs and to just display them in markdown with
```
![](pathto.gif)
```

However, the gifs were around 100-300mb big, and even with Git LFS configured I ran out of bandwidth in like
3 site visits so storing the gifs in the repo was not an option.

The next thing I tried was hosting on Gfycat.

This meant I would visit the gfycat link like https://gfycat.com/loathsomeblackcobra.gif and copy the `<video>` tag, e.g.
```
<video autoplay="" loop="" muted="" playsinline="" class="video"><source id="mp4Source" src="https://giant.gfycat.com/LoathsomeBlackCobra.mp4" type="video/mp4"><source id="gifSource" src="https://thumbs.gfycat.com/LoathsomeBlackCobra-size_restricted.gif" type="image/gif"></video>
```

This met all the requirements, as it did render a gif, however, the resolution was not great. Also, in 2023, Gfycat got acquired by Snap and shut down, which meant all my gifs were gone.

What I settled on was using a YouTube embed instead. I'm not sure if it's the best solution, as it probably drains a whole lot of data. I had to make my own "youtubegif" shortcode ([here](https://github.com/kevinlinxc/kevinlinxc.github.io/commit/c6db9af41fcd5e4e511c94667e627dde4283a751#diff-b703d762f460ee960b154ad19649f30d22fd4272920a5d337cd2e9452dd7a96c)) because the
default YouTube shortcode doesn't have options to pass in controls and looping options.

Then, wherever I wanted to show a YouTube video as a pseudo-gif, I just needed to write
```
{{</* youtubegif ID */>}}
```
with the ID being the YouTube video's ID. This makes the video autoplay, loop, and have no controls, which is exactly what I wanted.

Links:
* https://discourse.gohugo.io/t/how-do-i-find-the-default-shortcode-source-code/41465/4
* https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/shortcodes/youtube.html
* https://jameshfisher.com/2017/08/30/how-do-i-make-a-full-width-iframe/


## Custom domain
I followed this guide for setting up my GoDaddy domain with GitHub Pages:
https://jinnabalu.medium.com/godaddy-domain-with-github-pages-62aed906d4ef


## GitHub Pages rendering README.md instead of main site
In case I forget how stupid this was, the reason my main page was a rendered README instead of the home page of my website was that my baseURL was commented out in config.toml:
https://github.com/kevinlinxc/kevinlinxc.github.io/commit/2fcda5fd710cb638170860d5dcfb3a130f3c26f5


## Favicon not being updated
I added favicons to the static folder as the documentation suggested, but nothing was being updated. It turned out I needed to clear the cache from Firefox's settings, not just on the page itself.


