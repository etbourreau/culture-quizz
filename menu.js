const MenuCmp = {
    props: ['username', 'pb', 'scoreboard', 'themes'],
    setup(props) {
        const STATES = {
            MAIN: 0,
            THEME_SELECTION: 1,
            USERNAME_TYPING: 2,
        }
        return {
            name: ref(props.username),
            STATES,
            state: ref(STATES.MAIN),
            showScoreboard: ref(false),

            callback: null,
        }
    },
    methods: {
        saveName() {
            this.$emit('change-username', this.name)
        },
        play(theme) {
            if (this.name.length < 3) {
                this.state = this.STATES.USERNAME_TYPING
                this.callback = () => this.play(theme)
            } else {
                this.$emit('play', theme)
            }
        },
    },
    template: `
        <div class="card text-white bg-secondary" v-if="state === STATES.MAIN">
            <div class="card-header pt-3">
                <h2 v-if="name.length > 0">Bonjour {{ name }}! <button class="btn btn-warning p-1 py-0" @click="state = STATES.USERNAME_TYPING"><small>Changer de nom</small></button></h2>
                <h2 v-else>Bienvenue !</h2>
            </div>
            <div class="card-body flex-center flex-column">
                <h3 v-if="pb > 0">Mon Meilleur Score: {{ pb }}</h3>
                <button class="btn"
                :class="showScoreboard ? 'btn-danger' : 'btn-primary'"
                @click="showScoreboard = !showScoreboard">Tableau des scores</button>
                <div class="d-flex gap-2 mt-2">
                    <button @click="play()" class="btn btn-success w-auto">Jouer</button>
                    <button @click="state = STATES.THEME_SELECTION" class="btn btn-success w-auto">S'entraîner</button>
                </div>
            </div>
        </div>
        <div class="card text-white bg-secondary" v-else-if="state === STATES.THEME_SELECTION">
            <div class="card-header">
                <h2 class="ms-4">Choisissez un thème</h2>
                <div class="close-btn cursor-pointer position-absolute top-0 start-0 m-1"
                    @click="state = STATES.MAIN">❌</div>
            </div>
            <div class="card-body flex-center flex-column">
                <div class="row">
                    <div class="col-6 col-md-3 p-1"
                        v-for="(theme, i) in themes" :key="i">
                        <button class="btn btn-success w-100"
                            @click="play(theme)">
                            {{ theme }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="card text-white bg-secondary" v-else-if="state === STATES.USERNAME_TYPING">
            <div class="card-header">
                <h2 class="ms-4">Entrez votre nom</h2>
                <div class="close-btn cursor-pointer position-absolute top-0 start-0 m-1"
                    @click="state = STATES.MAIN">❌</div>
            </div>
            <div class="card-body flex-center flex-column">
                <input type="text" v-model="name" class="form-control w-75" />
                <div class="row gap-2 mt-2">
                    <button class="btn btn-danger w-auto" @click="state = STATES.MAIN">Annuler</button>
                    <button class="btn btn-success w-auto"
                        :disabled="name.length < 3"
                        @click="saveName(); callback ? callback() : state = STATES.MAIN">
                        {{callback ? 'Jouer' : 'Valider'}}
                    </button>
                </div>
            </div>
        </div>

        <div class="scoreboard-wrapper position-fixed p-3"
        :style="{transform: showScoreboard ? 'translate(0, -50%)' : 'translate(100%, -50%)'}">
            <div class="card text-white bg-dark scoreboard p-2 position-relative">
                <h3>Tableau des Scores</h3>
                <ul>
                    <li v-for="score in scoreboard" :key="score.username">
                        {{ score.username }}: {{ score.score }}
                    </li>
                </ul>
                <div class="close-btn cursor-pointer position-absolute top-0 end-0 m-1"
                @click="showScoreboard = false">❌</div>
            </div>
        </div>
    `,
}