const EndScreenCmp = {
    props: ["score", "pb", "newPb"],
    template: `
        <div class="card text-white bg-secondary">
            <div class="card-header">
                {{newPb ? 'Nouveau Meilleur Score !' : 'Dommage !'}}
            </div>
            <div class="card-body flex-center flex-column">
                <h3>Score: {{ score }}</h3>
                <div class="d-flex gap-2 mt-2">
                    <button @click="$emit('continue')" class="btn btn-success w-auto">Continuer</button>
                </div>
            </div>
        </div>
    `,
}