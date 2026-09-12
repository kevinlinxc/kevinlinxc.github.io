---
title: "Selling my CPEN 312 FPGA Board"
center: false
date: 2023-02-01
summary: "Remembering how to program my FPGA so I could prove it still worked."
showReadingTime: false
_build:
  render: "false"
  list: "local"
---

## Introduction
For the CPEN 312 class, I bought a DE0-CV FPGA board. I used it for class and wanted to resell it a few years later. The buyer wanted me to prove that it worked, so I set to 
reminding myself how to program it. This is a small writeup of some challenges I ran into and their solutions.

## The Process

First, I plugged in the two cables for the board. One goes into the wall to power it, and the other to a USB on my computer to program it. 

Reviewing some slides, I saw that I had to program the board to work as a 8052 device using Quartus, which I thankfully still had installed. However, when I went to Tools -> Programmer,
it wasn't detecting my board. This was because the USB blaster driver was not set up properly. 

I tried following the Windows 10 instructions on the Terasic website: https://www.terasic.com.tw/wiki/Altera_USB_Blaster_Driver_Installation_Instructions

I got an error though: "Windows found drivers for your device but encountered an error while attempting to install them." and "A problem was encountered while attempting to add the driver to the store."

Thankfully, Terasic had a page for this error: http://www.terasic.com.tw/wiki/Windows_encountered_a_problem_installing_the_drivers_for_your_device. Following their steps, I was able to install the USB
blaster drivers.

From there, I opened the CV-8052 Quartus project that I still had on my computer. If you need it, you can email me at kevinlinxc@gmail.com. Then, following the course slides (Intro to 8051 Assembly II):

1. I switched the SW10 on the board from RUN to PROG, and restarted the board. 
2. I went to Tools->Programmer, and clicked Add Hardware and selected the USB driver. I clicked start, and loaded the 8052 program onto the board.
3. I switched SW10 back to RUN
4. I opened CrossIDE, the program we used to write assembly.
5. I found a .asm and .hex file that I had saved from the class labs. Because I had the .hex file, I didn't need to build, but if I only had asm, I would have clicked Build->Compile/Link with A51, selected a51.exe from CrossIDE\Call51\bin and clicked OK.
6. I turned off the board, held KEY0, and turned it back on. The 7 segment display showed 'boot', and I released the KEY0 button.
7. In CrossIDE, I clicked fLash->Quartus SignalTap II, and selected my lab4.hex file. quartus_STP.exe was in the Quartus\bin64 directory and Load_Script.tcl was in the CrossIDE install directory.
8. I pressed OK, and it succesfully uploaded the program to the 8052.

Hopefully, I was able to help someone else who ran into the same issues.