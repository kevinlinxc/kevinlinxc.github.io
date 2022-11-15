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

I've had to do a bunch of discovery work to figure out how to customize the prebuilt templates to my liking,
and this is my place to store all my discovery work for future reference.

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

This met all the requirements, as it did render a gif, however, the resolution was not great.

What I settled on was using a YouTube embed instead. I'm not sure if it's the best solution, as it probably drains a whole lot of data. I had to make my own "youtubegif" shortcode ([here](https://github.com/kevinlinxc/kevinlinxc.github.io/commit/c6db9af41fcd5e4e511c94667e627dde4283a751#diff-b703d762f460ee960b154ad19649f30d22fd4272920a5d337cd2e9452dd7a96c)) because the
default YouTube shortcode doesn't have options to pass in controls and looping options.

Then, wherever I wanted to show a YouTube video as a pseudo-gif, I just needed to write
```
{{</* youtubegif ID */>}}
```
with the ID being the YouTube video's ID.

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


