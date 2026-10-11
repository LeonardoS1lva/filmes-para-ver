const API_BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

const accessToken = import.meta.env.QCLI_TMDB_ACCESS_TOKEN?.trim() ?? ''

export function getPosterUrl(posterPath) {
  if (typeof posterPath !== 'string' || !posterPath.startsWith('/')) {
    return '/poster-placeholder.svg'
  }

  return `${IMAGE_BASE_URL}${posterPath}`
}

export async function searchMovies(query, signal) {
  if (!accessToken) {
    throw new Error(
      'A busca não está configurada. Defina QCLI_TMDB_ACCESS_TOKEN no arquivo .env e reinicie o app.',
    )
  }

  const url = new URL(`${API_BASE_URL}/search/movie`)
  url.searchParams.set('query', query)
  url.searchParams.set('language', 'pt-BR')

  let response
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      signal,
    })
  } catch (error) {
    if (signal.aborted || error?.name === 'AbortError') {
      throw error
    }

    throw new Error('Não foi possível conectar ao TMDB. Verifique sua conexão e tente novamente.', {
      cause: error,
    })
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      'O TMDB recusou a autenticação. Verifique o valor de QCLI_TMDB_ACCESS_TOKEN no arquivo .env.',
    )
  }

  if (!response.ok) {
    throw new Error(
      `Não foi possível buscar filmes no TMDB (erro ${response.status}). Tente novamente.`,
    )
  }

  let data
  try {
    data = await response.json()
  } catch (error) {
    throw new Error('O TMDB retornou uma resposta inválida. Tente novamente mais tarde.', {
      cause: error,
    })
  }

  if (data === null || typeof data !== 'object' || !Array.isArray(data.results)) {
    throw new Error('O TMDB retornou resultados em um formato inesperado.')
  }

  return data.results
    .filter(
      (movie) =>
        movie !== null &&
        typeof movie === 'object' &&
        Number.isSafeInteger(movie.id) &&
        movie.id > 0 &&
        typeof movie.title === 'string' &&
        movie.title.trim().length > 0,
    )
    .map((movie) => ({
      id: movie.id,
      title: movie.title.trim(),
      releaseDate: typeof movie.release_date === 'string' ? movie.release_date : '',
      posterPath:
        typeof movie.poster_path === 'string' && movie.poster_path.startsWith('/')
          ? movie.poster_path
          : '',
    }))
}
