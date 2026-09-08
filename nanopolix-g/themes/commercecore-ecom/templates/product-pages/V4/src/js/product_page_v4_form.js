const reviewButton = document.getElementById('form-modal')
const modalForm = document.getElementById('modal-container')
const starsSelect = document.getElementsByClassName('score-select-stars')[0]
const upload = document.getElementById('upload')
const uploadWrapper = document.getElementsByClassName('file-overlay')[0]
const form = document.getElementById('form-container')
const formError = document.querySelector('.form-error')
const formWrapper = document.querySelector('.form-container__wrapper')
const thankyou = document.querySelector('.thank-you')
const submitButton = document.querySelector('#form-submit')
const bodyWrapper = document.querySelector('body')

reviewButton.addEventListener('click', () => {
	formWrapper.style.display = 'block'
	thankyou.classList.remove('thank-you--active')
	submitButton.setAttribute('loading', false)
	modalForm.setAttribute('visible', true)
	bodyWrapper.classList.add('body-overflow')
	form.reset()
	innerStars.forEach((item) => {
		item.src = item.src.replace('filled-star', 'empty-star')
		item.src = item.src.replace('error-star', 'empty-star')
	})
})

// outside click/close button click

modalForm.addEventListener('click', (e) => {
	e.preventDefault
	if (
		e.target.classList.contains('modal-container') ||
		e.target.classList.contains('form-button--close')
	) {
		modalForm.setAttribute('visible', false)
		bodyWrapper.classList.remove('body-overflow')
	}
})

const innerStars = Array.from(starsSelect.children)

// stars toggler;

let clicked = -1

function resetStars() {
	innerStars.forEach((s, i) => {
		s.src = s.src.replace('error-star', 'empty-star')
	})
	clicked = -1
}

innerStars.forEach((star, index) => {
	star.addEventListener('click', () => {
		resetStars()
		clicked = index
		innerStars.forEach((s, i) => {
			s.src =
				i <= index
					? s.src.replace('empty-star', 'filled-star')
					: s.src.replace('filled-star', 'empty-star')
		})
	})
})
upload.addEventListener('change', (e) => {
	uploadWrapper.setAttribute('uploaded', true)
	const uploadSrc = URL.createObjectURL(e.target.files[0])
	const image = createThumbnail(uploadSrc)
	uploadWrapper.prepend(image)
})

function createThumbnail(src) {
	const imageWrapper = document.createElement('div')
	uploadWrapper.addEventListener('click', (e) => {
		if (e.target.classList.contains('thumb-button')) {
			const closestImg = e.target
			closestImg.parentElement.style.display = 'none'
		}
	})
	imageWrapper.classList.add('thumb-wrapper')
	const button = document.createElement('button')
	button.setAttribute('type', 'button')
	button.classList.add('thumb-button')
	button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
<rect width="16" height="16" rx="8" fill="#FAFAFA"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.03509 4.16103C4.92178 4.05505 4.7719 3.99735 4.61704 4.00009C4.46218 4.00284 4.31442 4.06581 4.2049 4.17574C4.09538 4.28567 4.03265 4.43397 4.02991 4.58942C4.02718 4.74486 4.08467 4.89529 4.19025 5.00903L7.15516 7.98503L4.19025 10.961C4.13153 11.016 4.08442 11.0822 4.05175 11.1558C4.01908 11.2294 4.00151 11.3089 4.00009 11.3894C3.99868 11.47 4.01344 11.55 4.04351 11.6247C4.07357 11.6994 4.11832 11.7673 4.17508 11.8243C4.23184 11.8812 4.29946 11.9262 4.37389 11.9563C4.44832 11.9865 4.52805 12.0013 4.60831 11.9999C4.68857 11.9985 4.76773 11.9809 4.84105 11.9481C4.91438 11.9153 4.98037 11.868 5.03509 11.809L8 8.83303L10.9649 11.809C11.0196 11.868 11.0856 11.9153 11.1589 11.9481C11.2323 11.9809 11.3114 11.9985 11.3917 11.9999C11.472 12.0013 11.5517 11.9865 11.6261 11.9563C11.7005 11.9262 11.7682 11.8812 11.8249 11.8243C11.8817 11.7673 11.9264 11.6994 11.9565 11.6247C11.9866 11.55 12.0013 11.47 11.9999 11.3894C11.9985 11.3089 11.9809 11.2294 11.9483 11.1558C11.9156 11.0822 11.8685 11.016 11.8097 10.961L8.84484 7.98503L11.8097 5.00903C11.9153 4.89529 11.9728 4.74486 11.9701 4.58942C11.9674 4.43397 11.9046 4.28567 11.7951 4.17574C11.6856 4.06581 11.5378 4.00284 11.383 4.00009C11.2281 3.99735 11.0782 4.05505 10.9649 4.16103L8 7.13703L5.03509 4.16103Z" fill="#333333"/>
</svg>`

	const image = document.createElement('img')
	image.classList.add('upload-thumb')
	image.src = src
	imageWrapper.append(button)
	imageWrapper.append(image)
	return imageWrapper
}

form.addEventListener('submit', (e) => {
	e.preventDefault()
	const inputsToValidate = []
	inputsToValidate.push(e.target.elements.name)
	inputsToValidate.push(e.target.elements.title)
	inputsToValidate.push(e.target.elements.comment)
	const starsArray = Array.from(starsSelect.children)
	const starsState = starsArray.some((item) => {
		return item.src.includes('filled-star')
	})

	if (!starsState) {
		starsArray.forEach((item) => {
			item.src = item.src.replace('empty-star', 'error-star')
			formError.classList.add('form-error--active')
		})
	}
	inputsToValidate.forEach((input) => {
		input.addEventListener('input', (e) => {
			if (e.target.value.length > 0) {
				e.target.setAttribute('error', false)
			} else {
				e.target.setAttribute('error', true)
			}
		})
	})
	const error = inputsToValidate.some((item) => {
		return item.value.length == 0
	})
	if (error | !starsState) {
		formError.classList.add('form-error--active')
		inputsToValidate
			.filter((item) => {
				return item.value.length == 0
			})
			.forEach((error) => {
				console.log(error)
				error.setAttribute('error', true)
			})
	} else {
		formError.classList.remove('form-error--active')

		submitButton.setAttribute('loading', true)
		setTimeout(() => {
			formWrapper.style.display = 'none'
			thankyou.classList.add('thank-you--active')
		}, 1500)
		setTimeout(() => {
			modalForm.setAttribute('visible', false)
			bodyWrapper.classList.remove('body-overflow')
		}, 5000)
	}
})
