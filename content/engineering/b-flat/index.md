---
title: "B-Flat"
date: 2021-08-31
description: "Flattening sheet music into a single row so it can be read/autoscrolled on a cell phone."
summary: "Flattening sheet music into a single row so it can be read/autoscrolled on a cell phone."
tags: ["engineering", "software", "computer vision"]
showAuthor: False
---
**B-Flat** was a short project I made in Python that flattens sheet music into a single row so it can be read/autoscrolled on a cell phone.

Here is the result in action:
{{< youtubegif eH59qLFLyjQ >}}

## Problem
I practice piano occasionally, but whenever the opportunity comes up to play one, I'm usually unprepared without my sheet music or a tablet. However, I always have my phone with me, so I wanted a way to read sheet music on my phone. PDFs are too small to read or would require too much panning while playing, so a different solution was needed.

## Solution
I had previously worked on an AutoScrolling app for the phone. If I could just flatten the sheet music into a picture with a single row, I could use the same app to scroll through it.

I found someone else's Python function that could find the rows of sheet music pretty well by discarding rows with low
contrast, but I had to add a bit of user input so that there wouldn't be any white space on the sides.

The end result is that anyone can download my script, run it on a PDF (takes ~10 seconds), and receive a flattened image that can be read on a phone.

Example of the flattened sheet music (very skinny and long):

![flattened sheet music](flattened.png)

Here is a video of it being played on my phone (imagine the phone is placed sideways on a piano stand):

{{< youtubegif eH59qLFLyjQ >}}

## Pitfalls
The biggest problem with this solution is that music is dynamic, sometimes the tempo changes or sometimes a row will
have more measures than others, and what this means is that a single speed is not always satisfactory when autoscrolling.
One solution is to encode the speed into the image, but I find this solution not very elegant as the user
would have to do a lot of work for each piece they wanted to play. For now, playing sheet music on a phone
without any peripherals remains unsolved.
