// GitHub Pages serves 404.html for unknown paths: a copy of the app lets every page address (/Korti/learn/cases/)
// open directly. Prerendering each page (as Krotik does) can replace this later.
import { copyFileSync } from 'node:fs';
copyFileSync('dist/index.html', 'dist/404.html');
