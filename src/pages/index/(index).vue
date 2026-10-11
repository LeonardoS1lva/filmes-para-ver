<template>
  <q-page class="movie-page">
    <main class="page-content">
      <header class="app-header">
        <div class="brand-mark" aria-hidden="true">
          <q-icon name="movie_filter" size="25px" />
        </div>
        <div>
          <h1 class="brand-name">Filmes para Ver</h1>
          <p class="brand-subtitle">Sua próxima história favorita começa aqui.</p>
        </div>
      </header>

      <section class="search-section" aria-labelledby="search-heading">
        <div class="section-kicker">
          <span class="kicker-line"></span>
          SUA PRÓXIMA SESSÃO
        </div>
        <h2 id="search-heading" class="search-heading">O que você quer assistir?</h2>
        <p class="search-copy">
          Encontre um filme e guarde na sua lista para assistir quando quiser.
        </p>

        <div class="search-form">
          <q-input
            :model-value="searchTerm"
            class="movie-search"
            dark
            outlined
            clearable
            :loading="searchLoading"
            aria-label="Buscar filme pelo título"
            placeholder="Digite o título de um filme"
            autocomplete="off"
            @update:model-value="updateSearchTerm"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <q-banner v-if="wishlistError" class="feedback-banner" rounded dense role="alert">
          {{ wishlistError }}
        </q-banner>

        <section
          v-if="hasSearched"
          class="search-results"
          aria-labelledby="results-heading"
          aria-live="polite"
          :aria-busy="searchLoading"
        >
          <div class="results-heading-row">
            <div>
              <p class="section-kicker results-kicker">RESULTADOS</p>
              <h3 id="results-heading" class="results-heading">
                {{ searchTerm.trim() ? `Busca por “${searchTerm.trim()}”` : 'Sugestões para você' }}
              </h3>
            </div>
            <span v-if="searchStatus === 'success'" class="results-count">
              {{ searchResults.length }} {{ searchResults.length === 1 ? 'filme' : 'filmes' }}
            </span>
          </div>

          <q-banner v-if="searchError" class="feedback-banner" rounded role="alert">
            {{ searchError }}
          </q-banner>

          <div v-else-if="searchLoading" class="search-progress" role="status">
            <q-spinner color="amber-8" size="24px" aria-hidden="true" />
            <span>Buscando filmes no TMDB...</span>
          </div>

          <div v-else-if="searchResults.length" class="movie-grid results-grid">
            <q-card v-for="movie in searchResults" :key="movie.id" class="movie-card" flat>
              <q-img
                class="poster-image"
                :src="getPosterUrl(movie.posterPath)"
                :error-src="posterFallback"
                :alt="`Pôster de ${movie.title}`"
                :ratio="2 / 3"
                fit="cover"
                no-spinner
              />
              <q-card-section class="movie-details">
                <h4 class="movie-title">{{ movie.title }}</h4>
                <p class="movie-year">{{ getMovieYear(movie) }}</p>
                <q-btn
                  class="card-action"
                  :class="{ 'is-saved': isInWishlist(movie.id) }"
                  :disable="isInWishlist(movie.id)"
                  :color="isInWishlist(movie.id) ? 'grey-8' : 'amber-8'"
                  :text-color="isInWishlist(movie.id) ? 'grey-4' : 'dark'"
                  unelevated
                  no-caps
                  :icon="isInWishlist(movie.id) ? 'check' : 'add'"
                  :label="isInWishlist(movie.id) ? 'Na sua lista' : 'Adicionar à lista'"
                  :aria-label="
                    isInWishlist(movie.id)
                      ? `${movie.title} já está na sua lista`
                      : `Adicionar ${movie.title} à lista`
                  "
                  @click="addMovie(movie)"
                />
              </q-card-section>
            </q-card>
          </div>
          <div v-else-if="searchStatus === 'success'" class="empty-state search-empty">
            <q-icon name="movie" size="30px" aria-hidden="true" />
            <p>Nenhum filme encontrado para esta busca. Tente outro título.</p>
          </div>
        </section>
      </section>

      <section class="wishlist-section" aria-labelledby="wishlist-heading">
        <div class="wishlist-heading-row">
          <div>
            <p class="section-kicker">SUA COLEÇÃO PESSOAL</p>
            <h2 id="wishlist-heading" class="wishlist-heading">Filmes para assistir</h2>
          </div>
          <span class="wishlist-count" aria-label="Quantidade de filmes na lista">
            <q-icon name="bookmark_border" size="17px" aria-hidden="true" />
            {{ wishlist.length }} {{ wishlist.length === 1 ? 'filme' : 'filmes' }}
          </span>
        </div>

        <div v-if="wishlist.length" class="movie-grid">
          <q-card v-for="movie in wishlist" :key="movie.id" class="movie-card" flat>
            <q-img
              class="poster-image"
              :src="getPosterUrl(movie.posterPath)"
              :error-src="posterFallback"
              :alt="`Pôster de ${movie.title}`"
              :ratio="2 / 3"
              fit="cover"
              no-spinner
            />
            <q-card-section class="movie-details">
              <h3 class="movie-title">{{ movie.title }}</h3>
              <p class="movie-year">{{ getMovieYear(movie) }}</p>
              <q-btn
                class="remove-button"
                flat
                no-caps
                icon="remove_circle_outline"
                label="Remover da lista"
                :aria-label="`Remover ${movie.title} da lista`"
                @click="requestRemoval(movie)"
              />
            </q-card-section>
          </q-card>
        </div>

        <div v-else class="empty-state wishlist-empty">
          <q-icon name="local_movies" size="34px" aria-hidden="true" />
          <h3>Sua lista está esperando pelo primeiro filme</h3>
          <p>Use a busca acima para encontrar histórias que você quer assistir.</p>
        </div>
      </section>

      <footer class="app-footer">
        <span class="footer-note">
          <q-icon name="movie_creation" size="16px" aria-hidden="true" />
          Uma lista feita para a sua próxima sessão de cinema.
        </span>
        <div class="tmdb-credits" aria-label="Créditos">
          <span>Créditos: dados e imagens por</span>
          <a
            class="tmdb-attribution"
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TMDB — The Movie Database"
          >
            <img
              class="tmdb-logo"
              src="https://www.themoviedb.org/assets/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg"
              alt="TMDB"
            />
          </a>
        </div>
        <p class="tmdb-notice">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </footer>
    </main>

    <q-dialog v-model="showRemoveDialog">
      <q-card class="remove-dialog">
        <q-card-section>
          <p class="section-kicker">ATUALIZAR SUA LISTA</p>
          <h2 class="dialog-heading">Remover filme?</h2>
          <p class="dialog-copy">
            {{ pendingRemoval?.title }} será removido da sua lista de filmes para assistir.
          </p>
        </q-card-section>
        <q-card-actions align="right" class="dialog-actions">
          <q-btn v-close-popup flat no-caps label="Manter filme" />
          <q-btn color="negative" unelevated no-caps label="Remover" @click="confirmRemoval" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getPosterUrl, searchMovies as searchTmdbMovies } from '../../services/tmdb.js'
import { loadWishlist, saveWishlist } from '../../services/wishlist-storage.js'

const posterFallback = '/poster-placeholder.svg'

const restoredWishlist = loadWishlist()
const wishlist = ref(restoredWishlist.movies)
const wishlistError = ref(restoredWishlist.error)
const searchTerm = ref('')
const hasSearched = ref(false)
const searchResults = ref([])
const searchStatus = ref('idle')
const searchError = ref('')
const showRemoveDialog = ref(false)
const pendingRemoval = ref(null)
const searchLoading = ref(false)
let debounceTimer
let activeSearchController = null
let searchRequestId = 0
let pendingQuery = ''

watch(searchTerm, (value, _, onCleanup) => {
  clearTimeout(debounceTimer)
  activeSearchController?.abort()
  activeSearchController = null
  pendingQuery = ''
  searchRequestId += 1

  const query = typeof value === 'string' ? value.trim() : ''
  searchResults.value = []
  searchError.value = ''
  hasSearched.value = Boolean(query)
  searchStatus.value = query ? 'loading' : 'idle'
  searchLoading.value = false

  if (query) {
    debounceTimer = setTimeout(() => runSearch(query), 350)
  }

  onCleanup(() => clearTimeout(debounceTimer))
})

function updateSearchTerm(value) {
  searchTerm.value = typeof value === 'string' ? value : ''
}

async function runSearch(query) {
  if (searchLoading.value && pendingQuery === query) {
    return
  }

  activeSearchController?.abort()
  const controller = new AbortController()
  activeSearchController = controller
  pendingQuery = query
  const requestId = ++searchRequestId
  searchLoading.value = true
  searchStatus.value = 'loading'
  searchError.value = ''
  hasSearched.value = true

  try {
    const movies = await searchTmdbMovies(query, controller.signal)
    if (requestId !== searchRequestId) {
      return
    }

    searchResults.value = movies
    searchStatus.value = 'success'
  } catch (error) {
    if (controller.signal.aborted || requestId !== searchRequestId) {
      return
    }

    searchError.value =
      error instanceof Error
        ? error.message
        : 'Não foi possível buscar filmes no TMDB. Tente novamente.'
    searchStatus.value = 'error'
  } finally {
    if (requestId === searchRequestId) {
      searchLoading.value = false
      pendingQuery = ''
      activeSearchController = null
    }
  }
}

function getMovieYear(movie) {
  return /^\d{4}/.test(movie.releaseDate) ? movie.releaseDate.slice(0, 4) : 'Ano não informado'
}

function isInWishlist(movieId) {
  return wishlist.value.some((movie) => movie.id === movieId)
}

function addMovie(movie) {
  if (isInWishlist(movie.id)) {
    return
  }

  const nextWishlist = [
    ...wishlist.value,
    {
      id: movie.id,
      title: movie.title,
      releaseDate: movie.releaseDate,
      posterPath: movie.posterPath,
    },
  ]

  try {
    saveWishlist(nextWishlist)
    wishlist.value = nextWishlist
    wishlistError.value = ''
  } catch {
    wishlistError.value =
      'Não foi possível salvar a lista neste navegador. Verifique o espaço disponível.'
  }
}

function requestRemoval(movie) {
  pendingRemoval.value = movie
  showRemoveDialog.value = true
}

function confirmRemoval() {
  if (pendingRemoval.value) {
    const nextWishlist = wishlist.value.filter((movie) => movie.id !== pendingRemoval.value.id)

    try {
      saveWishlist(nextWishlist)
      wishlist.value = nextWishlist
      wishlistError.value = ''
      pendingRemoval.value = null
      showRemoveDialog.value = false
    } catch {
      wishlistError.value =
        'Não foi possível atualizar a lista neste navegador. Verifique o espaço disponível.'
    }
  }
}
</script>

<style scoped>
.movie-page {
  background:
    radial-gradient(ellipse at 50% -20%, rgb(75 57 32 / 22%), transparent 46%), var(--movie-bg);
  color: var(--movie-text);
}

.page-content {
  width: min(100% - 48px, 1180px);
  margin: 0 auto;
  padding: 34px 0 26px;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--movie-border);
}

.brand-mark {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border: 1px solid rgb(226 178 98 / 45%);
  border-radius: 12px;
  color: var(--movie-accent);
}

.brand-name,
.brand-subtitle,
.search-heading,
.search-copy,
.wishlist-heading,
.results-heading,
.movie-title,
.movie-year,
.dialog-heading,
.dialog-copy,
.empty-state h3,
.empty-state p {
  margin: 0;
}

.brand-name {
  font-size: 20px;
  font-weight: 650;
  letter-spacing: -0.35px;
}

.brand-subtitle {
  margin-top: 4px;
  color: var(--movie-muted);
  font-size: 13px;
}

.search-section {
  padding: 52px 0 48px;
  border-bottom: 1px solid var(--movie-border);
}

.section-kicker {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 10px;
  color: var(--movie-accent);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.45px;
}

.kicker-line {
  width: 20px;
  height: 1px;
  background: var(--movie-accent);
}

.search-heading {
  font-size: clamp(27px, 4vw, 36px);
  font-weight: 600;
  letter-spacing: -1.1px;
}

.search-copy {
  margin-top: 9px;
  color: var(--movie-muted);
  font-size: 14px;
}

.search-form {
  display: flex;
  max-width: 740px;
  align-items: flex-start;
  margin-top: 25px;
}

.movie-search {
  flex: 1;
}

.search-results {
  margin-top: 36px;
}

.feedback-banner {
  margin-top: 15px;
  border: 1px solid rgb(206 129 81 / 30%);
  background: #29221b;
  color: #f0c39d;
}

.search-progress {
  display: flex;
  min-height: 92px;
  align-items: center;
  justify-content: center;
  gap: 11px;
  border: 1px dashed #393630;
  border-radius: 10px;
  color: var(--movie-muted);
  font-size: 13px;
}

.results-heading-row,
.wishlist-heading-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 19px;
}

.results-kicker {
  margin-bottom: 6px;
}

.results-heading {
  font-size: 19px;
  font-weight: 550;
}

.results-count,
.wishlist-count {
  color: var(--movie-muted);
  font-size: 12px;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 22px 18px;
}

.movie-card {
  overflow: hidden;
  border: 1px solid var(--movie-border);
  border-radius: 10px;
  background: var(--movie-card);
  transition:
    border-color 160ms ease,
    transform 160ms ease;
}

.movie-card:hover {
  transform: translateY(-3px);
  border-color: rgb(226 178 98 / 48%);
}

.poster-image {
  background: #252321;
}

.movie-details {
  padding: 13px 13px 12px;
}

.movie-title {
  overflow: hidden;
  min-height: 40px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.movie-year {
  margin-top: 3px;
  color: var(--movie-muted);
  font-size: 12px;
}

.card-action {
  width: 100%;
  min-height: 36px;
  margin-top: 13px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.card-action.is-saved {
  opacity: 1 !important;
}

.wishlist-section {
  padding-top: 36px;
}

.wishlist-heading-row {
  align-items: center;
  margin-bottom: 20px;
}

.wishlist-heading-row .section-kicker {
  margin-bottom: 5px;
}

.wishlist-heading {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.45px;
}

.wishlist-count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border: 1px solid var(--movie-border);
  border-radius: 20px;
}

.remove-button {
  width: 100%;
  min-height: 34px;
  margin-top: 10px;
  border-radius: 6px;
  color: #c1bcb3;
  font-size: 12px;
}

.remove-button:hover {
  color: #ef9b91;
  background: rgb(220 91 76 / 10%);
}

.empty-state {
  display: flex;
  align-items: center;
  flex-direction: column;
  color: var(--movie-muted);
  text-align: center;
}

.wishlist-empty {
  min-height: 230px;
  justify-content: center;
  padding: 32px 20px;
  border: 1px dashed #393630;
  border-radius: 10px;
}

.wishlist-empty > .q-icon,
.search-empty > .q-icon {
  margin-bottom: 12px;
  color: var(--movie-accent);
}

.empty-state h3 {
  color: var(--movie-text);
  font-size: 16px;
  font-weight: 550;
}

.empty-state p {
  margin-top: 7px;
  font-size: 13px;
}

.search-empty {
  padding: 28px 14px;
  border: 1px dashed #393630;
  border-radius: 10px;
  font-size: 13px;
}

.app-footer {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 9px;
  padding-top: 36px;
  color: #77736c;
  font-size: 11px;
}

.footer-note {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.tmdb-attribution {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 4px;
  border-radius: 3px;
  background: #fff;
  min-height: 25px;
}

.tmdb-credits {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.tmdb-logo {
  display: block;
  width: 38px;
  max-height: 28px;
  object-fit: contain;
}

.tmdb-notice {
  max-width: 480px;
  margin: 0;
  color: #77736c;
  font-size: 10px;
  line-height: 1.5;
  text-align: center;
}

.remove-dialog {
  width: min(420px, calc(100vw - 32px));
  border: 1px solid var(--movie-border);
  border-radius: 12px;
  background: #1b1a18;
  color: var(--movie-text);
}

.dialog-heading {
  font-size: 22px;
  font-weight: 600;
}

.dialog-copy {
  margin-top: 9px;
  color: var(--movie-muted);
  font-size: 14px;
  line-height: 1.6;
}

.dialog-actions {
  padding: 0 16px 16px;
}

@media (max-width: 1000px) {
  .movie-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .page-content {
    width: min(100% - 36px, 620px);
  }

  .movie-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px 13px;
  }

  .movie-details {
    padding: 11px 10px 9px;
  }

  .search-section {
    padding: 42px 0 38px;
  }
}

@media (max-width: 520px) {
  .page-content {
    width: calc(100% - 32px);
    padding-top: 22px;
  }

  .app-header {
    padding-bottom: 22px;
  }

  .brand-mark {
    width: 42px;
    height: 42px;
  }

  .brand-name {
    font-size: 18px;
  }

  .brand-subtitle {
    max-width: 240px;
    font-size: 12px;
  }

  .movie-search {
    width: 100%;
  }

  .movie-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px 12px;
  }

  .wishlist-heading-row {
    align-items: flex-start;
  }

  .wishlist-heading {
    font-size: 19px;
  }

  .wishlist-count {
    margin-top: 17px;
    white-space: nowrap;
  }

  .movie-title {
    font-size: 13px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .movie-card {
    transition: none;
  }
}
</style>
