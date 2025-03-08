const CONFIG = {
    NAME_KEY: "username",
    PB_KEY: "pb_score",
    SCOREBOARD_KEY: "scoreboard",
    QUESTION_TIMEOUT: 10,
    QUESTION_END_TIMEOUT: 3,
    MAX_LIVES: 3,
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
        return {
            STATES,
            username: ref(getStorage(CONFIG.NAME_KEY, "")),
            pb: ref(getStorage(CONFIG.PB_KEY, 0)),
            scoreboard: ref(getStorage(CONFIG.SCOREBOARD_KEY, clone(DEFAULT_SCOREBOARD))),
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
            countQuestions: ref(0),
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
        getDifficulty() {
            return Math.min(3, Math.floor(this.countQuestions / 10))
        },
        updateQuestion() {
            const diff = random(this.getDifficulty())
            const theme = this.theme || random(Object.keys(this.questions[diff]))
            const picked = random(this.questions[diff][theme])
            if (!this.training) {
                this.questions[diff][theme].splice(this.questions[diff][theme].indexOf(picked), 1)
            }

            const answers = [picked.correct, ...picked.wrong]
            answers.shuffle()
            this.currentQuestion = {
                answers,
                theme,
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
                            this.countQuestions++
                        } else {
                            this.lives--
                        }
                        await wait(CONFIG.QUESTION_END_TIMEOUT * 1000)
                        if (validAnswer || this.lives > 0) {
                            this.questionTransition = true
                            await wait(200)
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
            this.countQuestions = 0
            this.lives = CONFIG.MAX_LIVES
            this.updateQuestion()
            this.state = this.STATES.GAME
            this.questionTransition = false
            this.newPb = false
        },
        async selectAnswer(id) {
            this.selectedAnswer = id

            if (this.training) {
                this.countdown.ended = true
                await wait(CONFIG.QUESTION_END_TIMEOUT * 1000)
                this.questionTransition = true
                this.countdown = {}
                await wait(200)
                this.updateQuestion()
                this.questionTransition = false
            }
        },
        gameOver(manual) {
            if (this.countQuestions > this.pb) {
                this.pb = this.countQuestions
                this.newPb = true
                setStorage(CONFIG.PB_KEY, this.pb)
            }
            if (this.countQuestions > this.scoreboard[2].score) {
                let index = 0
                while (this.scoreboard[index].score > this.countQuestions) {
                    index++
                }
                this.scoreboard.splice(index, 0, { username: this.username, score: this.countQuestions })
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
    },
    template: `
        <header class="w-100 flex-center position-relative">
            <h1>Quizz de Culture Générale</h1>
            <div v-if="state === STATES.GAME && !training"
                class="flex-center flex-row-reverse gap-2 position-absolute top-0 start-0 bottom-0">
                Score: {{ countQuestions }}
            </div>
            <div v-if="state === STATES.GAME && !training"
                class="flex-center flex-row-reverse gap-2 position-absolute top-0 end-0 bottom-0">
                <div v-for="n in MAX_LIVES"
                    :key="n"
                    class="life"
                    :class="n <= lives ? 'active' : ''"></div>
            </div>
        </header>
        <div class="container flex-grow-1 flex-center">
            <MenuCmp
                v-if="state === STATES.MENU"
                :username="username"
                :pb="pb"
                :scoreboard="scoreboard"
                :themes="themes()"
                @change-username="changeUsername"
                @play="play" />
            <QuestionCmp
                v-else-if="state === STATES.GAME && !questionTransition"
                :data="currentQuestion"
                :countdown="countdown"
                :selectedAnswer="selectedAnswer"
                :correctIndex="countdown.ended ? currentQuestion.correctIndex : null"
                @select-answer="selectAnswer"
                @stop="gameOver(true)" />
            <EndScreenCmp
                v-else-if="state === STATES.END"
                :score="countQuestions"
                :pb="pb"
                :newPb="newPb"
                @continue="() => state = STATES.MENU" />
        </div>
    `,
}

createApp(app)
    .component("MenuCmp", MenuCmp)
    .component("QuestionCmp", QuestionCmp)
    .component("EndScreenCmp", EndScreenCmp)
    .mount("#app");