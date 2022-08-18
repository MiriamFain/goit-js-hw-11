import './css/styles.css';
import { FetchImagesApi } from './js/fetchImagesApi';
import { LoadMoreBtn } from './js/load-more-btn';
// import { galleryItem } from './js/gallery-item';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import templateCards from './templates/gallery_item.hbs';

const refs = {
  searchForm: document.querySelector('#search-form'),
  galleryList: document.querySelector('.gallery'),
};

const fetchImagesApi = new FetchImagesApi();
const loadMoreBtn = new LoadMoreBtn({ selector: '.load-more', hidden: true });
const lightbox = new SimpleLightbox('.gallery a', { captionDelay: 250 });

function onSearch(event) {
  event.preventDefault();

  const inputValue = event.currentTarget.elements.searchQuery.value.trim();
  if (inputValue === '') {
    return Notify.info(`Enter a word to search for images.`);
  }
  fetchImagesApi.searchQuery = inputValue;
  loadMoreBtn.show();
  fetchImagesApi.resetPage();
  clearGallery();
  fetchImages();
}

function fetchImages() {
  loadMoreBtn.hide();
  fetchImagesApi
    .fetchImages()
    .then(({ data }) => {
      if (data.total === 0) {
        Notify.info(
          `Sorry, there are no images matching your search query: ${fetchImagesApi.searchQuery}. Please try again.`
        );
        loadMoreBtn.hide();
        return;
      }
      console.log(data);
      createGallery(data);
      loadMoreBtn.show();
      onPageScrolling();
      lightbox.refresh();
      const { total } = data;

      if ((fetchImagesApi.page - 1) * 40 > data.total) {
        Notify.info(
          `We're sorry, but you've reached the end of search results.`
        );
        loadMoreBtn.hide();
      } else {
        loadMoreBtn.enable();
        Notify.success(`Hooray! We found ${total} images.`);
      }
    })
    .catch(handleError);
}

function handleError() {
  console.log('Error!');
}

function createGallery(data) {
  refs.galleryList.insertAdjacentHTML('beforeend', templateCards(data.hits));
  //   refs.galleryList.insertAdjacentHTML('beforeend', galleryItem(data));
}

function clearGallery() {
  refs.galleryList.innerHTML = '';
}

function onPageScrolling() {
  const { height: cardHeight } =
    refs.galleryList.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

refs.searchForm.addEventListener('submit', onSearch);
loadMoreBtn.refs.button.addEventListener('click', fetchImages);
