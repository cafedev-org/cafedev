<!--
author=sallar.kaboli
date=2016-06-23 22:45:00
title=Synced Setup for Development
description=A few tips and tricks about setting up a synced dev environment
headerImg=laptop.jpg
tags=development,tools,setup
-->
A typical day for me involves using three computers: one at the office, a laptop on the go and an iMac at home. This setup gets really annoying pretty quick because it's so difficult to have the same environment installed on all of them. Settings, apps, data, documents and pretty much everything can be diffirent across the machines.

So I wanted to solve this problem once and for all. I’m going to explain how I setup my environment so I can have a similar experience while working on any of them.

### Operating System
I'm using macOS since all machines are Apple-made. As a result of this, pretty much anything else I own is also made by Apple, so I can have a unified experience all the time. It's not pleasant to think differently each time I use a machine, so I opted for one single platform: Apple.

### Cloud
I use Dropbox for storing my documents (screenshots, PDF docs, etc), iCloud for storing App data and [Amazon Cloud Drive](https://www.amazon.com/clouddrive/home?ref_=cd_auth_home) for storing my huge amount of Photos and Videos that need backing up (GoPro and Phone videos, DSLR photos, etc).

### Editor and Terminal
Now this is the most tricky part. First let me mention what I use:

- [Atom](https://atom.io/) (editor)
- [iTerm](https://www.iterm2.com/) (terminal)
- [Fish](http://fish.sh/) (shell)
- [Fisherman](http://fisherman.sh/) (shell package manager)
- [Home Brew](http://brew.sh/) (macOS package manager)

By default, none of of these tools support cloud-syncing or any kind of syncing for that matter, and it's very time consuming to configure them on each machine separately. And what if you add a package or install something on one machine? You'd want to have those changes across all machines.

One solution to this problem is moving all config files related to these tools to cloud (eg. Dropbox) and symlinking the originals. But that's very difficult to do manually.

Enters [Mackup](https://github.com/lra/mackup), a great command-line tool to do that really easily. It copies all config files to cloud (supports all major cloud platforms) and automatically symlinks to original locations. Supports many applications by default and it even supports backing up itself.

Personally, I prefer to pick and choose the applications I want to have backed up to the cloud, so I created a config file in this location: `~/.mackup.cfg`:

```ini
[storage]
engine = icloud

[applications_to_sync]
fish
fisherman
atom
bettertouchtool
mackup
```

Note that right now it doesn't support `fish` and `fisherman` out of the box. I have added the support for both of them and [submitted a PR](https://github.com/lra/mackup/pull/812) to Mackup repo. Please upvote it if you find it useful.

**Notes:**
- After installing a new fisherman package on one machine, you have to run `fisher up` on other machines to actually update and install the packages
- After installing Atom plugins on one machine, sometimes you need to run `apm install` on other machines to have the new packages across.

### Other Tools
I use some other nice apps which support syncing right out of the box:

- [1Password](https://1password.com/)
- [Chronicle](http://chronicleapp.com/) for managing bills
- [Reeder](http://reederapp.com/) for feeds and news
- [Airmail](http://airmailapp.com/) for Email management
- [Tweetbot](http://tapbots.com/tweetbot/)
- [Stache](http://getstache.com/) for bookmarks
