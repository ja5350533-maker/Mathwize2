# HoopCourt

Prototipo web de estadísticas de baloncesto (NBA, Mundial FIBA y cualquier otro
equipo/liga) con un armador visual de alineaciones: arrastra jugadores del
plantel a una cancha para probar formaciones.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre la URL que imprime Vite (por defecto `http://localhost:5173`).

`npm run build` genera el build de producción; `npm run preview` lo sirve
localmente.

## Qué usa por debajo

- **[TheSportsDB](https://www.thesportsdb.com/)** (clave de prueba pública `3`,
  sin registro) — motor principal de la app: búsqueda de equipos, plantel con
  foto/posición/nacionalidad/altura, y últimos resultados. Cubre tanto la NBA
  como selecciones nacionales del **FIBA Basketball World Cup** (busca
  `"<País> Basketball"`, ej. `Spain Basketball`, `Argentina Basketball`) y, en
  general, cualquier club de baloncesto que esté en su base de datos.
  - Solo los endpoints de búsqueda/lookup puntual funcionan en el nivel
    gratuito; los endpoints de "listar toda una liga" o "tabla de posiciones"
    exigen un plan de pago, así que la app no depende de ellos: todo parte de
    una búsqueda por nombre.
- **[balldontlie.io](https://www.balldontlie.io/)** (opcional) — promedios de
  temporada más detallados (PTS/REB/AST/STL/BLK/FG%) solo para equipos de la
  NBA. Requiere que cada usuario pegue su propia clave gratuita en el panel de
  Estadísticas; la clave se guarda únicamente en el `localStorage` del
  navegador, nunca se envía a ningún otro sitio. Algunos de sus endpoints de
  estadísticas avanzadas son de pago — si tu plan no los incluye, la app lo
  indica en vez de fallar en silencio.

No hay backend ni base de datos propia: es una app 100% cliente. Las
alineaciones armadas en la cancha se guardan en `localStorage` por equipo
(clave `hoopcourt_lineup_<idEquipo>`), así que persisten entre recargas del
navegador pero no se sincronizan entre dispositivos ni usuarios.

## Estructura

```
src/
  api/
    theSportsDb.ts   — adaptador de TheSportsDB (búsqueda, plantel, resultados)
    ballDontLie.ts   — adaptador opcional de balldontlie.io (promedios NBA)
  components/
    TeamSearch.tsx       — buscador + accesos rápidos NBA / Mundial FIBA
    TeamStatsPanel.tsx   — ficha de equipo, plantel y últimos resultados
    NbaStatsPanel.tsx    — promedios de temporada (requiere clave balldontlie)
    PlayerCard.tsx        — tarjeta de jugador
    CourtBuilder.tsx      — lógica de banca/cancha, drag&drop y persistencia
    BasketballCourt.tsx   — dibujo SVG de la cancha y las 5 posiciones
  types.ts
  App.tsx              — pestañas Estadísticas / Cancha y estado compartido
```

## Armar una alineación

En la pestaña **Cancha**: arrastra un jugador de la banca a una de las cinco
posiciones (Base, Escolta, Alero, Ala-Pívot, Pívot), o tócalo para
seleccionarlo y luego toca la posición — funciona igual en mouse y en
pantallas táctiles. Tocar un jugador ya ubicado lo devuelve a la banca.

## Limitaciones conocidas

- TheSportsDB no tiene estadísticas de juego (puntos, rebotes, etc.) en su
  nivel gratuito fuera de la NBA vía balldontlie — para otras ligas/selecciones
  la app se limita a plantel, datos biográficos y resultados recientes.
- La cobertura de equipos "Mundial FIBA" depende de que TheSportsDB tenga
  cargada la selección buscada; no todos los países están garantizados.
