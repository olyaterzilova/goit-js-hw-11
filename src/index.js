import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchSearch } from './images-api.js';

// Елементи для роботи скірпта
const gallery = document.querySelector('#gallery');
const searchForm = document.querySelector('#search-form');
const btnLoadMore = document.querySelector('.js-load-more');
let searchQuery = '';
let currentPage = 1;
let maxPage = 1;

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

// При завантаженні ховаємо кнопку load more
setVisible(btnLoadMore, 'hide');

// Використовуэмо бібліотеку галереї
const galleryBox = new SimpleLightbox('.gallery a', {
  sourceAttr: 'href',
});

// Вивід результатів пошуку
function viewSearchItems(items, needFocus = false) {
  // Активовує фокус на елементі
  let attrIdFocus = '';

  // Перевіряємо на пустоту
  if (items.length == 0) {
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  //  Виводимо всі результати
  items.forEach((element, index) => {
    const {
      id,
      largeImageURL,
      webformatURL,
      views,
      likes,
      comments,
      downloads,
      tags,
    } = element;

    if (index === 0 && needFocus == true) {
      // Формуємо id елементу який потрібно показати
      attrIdFocus = 'img-' + id;
    }

    gallery.insertAdjacentHTML(
      'beforeend',
      `<div class="photo-card" id="${attrIdFocus}">
        <a href="${largeImageURL}" class="photo-card-img-holder">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item"><b>Likes</b>${likes}</p>
          <p class="info-item"><b>Views</b>${views}</p>
          <p class="info-item"><b>Comments</b>${comments}</p>
          <p class="info-item"><b>Downloads</b>${downloads}</p>
        </div>
      </div>`
    );
  });

  // Активовуэмо перший елемент
  if (needFocus == true) {
    // Перевіряємо, чи це перший новий елемент
    document.querySelector('#' + attrIdFocus).scrollIntoView({
      behavior: 'smooth', // Плавна прокрутка
      block: 'start', // Прокручувати до верху елементу
    });
  }

  // Оновлювати бібліотеку
  galleryBox.refresh();

  console.log('items.length: ', items.length);
  // При завантаженні ховаємо кнопку load more
  if (items.length >= 40) {
    setVisible(btnLoadMore, 'show');
  } else {
    setVisible(btnLoadMore, 'hide');
  }
}

// Запускаємо пошук по запиту
searchForm.onsubmit = function (event) {
  event.preventDefault();

  // Скасовуємо сторінки і починоємо з першої
  currentPage = 1;

  // Отримуємо значення з поля пошуку
  searchQuery = event.target[0].value.trim();

  // Перевіряємо пошукове значення на пустоту
  if (searchQuery == '') {
    // Оповіщуємо користувача
    Notiflix.Notify.info('Немає пошукової фрази.');
  } else {
    // Виконуємо запит і наповнюємо select опціями
    fetchSearch(searchQuery, currentPage, maxPage)
      .then(res => {
        // Якщо існує результат виконуємо код
        if (res == false || res.totalHits == 0) {
          Notiflix.Notify.info('По вашому запиту результатів не знайдено.');
          gallery.innerHTML = '';
          setVisible(btnLoadMore, 'hide');
          return;
        }

        // Формуємо максимальну сторінку
        maxPage = Math.floor(res.totalHits / 40);

        // Перевіряємо чи значення не ноль
        if (maxPage == 0) {
          maxPage = 1;
        }

        // Якщо результат немає записів, зупиняємо код
        if (typeof res == 'undefined') {
          return;
        }
        const { hits } = res;

        // Перед виодом очищуємо html галереъ
        gallery.innerHTML = '';

        // Виводимо значення до галереї
        viewSearchItems(hits);

        // Збільшуємо поточну сторінку
        currentPage++;
      })
      .catch(error => {
        console.error('Error fetching breeds:', error);
      });
  }
};

// Виконуємо запит і наповнюємо select опціями
btnLoadMore.onclick = () => {
  fetchSearch(searchQuery, currentPage, maxPage)
    .then(res => {
      if (res == false) {
        // Оповіщуємо користувача
        Notiflix.Notify.info('Ви дійшли до останньої сторінки.');

        // Ховаємо кнопку load more
        setVisible(btnLoadMore, 'hide');

        // Зупиняємо виконання коду
        return false;
      }

      const { hits } = res;

      // Збільшуємо поточну сторінку
      currentPage++;

      // Виводимо значення до галереї
      viewSearchItems(hits, true);
    })
    .catch(error => {
      console.error('Error fetching breeds:', error);
    });
};
