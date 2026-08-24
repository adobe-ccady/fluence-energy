import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { BRAND_LOGO, getContentRoot } from '../../scripts/scripts.js';

const isDesktop = window.matchMedia('(min-width: 1024px)');

/**
 * Returns the visible label text of a nav <li>, i.e. the text/anchor that
 * appears before any nested <ul>. Handles bare text (e.g. "Login"), an <a>,
 * or a CMS-wrapped <p>.
 * @param {Element} li
 * @returns {string}
 */
function getItemLabel(li) {
  const anchor = li.querySelector(':scope > a, :scope > p > a');
  if (anchor) return anchor.textContent.trim();
  // Bare text node(s) before the nested <ul>
  let text = '';
  li.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) text += node.textContent;
    else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'UL') text += node.textContent;
  });
  return text.trim();
}

/**
 * Closes every open dropdown / accordion panel in the nav.
 * @param {Element} nav
 */
function closeAllPanels(nav) {
  nav.querySelectorAll('.nav-dropdown-toggle[aria-expanded="true"]').forEach((toggle) => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.closest('.nav-menu-item')?.classList.remove('nav-open');
  });
}

/**
 * Opens or closes the mobile slide-in drawer.
 * @param {Element} nav
 * @param {boolean|null} forceExpanded when set, forces the state
 */
function toggleDrawer(nav, forceExpanded = null) {
  const button = nav.querySelector('.nav-hamburger button');
  const currentlyOpen = nav.getAttribute('aria-expanded') === 'true';
  const open = forceExpanded !== null ? forceExpanded : !currentlyOpen;

  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (button) {
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    button.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  }
  document.body.style.overflowY = open && !isDesktop.matches ? 'hidden' : '';
  if (!open) closeAllPanels(nav);
}

/**
 * Builds a dropdown panel (vertical link list) from a source <li>'s nested <ul>.
 * @param {Element} sourceList the nested <ul>
 * @param {string} panelId
 * @param {string} extraClass optional modifier class
 * @returns {Element}
 */
function buildDropdownPanel(sourceList, panelId, extraClass = '') {
  const panel = document.createElement('div');
  panel.className = `nav-dropdown${extraClass ? ` ${extraClass}` : ''}`;
  panel.id = panelId;

  const list = document.createElement('ul');
  list.className = 'nav-dropdown-list';

  [...sourceList.children].forEach((li) => {
    const srcLink = li.querySelector(':scope > a, :scope > p > a') || li.querySelector('a');
    if (!srcLink) return;
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = srcLink.href;
    link.textContent = srcLink.textContent.trim();
    item.append(link);
    list.append(item);
  });

  panel.append(list);
  return panel;
}

/**
 * Wires desktop hover + click and mobile accordion behaviour on a menu item
 * that has a dropdown.
 * @param {Element} nav
 * @param {Element} menuItem the <li> wrapper
 * @param {Element} toggle the toggle <button>
 * @param {Element} panel the dropdown panel
 */
function wireDropdown(nav, menuItem, toggle, panel) {
  let hoverTimeout;

  const open = () => {
    closeAllPanels(nav);
    toggle.setAttribute('aria-expanded', 'true');
    menuItem.classList.add('nav-open');
  };
  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    menuItem.classList.remove('nav-open');
  };

  // Desktop: hover with a grace period on leave
  menuItem.addEventListener('mouseenter', () => {
    if (!isDesktop.matches) return;
    clearTimeout(hoverTimeout);
    open();
  });
  menuItem.addEventListener('mouseleave', () => {
    if (!isDesktop.matches) return;
    hoverTimeout = setTimeout(close, 200);
  });

  // Click / keyboard toggle (mobile accordion + desktop tap)
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    if (expanded) close();
    else open();
  });

  // Keep panel open while focus is inside it (keyboard nav)
  panel.addEventListener('focusout', (e) => {
    if (isDesktop.matches && !menuItem.contains(e.relatedTarget)) close();
  });
}

/**
 * Builds a menu item (link, plus optional dropdown) from a source nav <li>.
 * @param {Element} nav
 * @param {Element} sourceLi
 * @param {string} idPrefix
 * @param {number} index
 * @param {string} panelModifier extra class for the dropdown panel
 * @returns {Element}
 */
function buildMenuItem(nav, sourceLi, idPrefix, index, panelModifier = '') {
  const menuItem = document.createElement('li');
  menuItem.className = 'nav-menu-item';

  const label = getItemLabel(sourceLi);
  const submenu = sourceLi.querySelector(':scope > ul');
  const sourceAnchor = sourceLi.querySelector(':scope > a, :scope > p > a');

  // Primary link (or plain label span when there is no link, e.g. "Login")
  if (sourceAnchor) {
    const link = document.createElement('a');
    link.href = sourceAnchor.href;
    link.className = 'nav-menu-link';
    link.textContent = label;
    menuItem.append(link);
  } else {
    const span = document.createElement('span');
    span.className = 'nav-menu-label';
    span.textContent = label;
    menuItem.append(span);
  }

  if (submenu) {
    menuItem.classList.add('nav-has-dropdown');
    const panelId = `${idPrefix}-panel-${index}`;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-dropdown-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-haspopup', 'true');
    toggle.setAttribute('aria-controls', panelId);
    toggle.setAttribute('aria-label', `Toggle ${label} submenu`);
    toggle.innerHTML = '<span class="nav-dropdown-icon" aria-hidden="true"></span>';
    menuItem.append(toggle);

    const panel = buildDropdownPanel(submenu, panelId, panelModifier);
    menuItem.append(panel);

    wireDropdown(nav, menuItem, toggle, panel);
  }

  return menuItem;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : `${getContentRoot()}/nav`;
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // The fragment yields three sections: brand, main nav, utility nav.
  const [brandSection, mainSection, utilSection] = nav.children;
  brandSection?.classList.add('nav-brand');
  mainSection?.classList.add('nav-sections');
  utilSection?.classList.add('nav-utility');

  // --- Brand: swap the link content for the logo -------------------------
  if (brandSection) {
    const brandAnchor = brandSection.querySelector('a');
    if (brandAnchor) {
      const labelText = brandAnchor.textContent.trim() || 'Fluence Energy Home';
      brandAnchor.className = 'nav-brand-link';
      brandAnchor.innerHTML = `${BRAND_LOGO}<span class="nav-brand-label">${labelText}</span>`;
      brandAnchor.closest('.button-container')?.classList.remove('button-container');
    }
  }

  // --- Main nav: rebuild as a menu list with dropdowns -------------------
  if (mainSection) {
    const sourceList = mainSection.querySelector('ul');
    const menuList = document.createElement('ul');
    menuList.className = 'nav-menu-list';
    if (sourceList) {
      [...sourceList.children].forEach((li, i) => {
        menuList.append(buildMenuItem(nav, li, 'nav-main', i));
      });
    }
    mainSection.textContent = '';
    const mainNav = document.createElement('nav');
    mainNav.setAttribute('aria-label', 'Primary');
    mainNav.append(menuList);
    mainSection.append(mainNav);
  }

  // --- Utility nav: rebuild as the dark top bar --------------------------
  if (utilSection) {
    const sourceList = utilSection.querySelector('ul');
    const menuList = document.createElement('ul');
    menuList.className = 'nav-utility-list';
    if (sourceList) {
      [...sourceList.children].forEach((li, i) => {
        menuList.append(buildMenuItem(nav, li, 'nav-util', i, 'nav-dropdown-solid'));
      });
    }
    utilSection.textContent = '';
    const utilNav = document.createElement('nav');
    utilNav.setAttribute('aria-label', 'Utility');
    utilNav.append(menuList);
    utilSection.append(utilNav);
  }

  // --- Drawer: holds utility + main nav for the mobile slide-in tray -----
  const drawer = document.createElement('div');
  drawer.className = 'nav-drawer';
  drawer.id = 'nav-drawer';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'nav-drawer-close';
  closeBtn.setAttribute('aria-label', 'Close navigation menu');
  closeBtn.innerHTML = '<span class="nav-drawer-close-icon" aria-hidden="true"></span>';
  closeBtn.addEventListener('click', () => toggleDrawer(nav, false));

  // Order inside drawer: close, main nav, utility (matches mobile source tray)
  if (mainSection) drawer.append(mainSection);
  if (utilSection) drawer.append(utilSection);
  drawer.prepend(closeBtn);
  nav.append(drawer);

  // --- Hamburger toggle (mobile) -----------------------------------------
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav-drawer" aria-expanded="false" aria-label="Open navigation menu">
    <span class="nav-hamburger-icon" aria-hidden="true"></span>
    <span class="nav-hamburger-label">Menu</span>
  </button>`;
  hamburger.querySelector('button').addEventListener('click', () => toggleDrawer(nav));
  // Place hamburger after the brand in the bar
  nav.insertBefore(hamburger, drawer);
  nav.setAttribute('aria-expanded', 'false');

  // --- Global interactions -----------------------------------------------
  // Escape closes panels + drawer
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllPanels(nav);
      if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
        toggleDrawer(nav, false);
        nav.querySelector('.nav-hamburger button')?.focus();
      }
    }
  });

  // Click outside closes desktop dropdowns
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeAllPanels(nav);
  });

  // Reset drawer state on breakpoint change
  isDesktop.addEventListener('change', () => {
    toggleDrawer(nav, false);
    closeAllPanels(nav);
  });

  // Sticky minify on scroll
  const onScroll = () => {
    if (window.scrollY > 60) nav.classList.add('nav-minified');
    else nav.classList.remove('nav-minified');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
