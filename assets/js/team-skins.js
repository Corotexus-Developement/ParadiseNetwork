document.addEventListener('DOMContentLoaded', function() {
  const members = document.querySelectorAll('.team-member');

  function makeSkinHeadUrl(name, size = 100) {
    return `https://minotar.net/helm/${encodeURIComponent(name)}/${size}.png`;
  }

  members.forEach(member => {
    const mcName = (member.dataset.mcname || '').trim() || (member.querySelector('h3') && member.querySelector('h3').textContent.trim());
    if (!mcName) return;

    // create bio button (top-left)
    const bioBtn = document.createElement('button');
    bioBtn.className = 'member-btn bio-btn';
    bioBtn.setAttribute('aria-label', 'Biografie öffnen');
    bioBtn.title = 'Biografie';
    bioBtn.innerHTML = '<span style="font-weight:700;">i</span>';

    // create skin button (top-right) with small head image
    const skinBtn = document.createElement('button');
    skinBtn.className = 'member-btn skin-btn';
    skinBtn.setAttribute('aria-label', 'Minecraft Skin anzeigen');
    skinBtn.title = 'Skin anzeigen';
    const skinIcon = document.createElement('img');
    skinIcon.alt = mcName + ' skin';
    skinIcon.src = makeSkinHeadUrl(mcName, 24);
    skinBtn.appendChild(skinIcon);

    member.appendChild(bioBtn);
    member.appendChild(skinBtn);
    // handle skin toggle with flip animation
    const avatarImg = member.querySelector('img');
    if (avatarImg) {
      // wrap avatar in .avatar-wrap if not already
      let wrap = avatarImg.parentElement;
      if (!wrap || !wrap.classList || !wrap.classList.contains('avatar-wrap')) {
        wrap = document.createElement('div');
        wrap.className = 'avatar-wrap';
        avatarImg.parentNode.insertBefore(wrap, avatarImg);
        wrap.appendChild(avatarImg);
      }
      // ensure img has class 'avatar' for styling
      avatarImg.classList.add('avatar');

      // speicher für bildquellen und eastereggs
      if (!member.dataset.origSrc) member.dataset.origSrc = avatarImg.src;
      // standard auflösung mcskin
      avatarImg.src = makeSkinHeadUrl(mcName, 200);
      member.dataset.skinShown = '1';

      function animateFlip(imgEl, newSrc, duration = 600, onDone) {
        const container = imgEl.parentElement;
        if (!container || container.classList.contains('flipping')) return;
        container.classList.add('flipping');
        imgEl.classList.add('loading');
        const half = Math.floor(duration / 2);
        setTimeout(() => {
          imgEl.src = newSrc;
          imgEl.classList.remove('loading');
        }, half);
        setTimeout(() => {
          container.classList.remove('flipping');
          if (typeof onDone === 'function') onDone();
        }, duration + 10);
      }

      skinBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const skinUrl = makeSkinHeadUrl(mcName, 200);
        if (member.dataset.skinShown === '1') {
          const target = member.dataset.origSrc || skinUrl;
          animateFlip(avatarImg, target, 600, () => { member.dataset.skinShown = '0'; });
        } else {
          // currently showing original -> flip to skin
          animateFlip(avatarImg, skinUrl, 600, () => { member.dataset.skinShown = '1'; });
        }
      });
    }

    // handle bio modal
    bioBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const name = (member.querySelector('h3') && member.querySelector('h3').textContent) || mcName;
      const role = (member.querySelector('.role') && member.querySelector('.role').textContent) || '';
      // prefer explicit data-bio attribute so you can change the modal bio
      const bio = (member.dataset && member.dataset.bio) ? member.dataset.bio : ((member.querySelector('p') && member.querySelector('p').innerHTML) || '');
      const thumbSrc = makeSkinHeadUrl(mcName, 100);

      const overlay = document.createElement('div');
      overlay.className = 'team-modal-overlay';
      overlay.tabIndex = 0;

      const modal = document.createElement('div');
      modal.className = 'team-modal';

      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      const thumbImg = document.createElement('img');
      thumbImg.src = thumbSrc;
      thumbImg.alt = name;
      thumb.appendChild(thumbImg);

      const content = document.createElement('div');
      content.className = 'content';
      const h = document.createElement('h3');
      h.textContent = name;
      const r = document.createElement('div');
      r.className = 'role';
      r.textContent = role;
      const p = document.createElement('div');
      p.className = 'bio-text';
      p.innerHTML = bio;

      const closeBtn = document.createElement('button');
      closeBtn.className = 'close-btn';
      closeBtn.innerHTML = '✕';
      closeBtn.setAttribute('aria-label', 'Schließen');

      const headerWrap = document.createElement('div');
      headerWrap.style.display = 'flex';
      headerWrap.style.alignItems = 'center';
      headerWrap.style.gap = '0.5rem';
      headerWrap.appendChild(h);
      headerWrap.appendChild(closeBtn);

      content.appendChild(headerWrap);
      content.appendChild(r);
      content.appendChild(p);

      modal.appendChild(thumb);
      modal.appendChild(content);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      // accessibility focus
      closeBtn.focus();

      function closeModal() {
        overlay.remove();
      }

      overlay.addEventListener('click', function(ev) {
        if (ev.target === overlay) closeModal();
      });
      closeBtn.addEventListener('click', closeModal);
      overlay.addEventListener('keydown', function(ev) {
        if (ev.key === 'Escape') closeModal();
      });
    });

  });
});
