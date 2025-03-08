const { nextTick } = Vue;

const QuestionCmp = {
    props: ["data", "countdown", "selectedAnswer", "correctIndex"],
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
        getBtnClass(i) {
            if(isNil(this.correctIndex)) {
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
    template: `
        <div class="flex-center flex-column">
            <div class="card text-white bg-secondary">
                <div class="card-header">
                    <h5 class="w-100 flex-center">Thème: {{ data.theme }}</h5>
                </div>
                <div class="card-body">
                    <h3>{{ data.question }}</h3>
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
                        <h3 :class="correctIndex === selectedAnswer ? 'text-success' : 'text-danger'">
                            {{correctIndex === selectedAnswer ? 'Bravo !' : 'Dommage !'}}
                        </h3>
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
            <div class="flex-center w-100 mt-4">
            <button class="btn btn-danger" @click="$emit('stop')">{{ countdown.end ? 'Abandonner' : 'Quitter' }}</button>
            </div>
        </div>
    `,
}