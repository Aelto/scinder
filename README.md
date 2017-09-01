# Scinder.js
scinder.js provides an easy way to slice any music easily to make samples in the browser (client-side).
So you don't need a server to modify samples of music, keep your server CPU-power for something-else

> scinder.js was created with only the browser in mind, it should not (and cannot) be used in node.js.

# How to install
download `scinder.js` then load it in your html file with
```html
<script src='scinder.js'></script>
```

# How to use

## Example
imagine an html file like this:
```html
<html>
    <head>
        <meta charset="utf-8">

        <title>scinder | client</title>
    </head>
    <body>

        <input type="file">

        <script src='scinder.js'></script>
        <script src='main.js'></script>
    </body>
</html>
```

You are able to create a pack of 3 slices from a user-chosen music as easily as this
```javascript
// main.js file
document.querySelector('input').addEventListener('change', function () {

    scinder.sliceAndPack(this.files[0], [0, 0.33, 0.66], 10)
    .then(({pack, context}) => {
        console.log(context)
        scinder.playAudioBuffer(context, pack)
    })

}, false)
```

## API
scinder's API is moslty promised based to get rid of the unnecessary callbacks.
Here is a list of the functions available and how to use them

### scinder.getSegments(context, audioBuffer, times, durations)
Take as input 4 parameters and returns segments of the music
 - `context` his type is `window.AudioContext`, this can be any context you have, but it is recommended that `context` is the AudioContext used when playing the AudioBuffer (context use with `scinder.playAudioBuffer(context, audioBuffer)`)
 - `audioBuffer` his type is `window.AudioBuffer`, you can get one from a file with `scinder.getAudioBuffer(file)`
 - `times` must be of type `Array` and is a list of all the segments' starting points in the music in %. For example `[0, 0.33, 0.66]` will create 3 segments, one starting at 0%, one at 33% and one at 66%
 - `durations` can be of type `Array || Number`, when of type `Array` it must have the same length as the `times` parameter length and should contain Number in second telling the duration of each segment. For example [10, 5, 25] will create 3 segments, one of 10seconds, one of 5s and of 25s. When used as a `Number`, each segment will have the `durations` length in second


 ### scinder.smoothenSegment(context, audioBuffer, smoothLength)
 Take as input 3 parameters and create a smooth transition at the beginning and the end of the segment
  - `context` his type is `window.AudioContext`, this can be any context you have, but it is recommended that `context` is the AudioContext used when playing the AudioBuffer (context use with `scinder.playAudioBuffer(context, audioBuffer)`)
  - `audioBuffer` his type is `window.AudioBuffer`, you can get one from a file with `scinder.getAudioBuffer(file)`
  - `smoothLength` of type `Number` should be a float in the interval [0, 0.5[ wich will determine how long the transition is, it is a % value.

### scinder.packAudioBuffers(context, audioBuffers, silenceBetween = 0)
Take as input 3 parameters (1 optional) and returns a new AudioBuffer Object which is a pack multiple AudioBuffers, a moment of silence can be included between each segment
 - `context` his type is `window.AudioContext`, this can be any context you have, but it is recommended that `context` is the AudioContext used when playing the AudioBuffer (context use with `scinder.playAudioBuffer(context, audioBuffer)`)
 - `audioBuffers` his type is `Array<window.AudioBuffer>`, you can get a AudioBuffer from a file with `scinder.getAudioBuffer(file)`
 - `silenceBetween` of tipe `Number` is an `Int` telling how much seconds of silence there are between each segment

### scinder.getAudioBuffer(file)
Take as input 1 parameter and returns an `AudioBuffer` object from the supplied file
 - `file` of type `File` is the file used to get an AudioBuffer. More information on `File` at the [MDN - file page](https://developer.mozilla.org/en/docs/Web/API/File)

### scinder.sliceAndPack(file, times, durations)
Take as input 3 paremeters to get slices from a music, then pack them into a single AudioBuffer you can pass to `scinder.playAudioBuffer`
 - `file` of type `File` is the file used to get an AudioBuffer. More information on `File` at the [MDN - file page](https://developer.mozilla.org/en/docs/Web/API/File)
 - `times` must be of type `Array` and is a list of all the segments' starting points in the music in %. For example `[0, 0.33, 0.66]` will create 3 segments, one starting at 0%, one at 33% and one at 66%
 - `durations` can be of type `Array || Number`, when of type `Array` it must have the same length as the `times` parameter length and should contain Number in second telling the duration of each segment. For example [10, 5, 25] will create 3 segments, one of 10seconds, one of 5s and of 25s. When used as a `Number`, each segment will have the `durations` length in second

### scinder.playAudioBuffer(context, audioBuffer)
Plays the supplied `AudioBuffer` using the supplid `AudioContext` (Plays the supplied music)
 - `context` his type is `window.AudioContext`, this can be any context you have, but it is recommended that `context` is the AudioContext used when playing the AudioBuffer (context use with `scinder.playAudioBuffer(context, audioBuffer)`)
  - `audioBuffer` his type is `window.AudioBuffer`, you can get one from a file with `scinder.getAudioBuffer(file)`
