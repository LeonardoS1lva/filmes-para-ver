export const WISHLIST_STORAGE_KEY = 'filmes-para-ver:wishlist'

function isStoredMovie(movie) {
  return (
    movie !== null &&
    typeof movie === 'object' &&
    Number.isSafeInteger(movie.id) &&
    movie.id > 0 &&
    typeof movie.title === 'string' &&
    movie.title.trim().length > 0 &&
    (typeof movie.releaseDate === 'string' || movie.releaseDate === null) &&
    (typeof movie.posterPath === 'string' || movie.posterPath === null)
  )
}

function normalizeMovie(movie) {
  return {
    id: movie.id,
    title: movie.title.trim(),
    releaseDate: typeof movie.releaseDate === 'string' ? movie.releaseDate : '',
    posterPath:
      typeof movie.posterPath === 'string' && movie.posterPath.startsWith('/')
        ? movie.posterPath
        : '',
  }
}

export function loadWishlist() {
  let serializedMovies

  try {
    serializedMovies = localStorage.getItem(WISHLIST_STORAGE_KEY)
  } catch {
    return {
      movies: [],
      error: 'Não foi possível acessar a lista salva neste navegador.',
    }
  }

  if (serializedMovies === null) {
    return { movies: [], error: '' }
  }

  let parsedMovies
  try {
    parsedMovies = JSON.parse(serializedMovies)
  } catch {
    return {
      movies: [],
      error: 'A lista salva está inválida e não pôde ser restaurada.',
    }
  }

  if (!Array.isArray(parsedMovies)) {
    return {
      movies: [],
      error: 'A lista salva está em um formato inválido e não pôde ser restaurada.',
    }
  }

  const seenIds = new Set()
  const movies = []
  let hadInvalidEntries = false

  for (const movie of parsedMovies) {
    if (!isStoredMovie(movie) || seenIds.has(movie.id)) {
      hadInvalidEntries = true
      continue
    }

    seenIds.add(movie.id)
    movies.push(normalizeMovie(movie))
  }

  return {
    movies,
    error: hadInvalidEntries ? 'Alguns itens inválidos da lista salva foram ignorados.' : '',
  }
}

export function saveWishlist(movies) {
  const minimalMovies = movies.map(normalizeMovie)
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(minimalMovies))
}
