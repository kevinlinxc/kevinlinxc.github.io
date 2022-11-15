---
title: "UBC Rover"
date: 2021-09-04
description: "Student Engineering Design team that works on autonomous land rovers"
summary: "Student Engineering Design team that works on autonomous land rovers"
tags: ["engineering", "software", "electrical", "integration"]
showAuthor: False
---

## Summary
UBC Rover (formerly known as UBC Snowbots) is the University of British Columbia's autonomous rover design team. I was on the team from my first year at university (2018) until I left the team in 2021. This was my first experience working on an interdisciplinary engineering team, and I definitely owe a lot of my engineering experience to the team. I eventually rose to the role of integration lead, meaning I was interfacing all the components that the team was working on.

## 2018-2019 Work
When I joined the team, I was initially placed on the electrical team, as I didn't have much software experience yet.

Unfortunately, I didn't take many pictures or videos of my early work while I was on Snowbots. Some things I remember from these two years was:

- Learning about the existing power circuit, and learning how e-stops and relays worked for the first time
- Researching suitable light, non-flammable materials to use as the base of our power circuit
- Recreated the power circuit using simpler parts (Arduinos, thinner wires) and low power
- Learning to strip and crimp wires
- Troubleshooted wireless "Compex" brand router that we sourced that wasn't working for a long time

## 2020-2021
### Software
As 2020 reared its ugly head, I switched to the software team as the rover software interested me greatly.

This role was where I learned complex Git workflows like forking, using Continuous Integration (we used TravisCI), and also where I learned to use Linux and bash.

#### ROS
The main software used at Snowbots was a framework called ROS, or Robot Operating System. It's very commonly used in many robotics operations because it allows easy to understand communication between many parts of a system. ROS comes in two flavours, Python and C++, and our team used C++ due to the increased speed and reliability.

#### Pro Controller
One of my main tasks was to receive commands in ROS (C++) from a Nintendo Switch Pro Controller. There was already existing support in ROS for Xbox and Playstation controllers, but I figured it wouldn't be hard to add this new controller. Spoilers: it was pretty hard.

If I remember correctly, I had to install several drivers that eventually created an xinput device that I could detect with the Linux command line, and eventually that translated to being able to see the commands in C++ and ROS.

As a demonstration of my work, I managed to use a model made by a previous member in the simulation software Gazebo, and controlled its movement using the controller (apologies for the low resolution):

{{<youtube R6UnZ7p2Rd4>}}

#### Phidget Motors
Similar to the Pro Controller, another task I had was to interface ROS C++ Code with Phidget brand brushless DC motors. This task was easier than the controller because the Phidget C++ library was documented on their website, however, figuring out all of the electrical connections proved to be tricky.
Ultimately, this was just a matter of reading documentation and reaching out to their support whenever I got blocked.

A picture of all the motors, their drivers, and their batteries:

![](motors.jpg)



### Integration

As I was growing in seniority within the team and gaining multidisciplinary experience from my program, it made sense to move into an integration role. In fact, that was pretty much already what I was doing by controlling the motors with ROS.

#### Motor - Controller integration
One of the first things I did that furthered the integration of our systems was drive the BLDC motors with the Pro Controller:

{{<youtube Fh1q8bLSTMI>}}

In essence, the Pro Controller signals are being translated to an xinput device which is getting translated to a ROS Twist message by the code I wrote in 2020, which is then being converted into individual commands for the 6 motors using the code I wrote in 2021.

I did some further integration with our wireless routers and our Intel NUC, the computer that would actually be on our rover, resulting in this awesome integration test where our Pro Controller was controlling the motors without being connected to the same computer:

#### Full drive control + networking integration
{{<youtube wlKjPxhkb84>}}


#### Leaving the team
Shortly after doing this last end-to-end test, I left the team to put more time into UBC AeroDesign. The mechanical team of Snowbots had stagnated and hadn't built anything while I was on the team, partially due to COVID, so I was hoping to see a faster design cycle with Aero. The team went on to do well without me, and you can see my motor and controller work in action in this promotional video:

{{<youtube zTYScrHvHgI>}}





