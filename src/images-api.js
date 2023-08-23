import axios from 'axios';

// Функція для виконання HTTP GET-запиту
async function fetchSearch(searchQuery = '', page = 1) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=39009543-2fb85b877c64322c9f1714413&per_page=40&page=${page}&q=${searchQuery}`
    );
    return response.data;
  } catch (error) {
    // throw new Error(`Axios error fetchSearch! ${error.message}`);
  }
}

export { fetchSearch };
