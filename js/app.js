const CONFIG = {
    NAME_KEY: "username",
    PB_KEY: "pb_score",
    SCOREBOARD_KEY: "scoreboard",
    FLAGGED_QUESTIONS_KEY: "flagged_questions",
    QUESTION_TIMEOUT: 10,
    QUESTION_END_TIMEOUT: 3,
    MAX_LIVES: 3,
    MAX_DIFFICULTY: 3,
    SOUNDS: {
        CORRECT: {
            name: "correct.mp3",
            volume: .4,
        },
        WRONG: {
            name: "wrong.mp3",
            volume: .4,
        },
        COPY: {
            name: "copy.mp3",
            volume: .4,
        },
    }
}

const DEFAULT_SCOREBOARD = [
    { username: "Bob", score: 20 },
    { username: "Pascale", score: 11 },
    { username: "Didier", score: 7 },
]

const { createApp, ref } = Vue;

const app = {
    setup() {
        const STATES = {
            MENU: "menu",
            GAME: "game",
            END: "end",
        }
        const SOUNDS = {}
        Object.keys(CONFIG.SOUNDS).forEach(sound => {
            SOUNDS[sound] = new Audio(`assets/${CONFIG.SOUNDS[sound].name}`)
        })
        Object.keys(SOUNDS).forEach(k => {
            if (!isNil(CONFIG.SOUNDS[k].volume)) {
                SOUNDS[k].volume = CONFIG.SOUNDS[k].volume
            }
        })
        return {
            STATES,
            SOUNDS,
            username: ref(getStorage(CONFIG.NAME_KEY, "")),
            pb: ref(getStorage(CONFIG.PB_KEY, 0)),
            scoreboard: ref(getStorage(CONFIG.SCOREBOARD_KEY, clone(DEFAULT_SCOREBOARD))),
            flagged: ref(getStorage(CONFIG.FLAGGED_QUESTIONS_KEY, {})),
            state: ref(STATES.MENU),
            training: ref(false),

            questions: ref([]),
            theme: ref(),

            countdown: ref({
                start: null,
                end: null,
                process: null,
                ended: false,
            }),
            countQuestions: ref(1),
            gameScore: ref(0),
            lives: ref(CONFIG.MAX_LIVES),
            MAX_LIVES: CONFIG.MAX_LIVES,
            currentQuestion: ref(0),
            selectedAnswer: ref(),
            questionTransition: ref(false),

            newPb: ref(false),
        }
    },
    mounted() {
    },
    methods: {
        themes() {
            const themes = []
            Object.keys(QUESTIONS).forEach(diff => {
                Object.keys(QUESTIONS[diff]).forEach(theme => {
                    if (!themes.includes(theme)) {
                        themes.push(theme)
                    }
                })
            });
            return themes
        },
        changeUsername(username) {
            this.username = username
            setStorage(CONFIG.NAME_KEY, username)
        },
        getMaxDifficulty() {
            if (this.training) {
                return CONFIG.MAX_DIFFICULTY
            } else {
                return Math.min(CONFIG.MAX_DIFFICULTY, Math.floor(this.countQuestions / 10))
            }
        },
        updateQuestion() {
            let difficulty
            while (isNil(difficulty) || !this.questions[difficulty]) {
                difficulty = random(this.getMaxDifficulty())
            }
            const theme = this.theme || random(Object.keys(this.questions[difficulty]))
            const picked = random(this.questions[difficulty][theme])
            if (!this.training) {
                this.questions[difficulty][theme].splice(this.questions[difficulty][theme].indexOf(picked), 1)
            }

            const answers = [picked.correct, ...picked.wrong]
            answers.shuffle()
            this.currentQuestion = {
                answers,
                theme,
                difficulty,
                question: picked.question,
                correctIndex: answers.indexOf(picked.correct),
            }
            this.selectedAnswer = null

            if (!this.training) {
                const time = now()
                const delay = CONFIG.QUESTION_TIMEOUT * 1000
                this.countdown = {
                    start: time,
                    end: time + delay,
                    process: setTimeout(async () => {
                        this.countdown.ended = true
                        const validAnswer = this.selectedAnswer === this.currentQuestion.correctIndex
                        if (validAnswer) {
                            playSound(this.SOUNDS.CORRECT)
                            this.gameScore++
                        } else {
                            playSound(this.SOUNDS.WRONG)
                            this.lives--
                        }
                        await wait(CONFIG.QUESTION_END_TIMEOUT * 1000)
                        if (validAnswer || this.lives > 0) {
                            this.questionTransition = true
                            await wait(200)
                            this.countQuestions++
                            this.updateQuestion()
                            this.questionTransition = false
                        } else {
                            this.gameOver()
                        }
                    }, delay),
                    ended: false
                }
            }
        },
        play(theme) {
            this.questions = clone(QUESTIONS)
            this.theme = isNil(theme) ? null : theme
            this.training = !!this.theme
            this.gameScore = 0
            this.countQuestions = 1
            this.lives = CONFIG.MAX_LIVES
            this.updateQuestion()
            this.state = this.STATES.GAME
            this.questionTransition = false
            this.newPb = false
        },
        async selectAnswer(id) {
            this.selectedAnswer = id

            if (this.training) {
                if (!isNil(this.selectedAnswer)) { // click on an answer
                    if (this.selectedAnswer == this.currentQuestion.correctIndex) {
                        playSound(this.SOUNDS.CORRECT)
                    } else {
                        playSound(this.SOUNDS.WRONG)
                    }
                    this.countdown.ended = true
                } else { // click continue
                    this.questionTransition = true
                    this.countdown = {}
                    await wait(200)
                    this.updateQuestion()
                    this.questionTransition = false
                }
            }
        },
        gameOver(manual) {
            if (this.gameScore > this.pb) {
                this.pb = this.gameScore
                this.newPb = true
                setStorage(CONFIG.PB_KEY, this.pb)
            }
            if (this.gameScore > this.scoreboard[2].score) {
                // remove previous self score
                this.scoreboard = this.scoreboard.filter(score => score.username !== this.username)
                // find index to insert
                let index = 0
                while (this.scoreboard[index].score > this.gameScore) {
                    index++
                }
                // insert score
                this.scoreboard.splice(index, 0, { username: this.username, score: this.gameScore })
                // remove scores afters 3rd place
                while (this.scoreboard.length > 3) {
                    this.scoreboard.pop()
                }
                setStorage(CONFIG.SCOREBOARD_KEY, this.scoreboard)

                this.state = this.STATES.END
            } else if (!manual) {
                this.state = this.STATES.END
            } else { // manual stop
                this.state = this.STATES.MENU
            }

            clearTimeout(this.countdown.process)
            this.countdown = {}
            this.currentQuestion = null
            this.selectedAnswer = null
        },
        flag(question, answers) {
            if (!this.flagged[question]) {
                this.flagged[question] = answers
                this.currentQuestion.flagged = true
                setStorage(CONFIG.FLAGGED_QUESTIONS_KEY, this.flagged)
            } else {
                delete this.flagged[question]
                delete this.currentQuestion.flagged
            }
        },
        dropFlag(question) {
            delete this.flagged[question]
            if (Object.keys(this.flagged).length === 0) {
                setStorage(CONFIG.FLAGGED_QUESTIONS_KEY, null)
            } else {
                setStorage(CONFIG.FLAGGED_QUESTIONS_KEY, this.flagged)
            }
        },
        copyFlaggedQuestions() {
            playSound(this.SOUNDS.COPY)
            const content = Object.keys(this.flagged).map(question => `- [ ] ${question} [${this.flagged[question].join("|")}]`).join("\n")
            navigator.clipboard.writeText(content)
        },
    },
    template: `
        <header class="w-100 flex-center">
            <h1>Quizz de Culture Générale</h1>
        </header>
        <div class="container flex-grow-1 flex-center position-relative">
            <MenuCmp
                v-if="state === STATES.MENU"
                :username="username"
                :pb="pb"
                :scoreboard="scoreboard"
                :flagged="flagged"
                :themes="themes()"
                @change-username="changeUsername"
                @play="play"
                @drop-flag="dropFlag"
                @copy-flagged="copyFlaggedQuestions" />
            <QuestionCmp
                v-else-if="state === STATES.GAME && !questionTransition"
                :data="currentQuestion"
                :countQuestions="countQuestions"
                :countdown="countdown"
                :selectedAnswer="selectedAnswer"
                :correctIndex="countdown.ended ? currentQuestion.correctIndex : null"
                @select-answer="selectAnswer"
                @stop="gameOver(true)"
                @flag-question="flag" />
            <EndScreenCmp
                v-else-if="state === STATES.END"
                :score="gameScore"
                :countQuestions="countQuestions"
                :pb="pb"
                :newPb="newPb"
                @continue="() => state = STATES.MENU" />

            <div v-if="state === STATES.GAME && !training"
                class="flex-center flex-row-reverse position-absolute top-0 start-0 ms-4 mt-4">
                Score: {{ gameScore }}
            </div>
            <div v-if="state === STATES.GAME && !training"
                class="flex-center flex-row-reverse gap-2 position-absolute top-0 end-0 me-4 mt-4">
                <div v-for="n in MAX_LIVES"
                    :key="n"
                    class="life"
                    :class="n <= lives ? 'active' : ''"></div>
            </div>
        </div>
    `,
}

createApp(app)
    .component("MenuCmp", MenuCmp)
    .component("QuestionCmp", QuestionCmp)
    .component("EndScreenCmp", EndScreenCmp)
    .mount("#app");