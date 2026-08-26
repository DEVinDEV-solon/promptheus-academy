<?php
declare(strict_types=1);
/**
 * Adressen für die Academy — der Vertrag zwischen Markup und Router.
 *
 * Drei Beschwerden, eine Ursache: Der Zurück-Knopf führte aus dem Programm,
 * Neuladen warf einen aus dem Kurs auf die Startseite, und einen Kurs konnte
 * man niemandem schicken. Die Academy tauschte ihre Ansichten aus, ohne dass
 * sich die Adresse änderte.
 *
 * **Was hier geprüft wird und was nicht.** Die Logik des Routers steht in
 * JavaScript; PHP kann sie nicht ausführen. Geprüft wird deshalb der Vertrag,
 * an dem sie hängt — dass die Menüpunkte echte Links sind, dass die Pfadleiste
 * da ist, dass route.js vor app.js geladen wird. Genau das sind die Stellen,
 * die beim nächsten Umbau des Markups still wegbrechen würden: Ein
 * `<button>` statt `<a>` sieht im Browser gleich aus und nimmt dem Zurück-Knopf
 * trotzdem die Grundlage.
 */

require_once __DIR__ . '/hilfe.php';
require_once __DIR__ . '/../lib.php';

$html  = (string)file_get_contents(PU_ROOT . '/index.php');
$route = (string)file_get_contents(PU_ROOT . '/assets/js/route.js');
$app   = (string)file_get_contents(PU_ROOT . '/assets/js/app.js');
$css   = (string)file_get_contents(PU_ROOT . '/assets/css/promptheus.css');

gruppe('Die Menüpunkte sind echte Links');

// Der eigentliche Punkt. Ein Knopf, der eine Ansicht austauscht, sieht aus wie
// Navigation und ist keine.
foreach (['lernen', 'fortschritt', 'tutor', 'tokenicer', 'klasse', 'cockpit'] as $a) {
    pruefe('„' . $a . '" hängt an einer Adresse',
           str_contains($html, 'href="#/' . $a . '"'), $a);
}

pruefe('kein Menüpunkt ist mehr ein Knopf',
       !preg_match('/<button class="menue-knopf"/', $html));

pruefe('die Wortmarke führt auch nach Hause',
       preg_match('/<a class="marke" href="#\/lernen"/', $html) === 1);

gruppe('Die Pfadleiste steht im Markup');

pruefe('es gibt sie', str_contains($html, 'id="pfadleiste"'));
pruefe('sie steht in #haupt und damit über den Ansichten',
       strpos($html, 'id="pfadleiste"') > strpos($html, '<main id="haupt">')
    && strpos($html, 'id="pfadleiste"') < strpos($html, 'id="view-lernen"'));

gruppe('Die Reihenfolge der Skripte');

// route.js muss vor app.js stehen: pu_wechsel() ruft den Router, sobald die
// erste Ansicht erscheint. Andersherum wäre der erste Wechsel ohne Adresse.
pruefe('route.js kommt vor app.js',
       strpos($html, 'assets/js/route.js') < strpos($html, 'assets/js/app.js'));
pruefe('PU.start() kommt nach beiden',
       strpos($html, 'PU.start()') > strpos($html, 'assets/js/app.js'));

gruppe('Der Router wird auch benutzt');

pruefe('wechsel() zieht die Adresse nach',  str_contains($app, 'PU.routeSchreiben'));
pruefe('wechsel() füllt die Pfadleiste',    str_contains($app, 'PU.pfadAusRoute'));
pruefe('wechsel() meldet Erfolg zurück',    str_contains($app, 'return false;'));
pruefe('der Start folgt der Adresse statt fest auf „lernen" zu springen',
       str_contains($app, 'PU.routeStart()') && !preg_match('/PU\.start = [\s\S]*PU\.wechsel\(.lernen.\);\n\};/', $app));

pruefe('Links im Menü bekommen keinen Klickhorcher mehr',
       str_contains($app, "el.tagName === 'A'"));

gruppe('Der Router selbst');

pruefe('kennt alle sechs Ansichten',
       str_contains($route, "'lernen', 'fortschritt', 'tutor', 'tokenicer', 'klasse', 'cockpit'"));
pruefe('kennt die drei Orte im Lernbereich',
       str_contains($route, 'kurs:') && str_contains($route, 'lektion:')
       && str_contains($route, 'pruefung:'));
pruefe('horcht auf hashchange',   str_contains($route, "'hashchange'"));
pruefe('hat einen Zurück-Knopf',  str_contains($route, 'history.back()'));

// Ohne diesen Vergleich legte jeder Aufruf einen weiteren gleichen Eintrag im
// Verlauf an — der Zurück-Knopf müsste dann fünfmal durch dieselbe Seite.
pruefe('schreibt nur, wenn sich die Adresse unterscheidet',
       str_contains($route, 'if (location.hash === soll) return;'));

gruppe('Die Pfadleiste hat Farben');

pruefe('.pfadleiste ist gestaltet', str_contains($css, '.pfadleiste {'));
pruefe('.pfad-zurueck ist gestaltet', str_contains($css, '.pfad-zurueck {'));
pruefe('die alte .brotkrume ist weg — sonst gäbe es zwei',
       !str_contains($css, '.brotkrume {'));

gruppe('Menüpunkte vertragen sich als Anker');

// Ein Anker bringt Unterstreichung und ein anderes Kastenmodell mit als ein
// Knopf. Ohne diese zwei Zeilen sähe das Menü nach dem Umbau anders aus.
pruefe('keine Unterstreichung',
       preg_match('/\.menue-knopf \{[^}]*text-decoration: none/s', $css) === 1);
pruefe('Kastenmodell gesetzt',
       preg_match('/\.menue-knopf \{[^}]*box-sizing: border-box/s', $css) === 1);
pruefe('die Wortmarke ebenso',
       preg_match('/\.marke \{[^}]*text-decoration: none/s', $css) === 1);

bilanz();
