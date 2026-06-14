document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const modal = document.getElementById('project-modal');
    const closeBtn = document.querySelector('.close-button');
    const viewerContainer = document.getElementById('viewer-container');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');

    // Renderowanie kart projektów
    function renderGallery() {
        gallery.innerHTML = '';
        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <img src="${project.thumbnail}" alt="${project.title}" class="thumbnail">
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                </div>
            `;
            card.addEventListener('click', () => openProject(project));
            gallery.appendChild(card);
        });
    }

    // Otwieranie projektu w modalu
    function openProject(project) {
        modalTitle.innerText = project.title;
        modalDescription.innerText = project.description;
        viewerContainer.innerHTML = `<iframe src="${project.file}" allowtransparency="true" width="485" height="402" frameborder="0" scrolling="no" allowfullscreen></iframe>`;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Wyłączenie przewijania strony
    }

    // Zamykanie modalu
    function closeModal() {
        modal.style.display = 'none';
        viewerContainer.innerHTML = ''; // Zatrzymanie gry
        document.body.style.overflow = 'auto';
    }

    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    renderGallery();
});
