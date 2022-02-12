"use strict"

const COMMON_WORDS_URL = "common_words.txt"
const ALL_WORDS_URL = "all_words.txt"
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
  chosen_letters
  all_words
  common_words

  async loadLists() {
    await fetch(COMMON_WORDS_URL)
      .then((response) => response.text())
      .then((words) => (this.common_words = words.split("\n")))
    await fetch(ALL_WORDS_URL)
      .then((response) => response.text())
      .then((words) => (this.all_words = new Set(words.split("\n"))))
  }

  async newLetters() {
    for (;;) {
      this.chosen_letters = this.generateLetters()
      console.log("trying: " + this.chosen_letters)
      this.matched_words = []

      if (THREE_LETTER_WORDS.has(this.chosen_letters)) {
        console.log(this.chosen_letters + " is a word")
        continue
      }
      for (const word of this.common_words) {
        if (this.matches(this.chosen_letters, word)) {
          this.matched_words.push(word)
        }
      }
      if (this.matched_words.length > 0) {
        break
      }
    }
  }

  isWord(word) {
    return this.all_words.has(word)
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
    return word.match(regex)
  }
}

;(async () => {
  var game = new Game()
  await game.loadLists()
  var timebar = document.querySelector(".timebar")

  var nextWord = async () => {
    game.newLetters()

    var letterEls = document.querySelectorAll(".givenLetters > .letter")
    letterEls[0].textContent = game.chosen_letters[0]
    letterEls[1].textContent = game.chosen_letters[1]
    letterEls[2].textContent = game.chosen_letters[2]
    console.log(game.chosen_letters)
    console.log(game.matched_words)
    timebar.classList.add("animated")
  }

  timebar.addEventListener("animationend", () => {
    timebar.classList.remove("animated")
    setTimeout(() => nextWord(), 0)
  })
  nextWord()
})()
