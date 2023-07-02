---
title: "xkcdrandomizer"
date: 2021-04-21
description: "Twitter bot that creates permutations of XKCD comics"
summary: "Twitter bot that creates permutations of the popular XKCD comics. "
tags: ["engineering", "software"]
showAuthor: False
---
https://twitter.com/xkcdrandomizer (inactive now because of Twitter API changes)

[Source code](https://github.com/kevinlinxc/xkcdrandomizer)

## Intro
[xkcd](https://xkcd.com/) is a popular webcomic that has been around since 2005. It's known for its simple, yet clever, comics that are often about math, science, and technology.

I've been a fan for a long time, and I wanted to make a Twitter bot that would cut up the panels of the comic,
generate new comics, and post them on Twitter.


## The Technology
The pipeline for cutting up the comic panels and posting them to Twitter daily is as follows:

1. I use the [xkcd](https://pypi.org/project/xkcd/) package to randomly choose xkcd comics.
2. I cut the comic into panels using a modified [Kumiko](https://github.com/njean42/kumiko) package
3. I remove any cut panels that have too large/too small of an area/a bad aspect ratio
4. I resize, append, and repeat until I have the width of an average comic
5. I post the comic to Twitter using the [Tweepy](https://www.tweepy.org/) package
5. I use Serverless with Docker to package Kumiko, other requirements, and my source code
6. I deploy to AWS Lambda, which has a generous free tier allowing my bot to run until the heat death of the universe

These design choices are good because they allow me to run the bot for free, without needing to pay for a server
or have a computer running endlessly.

## Results

Although the bot hasn't really gained much traction, I'm still happy with the results. The comics, being completely
random, are usually incoherent, but sometimes they're funny.

Because of this project, I've gained experience with AWS and have a nice scaffold that I could deploy
another project on pretty easily.




