const menuIcon = document.querySelector('.menu-icon');
menuIcon.addEventListener('click', () => {
	const menu = document.querySelector('.menu');
	if (menu.classList.contains('hide')) {
		menu.classList.remove('hide');
	} else {
		menu.classList.add('hiding');
		setTimeout(() => {
			menu.classList.add('hide');
			menu.classList.remove('hiding');
		}, 300)
	}
})

const lightbox = document.querySelector('.lightbox');
let timeout;

const lightboxThumbnail = document.querySelectorAll('.lightbox-thumbnail');
lightboxThumbnail.forEach(thumbnail => {
	thumbnail.addEventListener('click', e => {
		const img = e.currentTarget.querySelector('img');
		const lightboxImg = lightbox.querySelector('.lightbox-image');
		const lightboxLoader = lightbox.querySelector('.lightbox-loader');
		timeout = setTimeout(() => {
			if (!lightboxImg.classList.contains('lightbox-loaded')) {
				lightboxLoader.classList.remove('hide');
				lightboxImg.classList.add('hide');
			}
		}, 250);
		lightboxImg.onload = function() {
			lightboxImg.classList.remove('hide');
			lightboxLoader.classList.add('hide');
			lightboxImg.classList.add('lightbox-loaded');
		}
		lightboxImg.src = img.dataset.image
		document.body.classList.add('show-lightbox')
		document.body.style.overflowY = 'auto';
		document.body.style.position = 'fixed';
		document.body.style.top = `-${window.scrollY}px`;
	})
})

if (lightbox) {
	lightbox.addEventListener('click', e => {
		if (e.target.classList.contains('lightbox-image')) {
			return;
		}
		const scrollY = document.body.style.top;
		document.body.style.overflowY = '';
		document.body.style.position = '';
		document.body.style.top = '';
		window.scrollTo(0, parseInt(scrollY || '0') * -1);
		document.body.classList.remove('show-lightbox');
		const lightboxImg = lightbox.querySelector('.lightbox-image');
		lightboxImg.classList.remove('lightbox-loaded');
		setTimeout(() => {
			lightboxImg.src = '';
		}, 499);
		clearTimeout(timeout);
	})
}

const addGalleryButton = document.querySelector('.add-gallery-item button');

if (addGalleryButton) {
	addGalleryButton.addEventListener('click', e => {
		e.preventDefault();
		const input1 = createLabelInput('Gallery Image', 'galleryImage');
		const input2 = createLabelInput('Gallery Thumbnail (450x450)', 'galleryThumbnail');
		const addGalleryInputArea = document.querySelector('.add-gallery-item-inputs');
		addGalleryInputArea.appendChild(input1);
		addGalleryInputArea.appendChild(input2);
	})
}

function createLabelInput(labelText, inputName) {
	const label = document.createElement('label');
	label.innerHTML = labelText;
	label.dataset.deleteOnReset = 'true';
	const input = document.createElement('input');
	input.type = 'file';
	input.name = inputName;
	label.appendChild(input);
	return label;
}


const resetButton = document.querySelector('input[type="reset"]');

if (resetButton) {
	resetButton.addEventListener('click', e => {
		document.querySelectorAll('[data-delete-on-reset]').forEach(element => {
			element.remove();
		})
	})
}

document.querySelectorAll('[data-gallery-delete-id]').forEach(element => {
	element.addEventListener('click', e => {
		e.preventDefault();
		const element = e.currentTarget;
		fetch(
			`${window.location.pathname}/${element.dataset.galleryDeleteId}`,
			{ method: 'DELETE' }
		).then(response => {
			element.remove();
		})
	})
})

const submitButton = document.querySelector('.save');
if (submitButton) {
	submitButton.addEventListener('click', e => {
		const galleryAddParents = document.querySelectorAll('.add-gallery-item-inputs');
		galleryAddParents.forEach(item => {
			const fileInputs = item.querySelectorAll('input');
			if (fileInputs[0].files.length !== fileInputs[1].files.length) {
				e.preventDefault();
				// TODO: Not alert
				alert('Missing Gallery Image Thumbnail!');
			}
		})
	})
}