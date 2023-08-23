import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchSearch } from './images-api.js';

// Елементи для роботи скірпта
const gallery = document.querySelector('#gallery');
const searchForm = document.querySelector('#search-form');
let searchQuery = '';
let currentPage = 1;

// Плавне прокручування до верху
function smoothScrollToTop() {
  const duration = 500;
  const start = performance.now();
  const from = window.scrollY;

  function scroll(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, easeInOutCubic(progress, from, -from, 1));

    if (progress < 1) {
      requestAnimationFrame(scroll);
    }
  }

  function easeInOutCubic(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t * t + b;
    t -= 2;
    return (c / 2) * (t * t * t + 2) + b;
  }

  requestAnimationFrame(scroll);
}

// Функція debounce для відкладеного виклику функції
function waitEnd(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Функція для перевірки, чи користувач дійшов до самого низу сторінки
function isAtBottom() {
  const windowHeight = window.innerHeight;
  const bodyHeight = document.body.offsetHeight;
  const scrollY = window.scrollY;

  return scrollY + windowHeight >= bodyHeight;
}

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
      'afterbegin',
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
}

searchForm.onsubmit = function (event) {
  event.preventDefault();

  // Отримуємо значення з поля пошуку
  searchQuery = event.target[0].value;

  // Перевіряємо пошукове значення на пустоту
  if (searchQuery == '') {
    gallery.innerHTML = 'Немає пошукової фрази';
  } else {
    // Виконуємо запит і наповнюємо select опціями
    fetchSearch(searchQuery, currentPage)
      .then(res => {
        if (typeof res == 'undefined') {
          return;
        }
        const { hits } = res;

        // Перед виодом очищуємо html галереъ
        gallery.innerHTML = '';

        // Виводимо значення до галереї
        viewSearchItems(hits);

        // Плавне прокручування до верху
        smoothScrollToTop();

        // Збільшуємо поточну сторінку
        currentPage++;
      })
      .catch(error => {
        console.error('Error fetching breeds:', error);
      });
  }
};

// Відстежування події скролу
window.addEventListener(
  'scroll',
  waitEnd(() => {
    if (isAtBottom()) {
      // Виконуємо запит і наповнюємо select опціями
      fetchSearch(searchQuery, currentPage)
        .then(res => {
          if (typeof res == 'undefined') {
            return Notiflix.Notify.info('Ви дійшли до останньої сторінки.');
          }

          const { hits } = res;

          // Виводимо значення до галереї
          viewSearchItems(hits, true);

          // Збільшуємо поточну сторінку
          currentPage++;
        })
        .catch(error => {
          console.error('Error fetching breeds:', error);
        });
    }
  }, 300)
);
