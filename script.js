
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds){
    if(isNaN(seconds) || seconds<0){
        return "00:00";
    }

    const minutes = Math.floor(seconds/60);
    const remainingSeconds = Math.floor(seconds%60);
    const fomattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${fomattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;

    let as = div.getElementsByTagName("a")
    songs =[]

    for(let index = 0; index < as.length; index++){
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // show all the songs in the playlist

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""

    for(const song of songs){
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img class="invert" width="34px" src="image/music.svg" alt="">
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="image/play.svg" alt="">
        </div>
      </li>`;
    }


    // attach an event listnet to each song

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs;

}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;

    if(!pause){
        currentSong.play()
        play.src = "image/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHtml = "00:00 / 00:00"
}

async function displayAlbums(){
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let cardContainers = document.querySelector(".cardContainer")
    let array = Array.from(anchors)

    for(let index = 0; index<array.length; index++){
        const e = array[index];
            if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
                let folder = e.href.split("/").slice(-2)[0]
                // Get the metadata of the folder
                let a = await fetch(`/songs/${folder}/info.json`)
                let response = await a.json();
                cardContainers.innerHTML = cardContainers.innerHTML + ` <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                            stroke-linejoin="round" />
                    </svg>
                </div>

                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
            </div>`
            
            }
    }

    // load the playlist whwnever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]);
        })
    })
}

async function main(){
    // get the list of all the songs

    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    // display all the albums on the page
    await displayAlbums()

    // attach an event listner to play , next and previous

    play.addEventListener("click", () => {
        if(currentSong.paused){
            currentSong.play();
            play.src = "image/pause.svg";
        }
        else{
            currentSong.pause();
            play.src = "image/play.svg";
        }
    })

    // listen for timeupdate event

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"; 
    })

    // add an event listner to seekbar

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // add an event listner for hamburger

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // add an event listner for close

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // add an event listner to previous song

    previous.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index - 1) >= 0){
            playMusic(songs[index-1])
        }
    })

    // add an event listner to next

    next.addEventListener("click", () => {
        currentSong.pause()

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index+1) < songs.length){
            playMusic(songs[index+1])
        }
    })

    // add an event to volume

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;

        if(currentSong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("image/mute.svg", "image/volume.svg")        
        }
    })

    // add an event listner to mute the track

    document.querySelector(".volume>img").addEventListener("click", e =>{
        if(e.target.src.includes("image/volume.svg")){
            e.target.src = e.target.src.replace("image/volume.svg", "image/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }

        else{
            e.target.src = e.target.src.replace("image/mute.svg", "image/volume.svg")
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;

        }
    })


}

main()