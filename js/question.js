const { nextTick } = Vue;

const QuestionCmp = {
    props: ["data", "countQuestions", "countdown", "selectedAnswer", "correctIndex"],
    setup(props) {
        return {
            transition: ref(`width ${props.countdown.end - now()}ms linear`),
            percent: ref(100),
        }
    },
    mounted() {
        setTimeout(() => {
            this.percent = 0
        }, 50)
    },
    watch: {
        correctIndex() {
        }
    },
    methods: {
        getDifficultyLabel() {
            switch (this.data.difficulty) {
                case 1:
                    return "Moyenne"
                case 2:
                    return "Difficile"
                case 3:
                    return "Très difficile"
                case 0:
                default:
                    return "Facile"
            }
        },
        getBtnClass(i) {
            if (isNil(this.correctIndex)) {
                if (i === this.selectedAnswer) {
                    return "btn-primary"
                }
            } else {
                if (i === this.correctIndex) {
                    return "btn-success"
                } else if (i === this.selectedAnswer) {
                    return "btn-danger"
                }
            }
            return "btn-secondary"
        },
        isNil(value) {
            return isNil(value)
        }
    },
    computed: {
        formattedQuestion() {
            return this.data.question.replace(/\s\?$/, "&nbsp;?")
        },
    },
    template: `
        <div class="flex-center flex-column">
            <div class="card question text-white bg-secondary">
                <div class="card-header">
                    <div class="row position-relative pe-4">
                            <h5 class="col-4 text-center nowrap">Question #{{ countQuestions }}</h5>
                            <h5 class="col-4 text-center nowrap border-start border-end">{{ getDifficultyLabel() }}</h5>
                            <h5 class="col-4 text-center nowrap">{{ data.theme }}</h5>
                        <div class="flex-center position-absolute top-0 end-0 bottom-0 w-auto me-1 p-0"
                            title="Marquer un problème sur la question">
                            <svg class="flag cursor-pointer"
                                :class="{active: data.flagged}"
                                width="100%"
                                height="100%"
                                viewBox="0 0 1920 1920"
                                xmlns="http://www.w3.org/2000/svg"
                                @click="$emit('flag-question', data.question, data.answers)">
                                <path d="M168.941-.011v1920H56v-1920h112.941Zm112.941 68.453c308.669-81.656 496.15 26.429 677.196 133.045 203.407 119.944 413.59 244.066 833.844 139.03 20.217-4.969 41.676 1.469 55.793 17.168 13.892 15.699 18.07 37.835 10.843 57.487-203.407 542.343-504.17 552.734-794.993 562.786-223.285 7.906-454.25 15.811-686.344 247.906l-96.339 96.338Z"
                                    fill-rule="evenodd"/>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <h3 v-html="formattedQuestion"></h3>
                    <div class="progress" v-if="isNil(correctIndex) && countdown.end">
                        <div class="progress-bar progress-bar-striped progress-bar-animated"
                        role="progressbar"
                        :aria-valuenow="percent"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        :style="{
                            width: percent+'%',
                            transition: transition,
                        }"
                        ></div>
                    </div>
                    <div class="flex-center w-100" v-else-if="!isNil(correctIndex)">
                        <h2>
                            <span class="badge" :class="correctIndex === selectedAnswer ? 'bg-success' : 'bg-danger'">
                                {{correctIndex === selectedAnswer ? 'Bravo !' : 'Dommage !'}}
                            </span>
                        </h2>
                    </div>
                </div>
            </div>
            <div class="row w-100 mt-2">
                <div class="col-12 col-md-6 p-1 flex-center"
                    v-for="(answer, i) in data.answers" :key="i">
                    <button class="btn w-100"
                    :class="getBtnClass(i)"
                    :disabled="countdown.ended"
                    @click="$emit('select-answer', i)">{{ answer }}</button>
                </div>
            </div>
            <div class="flex-center w-100 mt-4 gap-2">
                <button class="btn btn-danger"
                    @click="$emit('stop')">{{ countdown.end ? 'Abandonner' : 'Quitter' }}</button>
                <button class="btn btn-success"
                    v-if="!countdown.end && countdown.ended"
                    @click="$emit('select-answer', null)">Continuer</button>
            </div>
        </div>
    `,
}