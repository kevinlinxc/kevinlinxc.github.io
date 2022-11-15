---
title: "Hugo logbook"
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

## Playing gifs on this site.

I wanted to play gifs on my video editing portfolio because that would mean the people visiting
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

What I settled on was using a YouTube embed instead. I'm not sure if it's the best solution, as it probably drains a whole lot of data. I had to make my own "youtubegif" shortcode because the
default youtube shortcode doesn't have options to pass in controls and looping options.

Links:
* https://discourse.gohugo.io/t/how-do-i-find-the-default-shortcode-source-code/41465/4
* https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/shortcodes/youtube.html
* https://jameshfisher.com/2017/08/30/how-do-i-make-a-full-width-iframe/


