/* Theme switching: persistence, live system updates, and accessible menu control.
   Shared by index.html, privacy.html, and terms.html. */
(function () {
    'use strict';

    var STORAGE_KEY = 'rp-theme';
    var media = window.matchMedia('(prefers-color-scheme: dark)');

    function getStoredPreference() {
        try {
            var value = localStorage.getItem(STORAGE_KEY);
            if (value === 'light' || value === 'dark' || value === 'system') {
                return value;
            }
        } catch (e) {
            /* localStorage unavailable (private mode, disabled storage, etc.) */
        }
        return 'system';
    }

    function setStoredPreference(pref) {
        try {
            localStorage.setItem(STORAGE_KEY, pref);
        } catch (e) {
            /* ignore write failures, theme still applies for this page load */
        }
    }

    function resolveTheme(pref) {
        if (pref === 'light' || pref === 'dark') return pref;
        return media.matches ? 'dark' : 'light';
    }

    var ICONS = { light: 'fa-sun', dark: 'fa-moon' };
    var LABELS = { light: 'Light', dark: 'Dark', system: 'System' };

    function syncInstance(root, resolved, pref) {
        var trigger = root.querySelector('[data-theme-trigger]');
        var menu = root.querySelector('[data-theme-menu]');
        var options = root.querySelectorAll('[data-theme-option]');
        var icon = trigger ? trigger.querySelector('[data-theme-icon]') : null;

        if (icon) {
            icon.classList.remove('fa-sun', 'fa-moon');
            icon.classList.add(ICONS[resolved]);
        }
        if (trigger) {
            trigger.setAttribute(
                'aria-label',
                'Color theme: ' + LABELS[pref] + ' (currently ' + LABELS[resolved] + '). Open theme menu.'
            );
        }
        options.forEach(function (option) {
            var isChecked = option.getAttribute('data-theme-option') === pref;
            option.setAttribute('aria-checked', String(isChecked));
        });
        if (menu && menu.hidden === false && trigger) {
            /* keep menu open state untouched; nothing else to do here */
        }
    }

    function applyTheme(resolved, pref) {
        document.documentElement.setAttribute('data-theme', resolved);
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', resolved === 'dark' ? '#0B1220' : '#F8F9FA');
        }
        document.querySelectorAll('[data-theme-toggle]').forEach(function (root) {
            syncInstance(root, resolved, pref);
        });
    }

    function setPreference(pref) {
        setStoredPreference(pref);
        applyTheme(resolveTheme(pref), pref);
    }

    function closeMenu(root, focusTrigger) {
        var trigger = root.querySelector('[data-theme-trigger]');
        var menu = root.querySelector('[data-theme-menu]');
        if (!trigger || !menu) return;
        menu.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        if (focusTrigger) trigger.focus();
    }

    function openMenu(root) {
        var trigger = root.querySelector('[data-theme-trigger]');
        var menu = root.querySelector('[data-theme-menu]');
        if (!trigger || !menu) return;
        document.querySelectorAll('[data-theme-toggle]').forEach(function (other) {
            if (other !== root) closeMenu(other, false);
        });
        menu.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        var options = Array.prototype.slice.call(menu.querySelectorAll('[data-theme-option]'));
        var checked = options.find(function (o) { return o.getAttribute('aria-checked') === 'true'; });
        (checked || options[0]).focus();
    }

    function isMenuOpen(root) {
        var menu = root.querySelector('[data-theme-menu]');
        return !!menu && !menu.hidden;
    }

    function initInstance(root) {
        var trigger = root.querySelector('[data-theme-trigger]');
        var menu = root.querySelector('[data-theme-menu]');
        if (!trigger || !menu) return;
        var options = Array.prototype.slice.call(menu.querySelectorAll('[data-theme-option]'));

        trigger.addEventListener('click', function () {
            if (isMenuOpen(root)) {
                closeMenu(root, false);
            } else {
                openMenu(root);
            }
        });

        trigger.addEventListener('keydown', function (event) {
            if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openMenu(root);
            }
        });

        options.forEach(function (option, index) {
            option.addEventListener('click', function () {
                setPreference(option.getAttribute('data-theme-option'));
                closeMenu(root, true);
            });
            option.addEventListener('keydown', function (event) {
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.preventDefault();
                    var delta = event.key === 'ArrowDown' ? 1 : -1;
                    var next = options[(index + delta + options.length) % options.length];
                    next.focus();
                } else if (event.key === 'Home') {
                    event.preventDefault();
                    options[0].focus();
                } else if (event.key === 'End') {
                    event.preventDefault();
                    options[options.length - 1].focus();
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    closeMenu(root, true);
                } else if (event.key === 'Tab') {
                    closeMenu(root, false);
                }
            });
        });

        document.addEventListener('click', function (event) {
            if (isMenuOpen(root) && !root.contains(event.target)) {
                closeMenu(root, false);
            }
        });
    }

    document.querySelectorAll('[data-theme-toggle]').forEach(initInstance);

    media.addEventListener('change', function () {
        if (getStoredPreference() === 'system') {
            applyTheme(resolveTheme('system'), 'system');
        }
    });

    /* Sync control UI to the theme the blocking inline script already applied pre-paint. */
    var initialPref = getStoredPreference();
    applyTheme(resolveTheme(initialPref), initialPref);
})();
