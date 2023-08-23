import { fetchSearch } from './images-api.js';

// Pавантаження даних
function setVisible(el, type = 'hide') {
  if (type == 'hide') {
    // el.style.display = 'none';
    el.classList.add('hide');
    el.classList.remove('show');
  } else {
    // el.style.display = 'block';
    el.classList.add('show');
    el.classList.remove('hide');
  }
}

// Виконуємо запит і наповнюємо select опціями
fetchSearch('woman')
  .then(res => {
    console.log(res);
  })
  .catch(error => {
    console.error('Error fetching breeds:', error);
  });
