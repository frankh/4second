"use strict"

import seedrandom from "seedrandom"
import dndod from "dndod"
import "dndod/dist/dndod-popup.min.css"

const COMMON_WORDS_URL = "wordlists/common_words.txt"
const ALL_WORDS_URL = "wordlists/all_words.txt"
const THREE_LETTER_WORDS = new Set([
  "brr",
  "bys",
  "cry",
  "cwm",
  "dry",
  "fly",
  "fry",
  "gym",
  "gyp",
  "hmm",
  "hyp",
  "myc",
  "nth",
  "pht",
  "ply",
  "pry",
  "pst",
  "pyx",
  "shh",
  "shy",
  "sky",
  "sly",
  "spy",
  "sty",
  "syn",
  "thy",
  "try",
  "tsk",
  "why",
  "wry",
  "wyn",
  "zzz",
])

class Game {
  static consonants = "bcdfghjklmnpqrstvwxyz"
  currentRound = 0
  numRounds
  rounds = []
  allWords
  commonWords

  async loadLists() {
    await fetch(COMMON_WORDS_URL)
      .then((response) => response.text())
      .then((words) => (this.commonWords = words.split("\n")))
    await fetch(ALL_WORDS_URL)
      .then((response) => response.text())
      .then((words) => (this.allWords = new Set(words.split("\n"))))
  }

  async newLetters() {
    for (;;) {
      var newLetters = this.generateLetters()
      for (const [chosenLetters] of this.rounds) {
        if (newLetters == chosenLetters) {
          newLetters = this.generateLetters()
        }
      }
      console.log("trying: " + newLetters)
      var matchedWords = []

      if (THREE_LETTER_WORDS.has(newLetters)) {
        console.log(newLetters + " is a word")
        continue
      }
      for (const word of this.commonWords) {
        if (this.matches(newLetters, word)) {
          matchedWords.push(word)
        }
      }
      if (matchedWords.length > 0) {
        break
      }
    }
    return [newLetters, matchedWords]
  }

  async generateRounds(n) {
    this.numRounds = n
    this.currentRound = -1
    for (var i = 0; i < n; i++) {
      const [chosenLetters, matchedWords] = await this.newLetters()
      this.rounds.push([chosenLetters, matchedWords])
    }
    ;[this.chosenLetters, this.matchedWords] = this.rounds[0]
  }

  nextRound() {
    this.currentRound++
    if (this.currentRound == this.numRounds) {
      this.chosenLetters = null
      this.matchedWords = null
      this.finished = true
      return
    }
    ;[this.chosenLetters, this.matchedWords] = this.rounds[this.currentRound]
  }

  isWord(word) {
    return this.allWords.has(word)
  }

  generateLetters() {
    var result = ""
    for (var i = 0; i < 3; i++) {
      result += Game.consonants.charAt(
        Math.floor(Math.random() * Game.consonants.length)
      )
    }
    return result
  }

  matches(consonants, word) {
    const regex = new RegExp(
      `^${consonants[0]}.*${consonants[1]}.*${consonants[2]}`
    )
    return word.match(regex) !== null
  }
}

;(async () => {
  var game = new Game()
  await game.loadLists()
  var timebar = document.querySelector(".timebar")
  var gameElem = document.querySelector(".game")
  var currentGuessElem = null

  var lastInputText = ""
  var submitGuess = (guessElem, force) => {
    document.querySelector(".guess.template input.guessInput").value = ""
    lastInputText = ""
    const guess = guessElem
      .querySelector("input.guessInput")
      .value.toLowerCase()
    if (guess === "" && !force) {
      return
    }

    // Replace guess input with div so we can style individual letters
    guessElem.querySelector("input.guessInput").remove()
    const newElem = document.createElement("div")
    newElem.classList.add("submittedGuess")
    var matchedLetters = 0
    for (const letter of guess) {
      const letterElem = document.createElement("span")
      letterElem.classList.add("guessLetter")
      letterElem.textContent = letter
      if (letter === game.chosenLetters[matchedLetters]) {
        letterElem.classList.add("givenLetter")
        matchedLetters++
      }
      newElem.append(letterElem)
    }
    guessElem.prepend(newElem)
    const correct =
      game.isWord(guess) && game.matches(game.chosenLetters, guess)
    guessElem.classList.remove("active")
    guessElem.classList.add("submitted")
    if (correct) {
      guessElem.classList.add("correct")
    } else {
      guessElem.classList.add("incorrect")
    }
  }

  var nextWord = async () => {
    if (
      currentGuessElem !== null &&
      currentGuessElem.classList.contains("active")
    ) {
      submitGuess(currentGuessElem, true)
    }
    game.nextRound()
    if (game.finished) {
      for (const guessElem of gameElem.querySelectorAll(".guess")) {
        if (guessElem.classList.contains("incorrect")) {
          guessElem.querySelector(".help").classList.remove("hidden")
        }
      }
      return
    }

    var newGuess = gameElem.querySelector(".guess.template").cloneNode(true)
    newGuess.classList.remove("template")
    newGuess.classList.remove("invisible")
    newGuess.querySelector("input.guessInput").disabled = true
    newGuess.querySelector("input.guessInput").value = ""
    const helpText =
      game.chosenLetters.toUpperCase() + ": " + game.matchedWords[0]
    newGuess.querySelector(".help").addEventListener("click", () => {
      dndod.alert(helpText, { animation: "none" })
    })
    newGuess.classList.add("active")
    gameElem.querySelector(".guesses").prepend(newGuess)
    currentGuessElem = newGuess

    var letterEls = gameElem.querySelectorAll(".givenLetters .letter")
    letterEls[0].textContent = game.chosenLetters[0]
    letterEls[1].textContent = game.chosenLetters[1]
    letterEls[2].textContent = game.chosenLetters[2]
    console.log(game.chosenLetters)
    console.log(game.matchedWords)
    timebar.classList.add("animated")
    letterEls[0].classList.add("animated")
    letterEls[1].classList.add("animated")
    letterEls[2].classList.add("animated")
  }

  timebar.addEventListener("animationend", () => {
    timebar.classList.remove("animated")
    for (const letterEl of gameElem.querySelectorAll(".givenLetters .letter")) {
      letterEl.classList.remove("animated")
    }
    setTimeout(() => nextWord(), 0)
  })

  var androidKeydown = (e) => {
    // 13 == Enter
    if (e.which === 13) {
      e.preventDefault()
      return
    }

    setTimeout(() => {
      var inputText = document.querySelector(
        ".guess.template input.guessInput"
      ).value
      var inputElem = currentGuessElem.querySelector("input.guessInput")
      if (inputText.length > lastInputText.length) {
        var char = inputText.substring(lastInputText.length)
        lastInputText = inputText
        if (
          inputElem.value === "" &&
          char[0].toLowerCase() != game.chosenLetters[0]
        ) {
          return
        }
        inputElem.value = inputElem.value + char
      } else if (inputText.length < lastInputText.length) {
        var diff = lastInputText.length - inputText.length
        lastInputText = inputText
        inputElem.value = inputElem.value.substring(
          0,
          inputElem.value.length - diff
        )
      }
    }, 10)
  }

  document.onkeydown = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) {
      console.log("skipping due to meta key")
      return
    }

    if (
      currentGuessElem === null ||
      currentGuessElem.classList.contains("submitted")
    ) {
      e.preventDefault()
      return
    }

    if (e.key === "Unidentified") {
      return androidKeydown(e)
    }

    var inputElem = currentGuessElem.querySelector("input.guessInput")
    if (/^[a-zA-Z]$/.test(e.key)) {
      if (
        inputElem.value === "" &&
        e.key.toLowerCase() != game.chosenLetters[0]
      ) {
        return
      }
      inputElem.value = inputElem.value + e.key
    } else if (e.key === "Backspace") {
      inputElem.value = inputElem.value.substring(0, inputElem.value.length - 1)
    } else if (e.key === "Enter") {
      e.preventDefault()
    }
  }

  var start = async () => {
    await game.generateRounds(10)
    gameElem.querySelector(".givenLetters").classList.remove("hidden")
    for (const startButton of gameElem.querySelectorAll(".start")) {
      startButton.classList.add("hidden")
    }
    timebar.classList.add("animated")
    document.querySelector("input.guessInput").focus()
    var letterEls = document.querySelectorAll(".givenLetters .letter")

    setTimeout(() => {
      letterEls[2].textContent = "3"
      letterEls[2].classList.add("animated")
      setTimeout(() => {
        letterEls[2].getAnimations()[0].currentTime += 1000
      }, 500)

      setTimeout(() => {
        letterEls[1].textContent = "2"
        letterEls[1].classList.add("animated")
        setTimeout(() => {
          letterEls[1].getAnimations()[0].currentTime += 2000
        }, 500)
        setTimeout(() => {
          letterEls[0].textContent = "1"
          letterEls[0].classList.add("animated")
          setTimeout(() => {
            letterEls[0].getAnimations()[0].currentTime += 3000
          }, 500)
        }, 1000)
      }, 1000)
    }, 1000)
  }

  document.querySelector(".startPractice").addEventListener("click", () => {
    seedrandom(undefined, { global: true })
    start()
  })

  document.querySelector(".startDaily").addEventListener("click", () => {
    seedrandom(new Date().toDateString(), { global: true })
    start()
  })
})()
