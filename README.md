# You Download

<p>
   This project is a GUI interface that uses ffmpeg and youtube-dl application for extract audio tracks from video url.
   In current release is allowed for source just YouTube videos.
   This project is intend only for testing and exprimental using.
</p>

![program interface](docs/you-download.png)

# Install

For install just download the latest release at this [link](https://github.com/lucianogrippa/you-download/releases)

If you want to compile this project you just need to following these few steps:

Clone repository:

```bash
$ git clone https://github.com/lucianogrippa/you-download.git
```

Enter in cloned folder:

```bash
$ cd you-download
```

Before call npn install you need to install globally [electron](https://www.electronjs.org/docs/tutorial/installation) and [electron-builder](https://www.electron.build) packages.

```bash
$ npm install -g electron
$ npm install -g electron-builder
```

After that you can call command:

```bash
$ npm install
```

The project require in system path two applications:

 - [youtube-dl](https://github.com/ytdl-org/youtube-dl)
 - [ffmpg](https://github.com/FFmpeg/FFmpeg)
  
Check the Github project of those applications to install them.
The dependencies are required only at compile and debugging time, when we create release it are included.

For start and debug application run:

```bash
$ npm run start
```

starting without debugging mode:

```bash
$ npm run start:prod
```

to build packages:

```bash
$ npm run pack
```

to create distribution packages:

```bash
$ npm run dist 
```
If it is executed on Linux system, it will produce AppImage and tar portable packages.
On Mac OS system will produce dmg and finally on Windows system, exe and MSI packages.

The above commands on Windows system are: 

```bash
$ npm run start:win
```

```bash
$ npm run start:prod:win
```

```bash
$ npm run pack:win
```

```bash
$ npm run dist:win
```


## Authors

* **Luciano Grippa** - *contacts* - [Email](mailto:grippa.luciano@gmail.com)
* **Social** - *twitter* - [@lgrippa75](https://twitter.com/lgrippa75)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details