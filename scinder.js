(() => {

    const scinder = {}
    const getSegments = (context, audioBuffer, times, durations) => {
    
        // the returned array
        const segments = []
        
        times.forEach((time, i) => {
            if (time < 0 || time >= 1)
                throw new Error('segment start point must be a float in the range [0;1[')
            const cutPosition = Math.floor(audioBuffer.duration * time) * audioBuffer.sampleRate

            let frameCount = 0
            if (Array.isArray(durations) && durations.length >= i)
                frameCount = audioBuffer.sampleRate * durations[i]
            else if (Array.isArray(durations))
                throw new Error('the durations array must be have the same length as the time array, or either be an int value')
            else if (!Number.isNaN(durations))
                frameCount = audioBuffer.sampleRate * durations
            else
                throw new Error('the durations array must be have the same length as the time array, or either be an int value')

            // the duration cannot be greater than the length of the music
            if (cutPosition + frameCount > audioBuffer.length)
                frameCount = audioBuffer.length - cutPosition

            const segment = context.createBuffer(
                audioBuffer.numberOfChannels,
                frameCount,
                audioBuffer.sampleRate
            )
            for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {

                const nowBuffering = segment.getChannelData(channel)
                const sourceBuffering = audioBuffer.getChannelData(channel)
                for (let i = 0; i < frameCount; i++)
                    nowBuffering[i] = sourceBuffering[cutPosition + i]
            }

            segments.push(segment)

        })

        return segments
    }
    scinder.getSegments = getSegments

    // create and return a new audiobuffer with smoothen beginning/end
    const smoothenSegment = (context, audioBuffer, smoothLength) => {
        if (smoothLength >= 0.5 || smoothLength <= 0)
            return

        const bytesNumber = Math.floor(audioBuffer.getChannelData(0).length * smoothLength)

        const segment = context.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        )
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {

            const nowBuffering = segment.getChannelData(channel)
            const sourceBuffering = audioBuffer.getChannelData(channel)
            const length = audioBuffer.length

            for (let i = 0; i < length; i++) {
                
                // check if it's the first bytes
                if (i <= bytesNumber) {
                    nowBuffering[i] = sourceBuffering[i] * (i / bytesNumber)

                // check if it's the last bytes
                } else if (i >= length - bytesNumber) {
                    const baseIndex = i - (length - bytesNumber)
                    nowBuffering[/*s*/ + i] = sourceBuffering[i] * ((bytesNumber - baseIndex) / bytesNumber)

                // unchanged bytes
                } else {
                    nowBuffering[i] = sourceBuffering[i]
                }

            }
        }

        return segment
    }
    scinder.smoothenSegment = smoothenSegment

    const packAudioBuffers = (context, audioBuffers, silenceBetween = 0) => {
        const flooredSilenceBetween = Math.floor(silenceBetween)

        let totalLength = 0
        audioBuffers.forEach(b => totalLength += b.length)
        const numberOfChannels = audioBuffers[0].numberOfChannels

        const pack = context.createBuffer(
            numberOfChannels,
            totalLength + audioBuffers[0].sampleRate * (audioBuffers.length - 1) * flooredSilenceBetween, // 2s of silence between each cut
            audioBuffers[0].sampleRate
        )

        
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const packChannel = pack.getChannelData(channel)
            let totalIndex = 0

            for (let buffer of audioBuffers) {
                const bufferChannel = buffer.getChannelData(channel)
                const length = bufferChannel.length
                
                for (let i = 0; i < length; i++)
                    packChannel[totalIndex++] = bufferChannel[i]

                // then X seconds of silence
                for (let s = 0; s < audioBuffers[0].sampleRate * flooredSilenceBetween; s++)
                    packChannel[totalIndex++] = 0
            }
            
        }

        return pack
    }
    scinder.packAudioBuffers = packAudioBuffers

    const getAudioBuffer = (file) => {
        context = new AudioContext()
        const reader = new FileReader()

        return new Promise((resolve, reject) => {

            reader.onload = function () {

                const arrayBuffer = this.result

                context.decodeAudioData(arrayBuffer)
                .then(audioBuffer => {
                    resolve({audioBuffer, context, reader})
                })
            }
            reader.readAsArrayBuffer(file)
        })
    }
    scinder.getAudioBuffer = getAudioBuffer

    const sliceAndPack = (file, times, durations) => {
        const context = new AudioContext()
        const reader = new FileReader()

        return getAudioBuffer(file)
        .then(({audioBuffer, context}) => {
            const segments = getSegments(context, audioBuffer, times, durations)
            const smoothenSegments = segments.map(s => smoothenSegment(context, s, 0.15))

            return{pack: packAudioBuffers(context, smoothenSegments, 2), context}
        }, e => console.error(e))
    }
    scinder.sliceAndPack = sliceAndPack

    // prepare and play a music from an audioBuffer
    const playAudioBuffer = (context, audioBuffer) => {
        if (!context) context = new AudioContext()

        const audioSource = context.createBufferSource()
        audioSource.connect(context.destination)
        audioSource.buffer = audioBuffer
        audioSource.loop = false
        audioSource.start(0)
    }
    scinder.playAudioBuffer = playAudioBuffer

    this.scinder = scinder
})()

(() => {

    const scinder = {}
    const getSegments = (context, audioBuffer, times, durations) => {
    
        // the returned array
        const segments = []
        
        times.forEach((time, i) => {
            if (time < 0 || time >= 1)
                throw new Error('segment start point must be a float in the range [0;1[')
            const cutPosition = Math.floor(audioBuffer.duration * time) * audioBuffer.sampleRate

            let frameCount = 0
            if (Array.isArray(durations) && durations.length >= i)
                frameCount = audioBuffer.sampleRate * durations[i]
            else if (Array.isArray(durations))
                throw new Error('the durations array must be have the same length as the time array, or either be an int value')
            else if (!Number.isNaN(durations))
                frameCount = audioBuffer.sampleRate * durations
            else
                throw new Error('the durations array must be have the same length as the time array, or either be an int value')

            // the duration cannot be greater than the length of the music
            if (cutPosition + frameCount > audioBuffer.length)
                frameCount = audioBuffer.length - cutPosition

            const segment = context.createBuffer(
                audioBuffer.numberOfChannels,
                frameCount,
                audioBuffer.sampleRate
            )
            for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {

                const nowBuffering = segment.getChannelData(channel)
                const sourceBuffering = audioBuffer.getChannelData(channel)
                for (let i = 0; i < frameCount; i++)
                    nowBuffering[i] = sourceBuffering[cutPosition + i]
            }

            segments.push(segment)

        })

        return segments
    }
    scinder.getSegments = getSegments

    // create and return a new audiobuffer with smoothen beginning/end
    const smoothenSegment = (context, audioBuffer, smoothLength) => {
        if (smoothLength >= 0.5 || smoothLength <= 0)
            return

        const bytesNumber = Math.floor(audioBuffer.getChannelData(0).length * smoothLength)

        const segment = context.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        )
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {

            const nowBuffering = segment.getChannelData(channel)
            const sourceBuffering = audioBuffer.getChannelData(channel)
            const length = audioBuffer.length

            for (let i = 0; i < length; i++) {
                
                // check if it's the first bytes
                if (i <= bytesNumber) {
                    nowBuffering[i] = sourceBuffering[i] * (i / bytesNumber)

                // check if it's the last bytes
                } else if (i >= length - bytesNumber) {
                    const baseIndex = i - (length - bytesNumber)
                    nowBuffering[/*s*/ + i] = sourceBuffering[i] * ((bytesNumber - baseIndex) / bytesNumber)

                // unchanged bytes
                } else {
                    nowBuffering[i] = sourceBuffering[i]
                }

            }
        }

        return segment
    }
    scinder.smoothenSegment = smoothenSegment

    const packAudioBuffers = (context, audioBuffers, silenceBetween = 0) => {
        flooredSilenceBetween = Math.floor(silenceBetween)

        let totalLength = 0
        audioBuffers.forEach(b => totalLength += b.length)
        const numberOfChannels = audioBuffers[0].numberOfChannels

        const pack = context.createBuffer(
            numberOfChannels,
            totalLength + audioBuffers[0].sampleRate * (audioBuffers.length - 1) * flooredSilenceBetween, // 2s of silence between each cut
            audioBuffers[0].sampleRate
        )

        
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const packChannel = pack.getChannelData(channel)
            let totalIndex = 0

            for (let buffer of audioBuffers) {
                const bufferChannel = buffer.getChannelData(channel)
                const length = bufferChannel.length
                
                for (let i = 0; i < length; i++)
                    packChannel[totalIndex++] = bufferChannel[i]

                // then X seconds of silence
                for (let s = 0; s < audioBuffers[0].sampleRate * flooredSilenceBetween; s++)
                    packChannel[totalIndex++] = 0
            }
            
        }

        return pack
    }
    scinder.packAudioBuffers = packAudioBuffers

    const getAudioBuffer = (file) => {
        const context = new AudioContext()
        const reader = new FileReader()

        return new Promise((resolve, reject) => {

            reader.onload = function () {

                const arrayBuffer = this.result

                context.decodeAudioData(arrayBuffer)
                .then(audioBuffer => {
                    resolve({audioBuffer, context, reader})
                })
            }
            reader.readAsArrayBuffer(file)
        })
    }
    scinder.getAudioBuffer = getAudioBuffer

    const sliceAndPack = (file, times, durations) => {

        return getAudioBuffer(file)
        .then(({audioBuffer, context}) => {
            const segments = getSegments(context, audioBuffer, times, durations)
            const smoothenSegments = segments.map(s => smoothenSegment(context, s, 0.15))

            return{pack: packAudioBuffers(context, smoothenSegments, 2), context}
        }, e => console.error(e))
        
    }
    scinder.sliceAndPack = sliceAndPack

    // prepare and play a music from an audioBuffer
    const playAudioBuffer = (context, audioBuffer) => {
        if (!context) context = new AudioContext()

        const audioSource = context.createBufferSource()
        audioSource.connect(context.destination)
        audioSource.buffer = audioBuffer
        audioSource.loop = false
        audioSource.start(0)
    }
    scinder.playAudioBuffer = playAudioBuffer

    if (module && module.exports) {
        module.exports = scinder
    } else {
        this.scinder = scinder
    }
})()
